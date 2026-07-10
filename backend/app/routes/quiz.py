from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Quiz, Question, Attempt, Answer, Topic, Note, TopicPerformance, Subject
from app.services import generate_mcq_question, score_answer, is_malformed_question
import random
from app.bkt import BKTModel
from app.services import generate_question_for_topic, score_answer, generate_mcq_options
import json
import traceback

quiz_bp = Blueprint('quiz', __name__)

def score_question_answer(question, user_answer):
    if question.question_type == 'mcq':
        is_correct = user_answer.strip() == question.correct_answer.strip()
        score = 1.0 if is_correct else 0.0
        return score, is_correct
    return score_answer(user_answer, question.correct_answer)

@quiz_bp.route('/generate/<int:subject_id>', methods=['POST'])
@jwt_required()
def generate_quiz(subject_id):
    user_id = get_jwt_identity()
    bkt = BKTModel()

    # Get all topics for this subject
    topics = Topic.query.filter_by(subject_id=subject_id).all()
    if not topics:
        return jsonify({'error': 'No topics found. Please upload notes first.'}), 400

    # Get most recent note
    note = Note.query.filter_by(subject_id=subject_id).order_by(Note.id.desc()).first()
    if not note:
        return jsonify({'error': 'No notes found for this subject.'}), 400

    # Get topic performance scores
    performances = {
        p.topic_id: p.strength_score
        for p in TopicPerformance.query.filter_by(
            user_id=user_id,
            subject_id=subject_id
        ).all()
    }

    # Classify topics as weak, moderate or strong
    weak_topics = []
    moderate_topics = []
    strong_topics = []

    for topic in topics:
        score = performances.get(topic.id, bkt.p_know)
        classification = bkt.classify(score)
        if classification == 'weak':
            weak_topics.append(topic)
        elif classification == 'moderate':
            moderate_topics.append(topic)
        else:
            strong_topics.append(topic)

    # Build adaptive question pool:
    # 50% weak topics, 30% moderate, 20% strong (revision)
    selected_topics = []
    selected_topics += random.sample(weak_topics, min(5, len(weak_topics)))
    selected_topics += random.sample(moderate_topics, min(3, len(moderate_topics)))
    selected_topics += random.sample(strong_topics, min(2, len(strong_topics)))

    # If not enough topics, fill with whatever is available
    if len(selected_topics) < 5:
        remaining = [t for t in topics if t not in selected_topics]
        selected_topics += random.sample(remaining, min(5 - len(selected_topics), len(remaining)))

    # Determine quiz type
    quiz_type = 'adaptive' if performances else 'initial'

    # Create quiz
    quiz = Quiz(subject_id=subject_id, type=quiz_type)
    db.session.add(quiz)
    db.session.commit()

    # Generate questions
    questions_generated = []
    for topic in selected_topics:
        try:
            other_topic_names = [t.topic_name for t in topics if t.id != topic.id]
            mcq = generate_mcq_question(note.raw_text, topic.topic_name, other_topic_names)

            question = Question(
                quiz_id=quiz.id,
                topic_id=topic.id,
                question_text=mcq['question_text'],
                correct_answer=mcq['correct_answer'],
                question_type='mcq',
                options=json.dumps(mcq['options'])
            )
            db.session.add(question)
            db.session.commit()
            questions_generated.append({
                'id': question.id,
                'question_text': mcq['question_text'],
                'topic': topic.topic_name,
                'classification': bkt.classify(performances.get(topic.id, bkt.p_know)),
                'question_type': 'mcq',
                'options': mcq['options']
            })
        except Exception as e:
            print(f"Error generating question for topic {topic.topic_name}: {e}")
            continue

    return jsonify({
        'quiz_id': quiz.id,
        'type': quiz_type,
        'questions': questions_generated,
        'breakdown': {
            'weak': len(weak_topics),
            'moderate': len(moderate_topics),
            'strong': len(strong_topics)
        }
    }), 201

