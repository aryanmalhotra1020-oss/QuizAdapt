from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Subject
from datetime import datetime, timezone

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/', methods=['GET'])
@jwt_required()
def get_subjects():
    user_id = get_jwt_identity()
    subjects = Subject.query.filter_by(user_id=user_id) \
        .order_by(Subject.last_accessed_at.desc()) \
        .all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'description': s.description,
        'status': s.status,
        'created_at': s.created_at,
        'last_accessed_at': s.last_accessed_at
    } for s in subjects]), 200

@subjects_bp.route('/last-accessed', methods=['GET'])
@jwt_required()
def get_last_accessed_subject():
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(user_id=user_id) \
        .order_by(Subject.last_accessed_at.desc()) \
        .first()

    if not subject:
        return jsonify({'subject': None}), 200

    return jsonify({
        'subject': {
            'id': subject.id,
            'name': subject.name,
            'status': subject.status
        }
    }), 200

@subjects_bp.route('/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subject(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    subject.last_accessed_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        'id': subject.id,
        'name': subject.name,
        'created_at': subject.created_at,
        'last_accessed_at': subject.last_accessed_at
    }), 200

@subjects_bp.route('/', methods=['POST'])
@jwt_required()
def create_subject():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')

    if not name:
        return jsonify({'error': 'Subject name is required'}), 400

    subject = Subject(user_id=user_id, name=name, description=description, status='pending_diagnostic')
    db.session.add(subject)
    db.session.commit()

    return jsonify({'message': 'Subject created', 'id': subject.id, 'status': subject.status}), 201

@subjects_bp.route('/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    db.session.delete(subject)
    db.session.commit()
    return jsonify({'message': 'Subject deleted'}), 200