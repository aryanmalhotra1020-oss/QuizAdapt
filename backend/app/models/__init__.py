from app import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime,default=lambda: datetime.now(timezone.utc))
    subjects = db.relationship('Subject', backref='user', lazy=True, cascade='all, delete')

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(30), default='pending_diagnostic', nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_accessed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    notes = db.relationship('Note', backref='subject', lazy=True, cascade='all, delete')
    quizzes = db.relationship('Quiz', backref='subject', lazy=True, cascade='all, delete')

class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    raw_text = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    topics = db.relationship('Topic', backref='note', lazy=True, cascade='all, delete')

class Topic(db.Model):
    __tablename__ = 'topics'
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    topic_name = db.Column(db.String(255), nullable=False)
    performances = db.relationship('TopicPerformance', backref='topic', lazy=True, cascade='all, delete')
    review_schedules = db.relationship('ReviewSchedule', backref='topic', lazy=True, cascade='all, delete')


class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete')
    attempts = db.relationship('Attempt', backref='quiz', lazy=True, cascade='all, delete')

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=True)
    question_text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), default='short_answer', nullable=False)
    difficulty = db.Column(db.String(10), default='medium', nullable=False)
    options = db.Column(db.Text)  # JSON-encoded list of strings, used for MCQ (and match, later)
    answers = db.relationship('Answer', backref='question', lazy=True, cascade='all, delete')

class Attempt(db.Model):
    __tablename__ = 'attempts'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    started_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)
    answers = db.relationship('Answer', backref='attempt', lazy=True, cascade='all, delete')

class Answer(db.Model):
    __tablename__ = 'answers'
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('attempts.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    user_answer = db.Column(db.Text)
    is_correct = db.Column(db.Boolean)
    score = db.Column(db.Float)

class TopicPerformance(db.Model):
    __tablename__ = 'topic_performance'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    strength_score = db.Column(db.Float, default=0.5)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class ReviewSchedule(db.Model):
    __tablename__ = 'review_schedule'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    easiness_factor = db.Column(db.Float, nullable=False, default=2.5)
    interval_days = db.Column(db.Integer, nullable=False, default=1)
    repetitions = db.Column(db.Integer, nullable=False, default=0)
    next_review_date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    last_reviewed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'topic_id', name='uq_user_topic_review'),)