import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Note, Topic, Subject, User, Summary
from keybert import KeyBERT
import fitz
from app.services import embed_texts, extract_summary_sentences, generate_abstractive_summary
import torch.nn.functional as F
import spacy
import json as json_module
from sqlalchemy.exc import IntegrityError


notes_bp = Blueprint('notes', __name__)
kw_model = KeyBERT()

# ============== Filtering Unwanted Topics and Words ==============

_VALID_TOPIC_PATTERN = re.compile(r"^[A-Za-z0-9\s\-']+$")

def filter_symbol_contaminated_topics(keywords):
    return [(kw, score) for kw, score in keywords if _VALID_TOPIC_PATTERN.match(kw)]

ADMIN_PAGE_KEYWORDS = {
    'attendance', 'module team', 'teaching staff', 'office hours', 'canvas',
    'weekly structure', 'learning outcome', 'about the module',
    'expectations', 'further reading', 'feedback', 'outline for today',
    'any questions', 'module material', 'basic information', 'forms.office.com',
    'university credentials', 'recommended reading', 'library resource',
    'associate professor', 'department of computer science', 'assistant professor',
    'what this module will cover', 'module organization', 'assessment distribution',
    'recommended textbook', 'free online course', 'programming environment',
    'pre-requisite', 'prerequisite', 'module plan', 'module lead',
}

_URL_EMAIL_PATTERN = re.compile(r'(https?://\S+|www\.\S+|\S+@\S+\.\S+)')

def is_admin_page(page_text):
    lower = page_text.lower()
    if any(kw in lower for kw in ADMIN_PAGE_KEYWORDS):
        return True
    if _URL_EMAIL_PATTERN.search(page_text):
        return True
    return False

def filter_admin_pages(pages_text):
    filtered = [p for p in pages_text if not is_admin_page(p)]
    if len(filtered) < max(1, len(pages_text) * 0.3):
        return pages_text
    return filtered

def filter_numeric_topics(keywords, max_digit_ratio=0.4):
    filtered = []
    for kw, score in keywords:
        digit_count = sum(1 for c in kw if c.isdigit())
        if len(kw) > 0 and (digit_count / len(kw)) > max_digit_ratio:
            continue
        filtered.append((kw, score))
    return filtered

def strip_repeated_boilerplate(pages_text, min_pages=3):
    if len(pages_text) < min_pages:
        return pages_text

    line_counts = {}
    pages_lines = []
    for page in pages_text:
        lines = [l.strip() for l in page.split('\n')]
        pages_lines.append(lines)
        for line in set(lines):
            if line:
                line_counts[line] = line_counts.get(line, 0) + 1

    threshold = len(pages_text) * 0.5
    boilerplate = {line for line, count in line_counts.items() if count >= threshold}

    return ['\n'.join(l for l in lines if l not in boilerplate) for lines in pages_lines]

_DUPLICATE_RUN_PATTERN = re.compile(r'\b([\w|]{2,40})\1\b')
_DUPLICATE_WORD_PATTERN = re.compile(r'\b([\w-]+),?\s+\1\b', re.IGNORECASE)
_DUPLICATE_PUNCT_PATTERN = re.compile(r'\b(\w{2,40}[:;,])\1')
_CITATION_PATTERN = re.compile(
    r'\b(springer|elsevier|ieee|acm|wiley|nature|science direct|arxiv|proceedings|'
    r'transactions on|journal of|conference on|slide credit|image credit|credit:|'
    r'source:|adapted from)\b',
    re.IGNORECASE
)

def filter_citation_topics(keywords):
    return [(kw, score) for kw, score in keywords if not _CITATION_PATTERN.search(kw)]

def repair_duplicated_text(text):
    cleaned = text
    previous = None
    for _ in range(3):
        if cleaned == previous:
            break
        previous = cleaned
        cleaned = _DUPLICATE_RUN_PATTERN.sub(r'\1', cleaned)
        cleaned = _DUPLICATE_WORD_PATTERN.sub(r'\1', cleaned)
        cleaned = _DUPLICATE_PUNCT_PATTERN.sub(r'\1', cleaned)
    cleaned = cleaned.replace('|', ' ')
    return cleaned

def protect_abbreviations(text):
    # Prevents "vs." from being read as a sentence-ending period when
    # clauses are later split on '.', which was truncating phrases like
    # "Classification vs. Regression" down to just "Classification vs"
    return re.sub(r'\bvs\.', 'vs', text, flags=re.IGNORECASE)

