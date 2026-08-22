import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Subject, Note, Topic, Quiz, Question, Attempt, Answer, TopicPerformance, ReviewSchedule, Summary

app = create_app()

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5001)