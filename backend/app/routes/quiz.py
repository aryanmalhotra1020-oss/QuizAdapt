from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Quiz, Question, Attempt, Answer, TopicPerformance

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_quizzes(subject_id):
    quizzes = Quiz.query.filter_by(subject_id=subject_id).all()
    return jsonify([{
        'id': q.id,
        'type': q.type,
        'created_at': q.created_at
    } for q in quizzes]), 200