_WEEK_NUMBER_PATTERN = re.compile(r'(?:week|wk)[\s_]*?(\d+)', re.IGNORECASE)

def extract_week_number(filename):
    match = _WEEK_NUMBER_PATTERN.search(filename)
    return int(match.group(1)) if match else None

# ============== Text Extraction ==============

def extract_text(file):
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_text = [page.get_text(sort=True) for page in doc]
        doc.close()

        pages_text = strip_repeated_boilerplate(pages_text)
        pages_text = filter_admin_pages(pages_text)
        combined = '\n'.join(pages_text)
        combined = repair_duplicated_text(combined)
        combined = protect_abbreviations(combined)
        return combined
    else:
        return file.read().decode('utf-8', errors='ignore')

# ============== Topic Extraction, Filteting and Cleanup ==============

_nlp = None

def extract_topics_per_clause(text, ngram_range=(1, 2), top_n_per_clause=2):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    all_keywords = []
    for line in lines:
        for clause in re.split(r'[.;:]', line):
            clause = clause.strip()
            if len(clause.split()) < 2:
                continue  # too short to contain a meaningful phrase
            try:
                kws = kw_model.extract_keywords(
                    clause,
                    keyphrase_ngram_range=ngram_range,
                    stop_words='english',
                    top_n=top_n_per_clause
                )
                all_keywords.extend(kws)
            except Exception:
                continue
    return all_keywords

def get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load('en_core_web_sm')
    return _nlp

def get_named_entity_strings(raw_text):
    nlp = get_nlp()
    doc = nlp(raw_text[:100000])
    unwanted_labels = {'PERSON', 'DATE', 'ORG', 'GPE', 'TIME'}
    return {ent.text.lower().strip() for ent in doc.ents if ent.label_ in unwanted_labels}

def filter_named_entities(keywords, entity_strings):
    entity_words = set()
    for ent in entity_strings:
        entity_words.update(ent.split())

    filtered = []
    for kw, score in keywords:
        kw_words = set(kw.lower().split())
        if kw_words & entity_words:
            continue
        filtered.append((kw, score))
    return filtered

def deduplicate_topics(keywords, similarity_threshold=0.85):
    if not keywords:
        return keywords

    phrases = [kw for kw, score in keywords]
    embeddings = embed_texts(phrases)

    keep = []
    keep_embeddings = []
    for i, (phrase, score) in enumerate(keywords):
        is_duplicate = False
        for kept_emb in keep_embeddings:
            sim = F.cosine_similarity(embeddings[i].unsqueeze(0), kept_emb.unsqueeze(0)).item()
            if sim > similarity_threshold:
                is_duplicate = True
                break
        if not is_duplicate:
            keep.append((phrase, score))
            keep_embeddings.append(embeddings[i])

    return keep

def deduplicate_against_existing(keywords, existing_topic_names, similarity_threshold=0.85):
    if not keywords or not existing_topic_names:
        return keywords

    existing_embeddings = embed_texts(existing_topic_names)
    candidate_phrases = [kw for kw, score in keywords]
    candidate_embeddings = embed_texts(candidate_phrases)

    keep = []
    for i, (phrase, score) in enumerate(keywords):
        is_duplicate = False
        for existing_emb in existing_embeddings:
            sim = F.cosine_similarity(candidate_embeddings[i].unsqueeze(0), existing_emb.unsqueeze(0)).item()
            if sim > similarity_threshold:
                is_duplicate = True
                break
        if not is_duplicate:
            keep.append((phrase, score))

    return keep

CONTRACTION_FRAGMENTS = {'ve', 're', 'll', 'm', 's', 't', 'd'}

def filter_fragment_topics(keywords, max_word_length=20, min_words=2):
    filtered = []
    for kw, score in keywords:
        words = kw.lower().split()
        if len(words) < min_words:
            continue
        if any(w in CONTRACTION_FRAGMENTS for w in words):
            continue
        if any(len(w) > max_word_length for w in words):
            continue
        filtered.append((kw, score))
    return filtered

ADMIN_STOPLIST = {
    'professor', 'instructor', 'module', 'course', 'lecture', 'lecturer',
    'assessment', 'assignment', 'week', 'semester', 'syllabus', 'agenda',
    'overview', 'introduction', 'outline', 'schedule', 'contact', 'email'
}