@quiz_bp.route('/diagnostic/<int:subject_id>', methods=['POST'])
@jwt_required()
def generate_diagnostic(subject_id):
    user_id = get_jwt_identity()

    # Get all topics for this subject
    topics = Topic.query.filter_by(subject_id=subject_id).all()
    if not topics:
        return jsonify({'error': 'No topics found'}), 400

    # Get most recent note
    note = Note.query.filter_by(subject_id=subject_id).order_by(Note.id.desc()).first()
    if not note:
        return jsonify({'error': 'No notes found'}), 400

    # Create diagnostic quiz
    quiz = Quiz(subject_id=subject_id, type='diagnostic')
    db.session.add(quiz)
    db.session.commit()

    diagnostic_topics = random.sample(topics, min(5, len(topics)))
    questions_generated = []

    for topic in diagnostic_topics:
        try:
            other_topic_names = [t.topic_name for t in topics if t.id != topic.id]
            mcq = generate_mcq_question(note.raw_text, topic.topic_name, other_topic_names)

            question = Question(
                quiz_id=quiz.id,
                topic_id=topic.id,
                question_text=mcq['question_text'],
                correct_answer=mcq['correct_answer'],
                question_type='mcq',
                options=json.dumps(mcq['options'])
            )
            db.session.add(question)
            db.session.commit()
            questions_generated.append({
                'id': question.id,
                'question_text': mcq['question_text'],
                'topic': topic.topic_name,
                'topic_id': topic.id,
                'question_type': 'mcq',
                'options': mcq['options']
            })
        except Exception as e:
            print(f"Error generating diagnostic question: {e}")
            traceback.print_exc()
            continue

    return jsonify({
        'quiz_id': quiz.id,
        'type': 'diagnostic',
        'questions': questions_generated
    }), 201

