from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from app.routes.auth import auth_bp
    from app.routes.subjects import subjects_bp
    from app.routes.notes import notes_bp
    from app.routes.quiz import quiz_bp
    from app.routes.review import review_bp


    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(subjects_bp, url_prefix='/api/subjects')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(review_bp, url_prefix='/api/review')

    return app