from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Note, Topic, Subject

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/<int:subject_id>', methods=['POST'])
@jwt_required()
def upload_note(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()

    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    raw_text = file.read().decode('utf-8', errors='ignore')

    note = Note(subject_id=subject_id, filename=file.filename, raw_text=raw_text)
    db.session.add(note)
    db.session.commit()

    return jsonify({'message': 'Note uploaded', 'note_id': note.id}), 201

@notes_bp.route('/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_notes(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()

    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    notes = Note.query.filter_by(subject_id=subject_id).all()
    return jsonify([{
        'id': n.id,
        'filename': n.filename,
        'uploaded_at': n.uploaded_at
    } for n in notes]), 200