@quiz_bp.route('/diagnostic/submit/<int:quiz_id>', methods=['POST'])
@jwt_required()
def submit_diagnostic(quiz_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    answers = data.get('answers', [])

    quiz = Quiz.query.get_or_404(quiz_id)

    # Create attempt
    attempt = Attempt(quiz_id=quiz_id, user_id=user_id)
    db.session.add(attempt)
    db.session.commit()

    # Process answers and initialise topic performance
    results = []
    for ans in answers:
        question = Question.query.get(ans['question_id'])
        if not question:
            continue

        score, is_correct = score_question_answer(question, ans['answer'])

        answer = Answer(
            attempt_id=attempt.id,
            question_id=question.id,
            user_answer=ans['answer'],
            is_correct=is_correct,
            score=score
        )
        db.session.add(answer)

        # Initialise or update topic performance based on diagnostic result
        existing = TopicPerformance.query.filter_by(
            user_id=user_id,
            subject_id=quiz.subject_id,
            topic_id=question.topic_id
        ).first()

        if existing:
            existing.strength_score = score
        else:
            perf = TopicPerformance(
                user_id=user_id,
                subject_id=quiz.subject_id,
                topic_id=question.topic_id,
                strength_score=score
            )
            db.session.add(perf)

        results.append({
            'question_id': question.id,
            'topic_id': question.topic_id,
            'user_answer': ans['answer'],
            'is_correct': is_correct,
            'correct_answer': question.correct_answer
        })

    # Mark the subject as fully onboarded now that diagnostic is complete
    subject = Subject.query.get(quiz.subject_id)
    if subject:
        subject.status = 'active'

    db.session.commit()

    return jsonify({
        'attempt_id': attempt.id,
        'results': results,
        'message': 'Diagnostic complete! Your knowledge baseline has been set.'
    }), 201


@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify({
        'quiz_id': quiz.id,
        'type': quiz.type,
        'subject_id': quiz.subject_id,
        'questions': [{
            'id': q.id,
            'question_text': q.question_text,
            'topic': q.topic_id,
            'question_type': q.question_type,
            'options': json.loads(q.options) if q.options else None
        } for q in questions]
    }), 200


@quiz_bp.route('/attempt/<int:quiz_id>', methods=['POST'])
@jwt_required()
def submit_attempt(quiz_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    answers = data.get('answers', [])

    quiz = Quiz.query.get_or_404(quiz_id)
    bkt = BKTModel()

    # Create attempt
    attempt = Attempt(quiz_id=quiz_id, user_id=user_id)
    db.session.add(attempt)
    db.session.commit()

    results = []
    for ans in answers:
        question = Question.query.get(ans['question_id'])
        if not question:
            continue

        score, is_correct = score_question_answer(question, ans['answer'])

        answer = Answer(
            attempt_id=attempt.id,
            question_id=question.id,
            user_answer=ans['answer'],
            is_correct=is_correct,
            score=score
        )
        db.session.add(answer)

        # Update topic performance using BKT online learning
        if question.topic_id:
            existing = TopicPerformance.query.filter_by(
                user_id=user_id,
                subject_id=quiz.subject_id,
                topic_id=question.topic_id
            ).first()

            if existing:
                # Update existing knowledge score using BKT
                updated_score = bkt.update(existing.strength_score, is_correct)
                existing.strength_score = updated_score
                existing.updated_at = db.func.now()
            else:
                # First time seeing this topic — initialise with BKT
                initial_score = bkt.update(bkt.p_know, is_correct)
                perf = TopicPerformance(
                    user_id=user_id,
                    subject_id=quiz.subject_id,
                    topic_id=question.topic_id,
                    strength_score=initial_score
                )
                db.session.add(perf)

        results.append({
            'question_id': question.id,
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'topic_id': question.topic_id
        })

    db.session.commit()

    return jsonify({
        'attempt_id': attempt.id,
        'results': results
    }), 201

@quiz_bp.route('/results/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subjects():
    quizzes = Quiz.query.filter_by(subject_id=subject_id).all()
    return jsonify([{
        'id': q.id,
        'type': q.type,
        'created_at': q.created_at
    } for q in quizzes]), 200

@quiz_bp.route('/performance/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_performance(subject_id):
    user_id = get_jwt_identity()
    bkt = BKTModel()

    # Get all topic performances for this subject
    performances = TopicPerformance.query.filter_by(
        user_id=user_id,
        subject_id=subject_id
    ).all()

    # Get all quiz attempts for this subject
    quizzes = Quiz.query.filter_by(subject_id=subject_id).all()
    quiz_history = []

    for quiz in quizzes:
        attempt = Attempt.query.filter_by(
            quiz_id=quiz.id,
            user_id=user_id
        ).first()

        if attempt:
            answers = Answer.query.filter_by(attempt_id=attempt.id).all()
            correct = sum(1 for a in answers if a.is_correct)
            total = len(answers)
            quiz_history.append({
                'quiz_id': quiz.id,
                'type': quiz.type,
                'score': f"{correct}/{total}",
                'percentage': round(correct / total * 100) if total > 0 else 0,
                'created_at': quiz.created_at
            })

    # Build performance breakdown
    topic_breakdown = []
    for p in performances:
        topic = Topic.query.get(p.topic_id)
        if topic:
            topic_breakdown.append({
                'topic_id': p.topic_id,
                'topic_name': topic.topic_name,
                'strength_score': p.strength_score,
                'classification': bkt.classify(p.strength_score),
                'updated_at': p.updated_at
            })

    # Sort by strength score
    topic_breakdown.sort(key=lambda x: x['strength_score'])

    weak = [t for t in topic_breakdown if t['classification'] == 'weak']
    moderate = [t for t in topic_breakdown if t['classification'] == 'moderate']
    strong = [t for t in topic_breakdown if t['classification'] == 'strong']

    return jsonify({
        'topic_breakdown': topic_breakdown,
        'weak': weak,
        'moderate': moderate,
        'strong': strong,
        'quiz_history': quiz_history,
        'summary': {
            'total_topics': len(topic_breakdown),
            'weak_count': len(weak),
            'moderate_count': len(moderate),
            'strong_count': len(strong),
            'total_quizzes': len(quiz_history)
        }
    }), 200