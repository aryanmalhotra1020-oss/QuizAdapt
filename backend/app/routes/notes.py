from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Note, Topic, Subject
from keybert import KeyBERT

notes_bp = Blueprint('notes', __name__)
kw_model = KeyBERT()

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

    # Save note
    note = Note(subject_id=subject_id, filename=file.filename, raw_text=raw_text)
    db.session.add(note)
    db.session.commit()

    # Extract topics using KeyBERT
    keywords = kw_model.extract_keywords(
        raw_text,
        keyphrase_ngram_range=(1, 2),
        stop_words='english',
        top_n=10
    )

    # Save topics to database
    for keyword, score in keywords:
        topic = Topic(
            note_id=note.id,
            subject_id=subject_id,
            topic_name=keyword
        )
        db.session.add(topic)
    db.session.commit()

    return jsonify({
        'message': 'Note uploaded and topics extracted',
        'note_id': note.id,
        'topics': [keyword for keyword, score in keywords]
    }), 201

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

@notes_bp.route('/<int:subject_id>/topics', methods=['GET'])
@jwt_required()
def get_topics(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()

    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    topics = Topic.query.filter_by(subject_id=subject_id).all()
    return jsonify([{
        'id': t.id,
        'topic_name': t.topic_name,
        'note_id': t.note_id
    } for t in topics]), 200