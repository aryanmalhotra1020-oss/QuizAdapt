from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Quiz, Question, Attempt, Answer, Topic, Note, TopicPerformance
from app.services import generate_question_for_topic
import random

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/generate/<int:subject_id>', methods=['POST'])
@jwt_required()
def generate_quiz(subject_id):
    user_id = get_jwt_identity()

    # Get all topics for this subject
    topics = Topic.query.filter_by(subject_id=subject_id).all()
    if not topics:
        return jsonify({'error': 'No topics found. Please upload notes first.'}), 400

    # Get the raw text from the most recent note
    note = Note.query.filter_by(subject_id=subject_id).order_by(Note.id.desc()).first()
    if not note:
        return jsonify({'error': 'No notes found for this subject.'}), 400

    # Create a new quiz
    quiz = Quiz(subject_id=subject_id, type='adaptive')
    db.session.add(quiz)
    db.session.commit()

    # Generate one question per topic (up to 10)
    questions_generated = []
    for topic in topics[:10]:
        try:
            question_text = generate_question_for_topic(note.raw_text, topic.topic_name)
            question = Question(
                quiz_id=quiz.id,
                topic_id=topic.id,
                question_text=question_text,
                correct_answer=topic.topic_name
            )
            db.session.add(question)
            questions_generated.append({
                'id': question.id,
                'question_text': question_text,
                'topic': topic.topic_name
            })
        except Exception as e:
            print(f"Error generating question for topic {topic.topic_name}: {e}")
            continue

    db.session.commit()

    return jsonify({
        'quiz_id': quiz.id,
        'questions': questions_generated
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
            question_text = generate_question_for_topic(note.raw_text, topic.topic_name)
            question = Question(
                quiz_id=quiz.id,
                topic_id=topic.id,
                question_text=question_text,
                correct_answer=topic.topic_name
            )
            db.session.add(question)
            db.session.commit()
            questions_generated.append({
                'id': question.id,
                'question_text': question_text,
                'topic': topic.topic_name,
                'topic_id': topic.id
            })
        except Exception as e:
            print(f"Error generating diagnostic question: {e}")
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

        is_correct = ans['answer'].strip().lower() in question.correct_answer.strip().lower()
        score = 1.0 if is_correct else 0.0

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
            'is_correct': is_correct,
            'correct_answer': question.correct_answer
        })

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
        'questions': [{
            'id': q.id,
            'question_text': q.question_text,
            'topic': q.topic_id
        } for q in questions]
    }), 200

@quiz_bp.route('/attempt/<int:quiz_id>', methods=['POST'])
@jwt_required()
def submit_attempt(quiz_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    answers = data.get('answers', [])

    # Create attempt
    attempt = Attempt(quiz_id=quiz_id, user_id=user_id)
    db.session.add(attempt)
    db.session.commit()

    # Store each answer
    results = []
    for ans in answers:
        question = Question.query.get(ans['question_id'])
        if not question:
            continue

        # Simple exact match for now (semantic similarity in Week 7)
        is_correct = ans['answer'].strip().lower() in question.correct_answer.strip().lower()
        score = 1.0 if is_correct else 0.0

        answer = Answer(
            attempt_id=attempt.id,
            question_id=question.id,
            user_answer=ans['answer'],
            is_correct=is_correct,
            score=score
        )
        db.session.add(answer)
        results.append({
            'question_id': question.id,
            'is_correct': is_correct,
            'correct_answer': question.correct_answer
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