def filter_admin_topics(keywords):
    return [(kw, score) for kw, score in keywords if not any(w in kw.lower() for w in ADMIN_STOPLIST)]

# ============== Routes ==============

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

    if not (file.filename.endswith('.txt') or file.filename.endswith('.pdf')):
        return jsonify({'error': 'Only .txt and .pdf files are supported'}), 400

    raw_text = extract_text(file)

    note = Note(subject_id=subject_id, filename=file.filename, raw_text=raw_text)
    db.session.add(note)
    db.session.commit()

    entity_strings = get_named_entity_strings(raw_text)

    keywords = extract_topics_per_clause(raw_text)
    keywords = deduplicate_topics(keywords)
    keywords = filter_named_entities(keywords, entity_strings)
    keywords = filter_admin_topics(keywords)
    keywords = filter_citation_topics(keywords)
    keywords = filter_fragment_topics(keywords)
    keywords = filter_symbol_contaminated_topics(keywords)
    keywords = filter_numeric_topics(keywords)

    existing_topics = Topic.query.filter_by(subject_id = subject_id).all()
    existing_topic_names = [t.topic_name for t in existing_topics]
    keywords = deduplicate_against_existing(keywords, existing_topic_names)
    keywords = sorted(keywords, key=lambda x: x[1], reverse=True)[:10]

    for keyword, _score in keywords:
        topic = Topic(
            note_id=note.id,
            subject_id=subject_id,
            topic_name=keyword
        )
        db.session.add(topic)
    db.session.commit()

    Summary.query.filter_by(subject_id=subject_id).delete()
    db.session.commit()

    return jsonify({
        'message': 'Note uploaded and topics extracted',
        'note_id': note.id,
        'topics': [keyword for keyword, _score in keywords]
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

@notes_bp.route('/<int:subject_id>/topics/<int:topic_id>', methods=['DELETE'])
@jwt_required()
def delete_topic(subject_id, topic_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403

    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    topic = Topic.query.filter_by(id=topic_id, subject_id=subject_id).first()
    if not topic:
        return jsonify({'error': 'Topic not found'}), 404

    db.session.delete(topic)
    db.session.commit()

    Summary.query.filter_by(subject_id=subject_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Topic deleted'}), 200

@notes_bp.route('/<int:subject_id>/summary', methods=['GET'])
@jwt_required()
def get_subject_summary(subject_id):
    user_id = get_jwt_identity()
    subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    existing = Summary.query.filter_by(subject_id=subject_id).first()
    if existing:
        return jsonify({
            'subject_id': subject_id,
            'sections': json_module.loads(existing.content),
            'generated_at': existing.generated_at,
            'cached': True
        }), 200

    sections = _build_summary_sections(subject_id)
    if sections is None:
        return jsonify({'error': 'No notes found for this subject'}), 400

    try:
        summary = Summary(subject_id=subject_id, content=json_module.dumps(sections))
        db.session.add(summary)
        db.session.commit()
    except IntegrityError:
        # Another concurrent request already inserted a summary for this
        # subject between our check and our insert - roll back our own
        # attempt and just return the one that won the race
        db.session.rollback()
        existing = Summary.query.filter_by(subject_id=subject_id).first()
        return jsonify({
            'subject_id': subject_id,
            'sections': json_module.loads(existing.content),
            'generated_at': existing.generated_at,
            'cached': True
        }), 200

    return jsonify({
        'subject_id': subject_id,
        'sections': sections,
        'generated_at': summary.generated_at,
        'cached': False
    }), 200

# ============== Summary Section ==============

def _build_summary_sections(subject_id):
    notes = Note.query.filter_by(subject_id=subject_id).all()
    if not notes:
        return None

    def sort_key(note):
        week_num = extract_week_number(note.filename)
        return (0, week_num) if week_num is not None else (1, note.id)

    ordered_notes = sorted(notes, key=sort_key)

    sections = []
    for note in ordered_notes:
        key_sentences = extract_summary_sentences(note.raw_text)
        paragraph = generate_abstractive_summary(key_sentences) if key_sentences else None
        sections.append({
            'note_id': note.id,
            'filename': note.filename,
            'week_number': extract_week_number(note.filename),
            'summary_paragraph': paragraph,
            'key_sentences': key_sentences  # kept as a fallback/reference, not necessarily shown
        })
    return sections