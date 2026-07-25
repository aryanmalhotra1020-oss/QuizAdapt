"""
BKT Adaptive Weighting Validation Script

Validates the core adaptive learning claim: that topics a user consistently
answers incorrectly get classified as 'weak' and are subsequently selected
more often in quiz generation, using the REAL production code
(app.adaptive.select_adaptive_topics), not a re-implementation.

Usage: python validate_bkt.py
"""

from app import create_app, db
from app.models import User, Subject, Note, Topic, TopicPerformance
from app.bkt import BKTModel
from app.adaptive import select_adaptive_topics
from collections import Counter
import random

TEST_SUBJECT_NAME = "BKT_VALIDATION_TEST"
NUM_SIMULATED_ROUNDS = 8
NUM_SELECTION_TRIALS = 200

# Scripted answer pattern per topic index: always wrong, always right, or mixed
TOPIC_PATTERNS = {
    0: 'always_wrong',
    1: 'always_wrong',
    2: 'always_wrong',
    3: 'always_right',
    4: 'always_right',
    5: 'always_right',
    6: 'mixed',
    7: 'mixed',
    8: 'always_wrong',
    9: 'always_right',
}


def get_is_correct(pattern):
    if pattern == 'always_wrong':
        return False
    if pattern == 'always_right':
        return True
    return random.random() > 0.5


def setup_test_data(app):
    with app.app_context():
        user = User.query.filter_by(email='bkt_validation@test.local').first()
        if not user:
            user = User(name='BKT Validation', email='bkt_validation@test.local', password_hash='n/a')
            db.session.add(user)
            db.session.commit()

        old_subject = Subject.query.filter_by(name=TEST_SUBJECT_NAME, user_id=user.id).first()
        if old_subject:
            db.session.delete(old_subject)
            db.session.commit()

        subject = Subject(user_id=user.id, name=TEST_SUBJECT_NAME, status='active')
        db.session.add(subject)
        db.session.commit()

        note = Note(subject_id=subject.id, filename='synthetic.txt', raw_text='')
        db.session.add(note)
        db.session.commit()

        topics = []
        for i in range(10):
            topic = Topic(note_id=note.id, subject_id=subject.id, topic_name=f'topic_{i}')
            db.session.add(topic)
            topics.append(topic)
        db.session.commit()

        return user.id, subject.id, [t.id for t in topics]


def run_simulation(app, user_id, subject_id, topic_ids):
    bkt = BKTModel()

    print("=" * 70)
    print("PART 1: BKT Score Convergence Over Repeated Attempts")
    print("=" * 70)

    with app.app_context():
        for round_num in range(1, NUM_SIMULATED_ROUNDS + 1):
            for idx, topic_id in enumerate(topic_ids):
                pattern = TOPIC_PATTERNS.get(idx, 'mixed')
                is_correct = get_is_correct(pattern)

                perf = TopicPerformance.query.filter_by(
                    user_id=user_id, subject_id=subject_id, topic_id=topic_id
                ).first()

                if perf:
                    perf.strength_score = bkt.update(perf.strength_score, is_correct)
                else:
                    perf = TopicPerformance(
                        user_id=user_id, subject_id=subject_id, topic_id=topic_id,
                        strength_score=bkt.update(bkt.p_know, is_correct)
                    )
                    db.session.add(perf)
            db.session.commit()

            row = []
            for idx, topic_id in enumerate(topic_ids):
                perf = TopicPerformance.query.filter_by(
                    user_id=user_id, subject_id=subject_id, topic_id=topic_id
                ).first()
                classification = bkt.classify(perf.strength_score)
                row.append(f"t{idx}={classification[0].upper()}({perf.strength_score:.2f})")
            print(f"Round {round_num}: " + " ".join(row))


def run_selection_trials(app, user_id, subject_id, topic_ids):
    bkt = BKTModel()

    print()
    print("=" * 70)
    print(f"PART 2: Topic Selection Frequency Over {NUM_SELECTION_TRIALS} Simulated Quizzes")
    print("=" * 70)

    with app.app_context():
        topics = Topic.query.filter(Topic.id.in_(topic_ids)).all()
        performances = {
            p.topic_id: p.strength_score
            for p in TopicPerformance.query.filter_by(user_id=user_id, subject_id=subject_id).all()
        }

        final_classifications = {}
        for idx, topic in enumerate(topics):
            score = performances.get(topic.id, bkt.p_know)
            final_classifications[idx] = bkt.classify(score)

        selection_counts = Counter()
        classification_selection_counts = Counter()

        for _ in range(NUM_SELECTION_TRIALS):
            selected, weak, moderate, strong = select_adaptive_topics(topics, performances, bkt)
            for topic in selected:
                idx = topic_ids.index(topic.id)
                selection_counts[idx] += 1
                classification_selection_counts[final_classifications[idx]] += 1

        print(f"\n{'Topic':<10}{'Pattern':<15}{'Final Class':<14}{'Selected (out of ' + str(NUM_SELECTION_TRIALS) + ')':<25}{'Selection Rate'}")
        for idx in range(10):
            pattern = TOPIC_PATTERNS.get(idx, 'mixed')
            classification = final_classifications[idx]
            count = selection_counts[idx]
            rate = count / NUM_SELECTION_TRIALS
            print(f"t{idx:<9}{pattern:<15}{classification:<14}{count:<25}{rate:.1%}")

        total_selections = sum(classification_selection_counts.values())
        print(f"\n--- Aggregate selection by classification (target ~50/30/20) ---")
        for cls in ('weak', 'moderate', 'strong'):
            count = classification_selection_counts[cls]
            pct = count / total_selections if total_selections else 0
            print(f"{cls:<10}: {count:>5} selections ({pct:.1%})")

        always_wrong_avg = sum(selection_counts[i] for i in range(10) if TOPIC_PATTERNS[i] == 'always_wrong') / 4
        always_right_avg = sum(selection_counts[i] for i in range(10) if TOPIC_PATTERNS[i] == 'always_right') / 4

        print(f"\n--- Core claim check ---")
        print(f"Avg selections for consistently-WRONG topics: {always_wrong_avg:.1f} / {NUM_SELECTION_TRIALS}")
        print(f"Avg selections for consistently-RIGHT topics: {always_right_avg:.1f} / {NUM_SELECTION_TRIALS}")
        if always_wrong_avg > always_right_avg:
            ratio = always_wrong_avg / always_right_avg if always_right_avg > 0 else float('inf')
            print(f"PASS: weak topics selected {ratio:.1f}x more often than strong topics")
        else:
            print("FAIL: weak topics were not selected more often - investigate BKT/selection logic")


def cleanup(app, subject_id):
    with app.app_context():
        subject = db.session.get(Subject, subject_id)
        if subject:
            db.session.delete(subject)
            db.session.commit()
    print(f"\nTest subject '{TEST_SUBJECT_NAME}' cleaned up.")


if __name__ == '__main__':
    app = create_app()
    user_id, subject_id, topic_ids = setup_test_data(app)
    run_simulation(app, user_id, subject_id, topic_ids)
    run_selection_trials(app, user_id, subject_id, topic_ids)
    cleanup(app, subject_id)