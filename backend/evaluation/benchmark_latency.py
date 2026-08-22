import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import time
import statistics
from app import create_app
from app.models import Topic, Note
from app.services import (
    generate_mcq_question, generate_fill_blank_question,
    generate_long_answer_question, generate_multi_select_question
)
from app import db

NUM_TRIALS_PER_TYPE = 5


def time_call(fn, *args, **kwargs):
    start = time.perf_counter()
    result = fn(*args, **kwargs)
    elapsed = time.perf_counter() - start
    return elapsed, result


def run_benchmark(app, subject_id):
    with app.app_context():
        topics = Topic.query.filter_by(subject_id=subject_id).all()
        if not topics:
            print("No topics found for this subject.")
            return

        topic_names = [t.topic_name for t in topics]
        note_cache = {}

        def get_note(topic):
            if topic.note_id not in note_cache:
                note_cache[topic.note_id] = db.session.get(Note, topic.note_id)
            return note_cache[topic.note_id]

        timings = {'mcq': [], 'fill_blank': [], 'long_answer': [], 'multi_select': []}
        trial_topics = (topics * ((NUM_TRIALS_PER_TYPE // len(topics)) + 1))[:NUM_TRIALS_PER_TYPE]

        for topic in trial_topics:
            note = get_note(topic)
            if not note:
                continue
            other_names = [t.topic_name for t in topics if t.id != topic.id]

            elapsed, _ = time_call(generate_mcq_question, note.raw_text, topic.topic_name, other_names)
            timings['mcq'].append(elapsed)
            print(f"MCQ ({topic.topic_name}): {elapsed:.2f}s")

            elapsed, _ = time_call(generate_fill_blank_question, note.raw_text, topic.topic_name, other_names)
            timings['fill_blank'].append(elapsed)
            print(f"Fill-blank ({topic.topic_name}): {elapsed:.2f}s")

            elapsed, _ = time_call(generate_long_answer_question, note.raw_text, topic.topic_name)
            timings['long_answer'].append(elapsed)
            print(f"Long-answer ({topic.topic_name}): {elapsed:.2f}s")

        for _ in range(NUM_TRIALS_PER_TYPE):
            elapsed, _ = time_call(generate_multi_select_question, topic_names)
            timings['multi_select'].append(elapsed)
            print(f"Multi-select: {elapsed:.2f}s")

        print("\n" + "=" * 60)
        print(f"{'Type':<15}{'Mean (s)':<12}{'Min (s)':<12}{'Max (s)':<12}{'StdDev'}")
        print("=" * 60)
        for q_type, times in timings.items():
            if not times:
                continue
            mean = statistics.mean(times)
            mn = min(times)
            mx = max(times)
            std = statistics.stdev(times) if len(times) > 1 else 0
            print(f"{q_type:<15}{mean:<12.2f}{mn:<12.2f}{mx:<12.2f}{std:.2f}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python benchmark_latency.py <subject_id>")
        sys.exit(1)

    app = create_app()
    run_benchmark(app, int(sys.argv[1]))