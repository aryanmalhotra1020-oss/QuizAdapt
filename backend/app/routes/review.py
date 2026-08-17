from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app import db
from app.models import Topic, Note, TopicPerformance, ReviewSchedule
from app.services import generate_mcq_question
from app.bkt import BKTModel
from app.spaced_repetition import score_to_quality, sm2_update, apply_forgetting_curve

review_bp = Blueprint('review', __name__)

@review_bp.route('/due/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_due_reviews(subject_id):
    user_id = get_jwt_identity()

    notes_exist = Note.query.filter_by(subject_id=subject_id).first()
    if not notes_exist:
        return jsonify({'error': 'No notes found for this subject.'}), 400

    now = datetime.now(timezone.utc)
    note_cache = {}

    all_topics = Topic.query.filter_by(subject_id=subject_id).all()
    all_topic_names = [t.topic_name for t in all_topics]

    def get_note_for_topic(topic):
        if topic.note_id not in note_cache:
            note_cache[topic.note_id] = Note.query.get(topic.note_id)
        return note_cache[topic.note_id]

    def build_mcq_item(topic, note, extra_fields):
        other_topic_names = [t for t in all_topic_names if t != topic.topic_name]
        try:
            result = generate_mcq_question(note.raw_text, topic.topic_name, other_topic_names)
        except Exception as e:
            print(f"Error generating review question for topic {topic.topic_name}: {e}")
            return None
        if result is None:
            return None
        item = {
            'topic_id': topic.id,
            'topic_name': topic.topic_name,
            'question_text': result['question_text'],
            'options': result['options'],
            'correct_answer': result['correct_answer'],
        }
        item.update(extra_fields)
        return item

    due_schedules = ReviewSchedule.query.filter(
        ReviewSchedule.user_id == user_id,
        ReviewSchedule.subject_id == subject_id,
        ReviewSchedule.next_review_date <= now
    ).all()

    scheduled_topic_ids = {s.topic_id for s in due_schedules}
    performances = TopicPerformance.query.filter_by(
        user_id=user_id,
        subject_id=subject_id
    ).all()

    unscheduled_due = [
        p for p in performances
        if p.topic_id not in scheduled_topic_ids and
        not ReviewSchedule.query.filter_by(user_id=user_id, topic_id=p.topic_id).first()
    ]

    due_items = []

    for schedule in due_schedules:
        topic = Topic.query.get(schedule.topic_id)
        if not topic:
            continue
        note = get_note_for_topic(topic)
        if not note:
            continue

        perf = TopicPerformance.query.filter_by(
            user_id=user_id, subject_id=subject_id, topic_id=topic.id
        ).first()
        decayed_score = apply_forgetting_curve(
            perf.strength_score if perf else 0.5,
            schedule.last_reviewed_at
        )

        item = build_mcq_item(topic, note, {
            'review_id': schedule.id,
            'current_strength': round(decayed_score, 3),
            'repetitions': schedule.repetitions,
            'interval_days': schedule.interval_days
        })
        if item:
            due_items.append(item)

    for perf in unscheduled_due:
        topic = Topic.query.get(perf.topic_id)
        if not topic:
            continue
        note = get_note_for_topic(topic)
        if not note:
            continue

        item = build_mcq_item(topic, note, {
            'review_id': None,
            'current_strength': round(perf.strength_score, 3),
            'repetitions': 0,
            'interval_days': 0
        })
        if item:
            due_items.append(item)

    return jsonify({
        'subject_id': subject_id,
        'due_count': len(due_items),
        'due_items': due_items
    }), 200

@review_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_review():
    user_id = get_jwt_identity()
    data = request.get_json()

    subject_id = data.get('subject_id')
    topic_id = data.get('topic_id')
    user_answer = data.get('answer')
    correct_answer = data.get('correct_answer')

    if not all([subject_id, topic_id, user_answer, correct_answer]):
        return jsonify({'error': 'Missing required fields.'}), 400

    is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
    score = 1.0 if is_correct else 0.0
    quality = score_to_quality(score)

    schedule = ReviewSchedule.query.filter_by(
        user_id=user_id, topic_id=topic_id
    ).first()

    if schedule:
        new_ef, new_interval, new_reps, next_date = sm2_update(
            schedule.easiness_factor,
            schedule.interval_days,
            schedule.repetitions,
            quality
        )
        schedule.easiness_factor = new_ef
        schedule.interval_days = new_interval
        schedule.repetitions = new_reps
        schedule.next_review_date = next_date
        schedule.last_reviewed_at = datetime.now(timezone.utc)
        schedule.updated_at = datetime.now(timezone.utc)
    else:
        new_ef, new_interval, new_reps, next_date = sm2_update(2.5, 1, 0, quality)
        schedule = ReviewSchedule(
            user_id=user_id,
            subject_id=subject_id,
            topic_id=topic_id,
            easiness_factor=new_ef,
            interval_days=new_interval,
            repetitions=new_reps,
            next_review_date=next_date,
            last_reviewed_at=datetime.now(timezone.utc)
        )
        db.session.add(schedule)

    # Decay BKT score for elapsed time, then update with this attempt's result
    bkt = BKTModel()
    perf = TopicPerformance.query.filter_by(
        user_id=user_id, subject_id=subject_id, topic_id=topic_id
    ).first()

    if perf:
        decayed_score = apply_forgetting_curve(perf.strength_score, perf.updated_at)
        perf.strength_score = bkt.update(decayed_score, is_correct)
        perf.updated_at = datetime.now(timezone.utc)
    else:
        perf = TopicPerformance(
            user_id=user_id,
            subject_id=subject_id,
            topic_id=topic_id,
            strength_score=bkt.update(bkt.p_know, is_correct)
        )
        db.session.add(perf)

    db.session.commit()

    return jsonify({
        'topic_id': topic_id,
        'is_correct': is_correct,
        'score': score,
        'quality': quality,
        'next_review_date': schedule.next_review_date,
        'interval_days': schedule.interval_days,
        'repetitions': schedule.repetitions,
        'updated_strength': round(perf.strength_score, 3)
    }), 200