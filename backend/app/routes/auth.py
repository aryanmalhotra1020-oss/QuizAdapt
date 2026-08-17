from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from app import db
from app.models import User, Subject, Quiz, Attempt, Answer
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'is_admin': user.is_admin
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error':'User not found'}), 404

    subjects = Subject.query.filter_by(user_id=user.id).all()
    subject_ids = [s.id for s in subjects]

    total_quizzes = 0
    correct_answers = 0
    total_answers = 0

    if subject_ids:
        quiz_ids = [q.id for q in Quiz.query.filter(Quiz.subject_id.in_(subject_ids)).all()]
        if quiz_ids:
            attempts = Attempt.query.filter(Attempt.user_id == user_id, Attempt.quiz_id.in_(quiz_ids)).all()
            total_quizzes = len(attempts)
            attempt_ids = [a.id for a in attempts]
            if attempt_ids:
                answers = Answer.query.filter(Answer.attempt_id.in_(attempt_ids)).all()
                total_answers = len(answers)
                correct_answers = sum(1 for a in answers if a.is_correct)

    avg_score = round((correct_answers / total_answers) * 100) if total_answers else 0

    return jsonify({
        'name': user.name,
        'email': user.email,
        'is_admin': user.is_admin,
        'created_at': user.created_at,
        'stats': {
            'total_subjects': len(subjects),
            'total_quizzes': total_quizzes,
            'average_score': avg_score
        }
    }), 200

