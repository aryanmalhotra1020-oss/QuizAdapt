from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Subject

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/', methods=['GET'])
@jwt_required()
def get_subjects():
    user_id = get_jwt_identity()
    subjects = Subject.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'created_at': s.created_at
    } for s in subjects]), 200

@subjects_bp.route('/', methods=['POST'])
@jwt_required()
def create_subject():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Subject name is required'}), 400

    subject = Subject(user_id=user_id, name=name)
    db.session.add(subject)
    db.session.commit()

    return jsonify({'message': 'Subject created', 'id': subject.id}), 201


@subjects_bp.route('/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subject(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
    return jsonify({
        'id': subject.id,
        'name': subject.name,
        'created_at': subject.created_at
    }), 200