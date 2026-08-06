"""
Comparative Evaluation: Question Generation Models

Generates questions for the same real topics using BOTH the original
T5-small/SQuAD model and the final fine-tuned Flan-T5/SciQ model, so they
can be scored on the same rubric for a direct, fair comparison.
"""

import sys
import csv
import json
from app import create_app
from app.models import Topic, Note
from app.services import (
    generate_question_for_topic, generate_mcq_options,  # original pipeline
    generate_mcq_question  # final pipeline
)

QUESTIONS_PER_SUBJECT = 8


def generate_old_style(raw_text, topic_name, other_names):
    question_text = generate_question_for_topic(raw_text, topic_name)
    options = generate_mcq_options(topic_name, other_names)
    return {
        'question_text': question_text,
        'correct_answer': topic_name,
        'options': options
    }


def run_comparison(app, subject_ids):
    rows = []
    with app.app_context():
        for subject_id in subject_ids:
            topics = Topic.query.filter_by(subject_id=subject_id).all()
            if not topics:
                print(f"No topics for subject {subject_id}, skipping")
                continue

            note_cache = {}
            def get_note(topic):
                if topic.note_id not in note_cache:
                    note_cache[topic.note_id] = Note.query.get(topic.note_id)
                return note_cache[topic.note_id]

            sample_topics = (topics * ((QUESTIONS_PER_SUBJECT // len(topics)) + 1))[:QUESTIONS_PER_SUBJECT]

            for topic in sample_topics:
                note = get_note(topic)
                if not note:
                    continue
                other_names = [t.topic_name for t in topics if t.id != topic.id]

                old_result = generate_old_style(note.raw_text, topic.topic_name, other_names)
                rows.append({
                    'subject_id': subject_id, 'topic': topic.topic_name, 'model': 'old_t5small_squad',
                    'question': old_result['question_text'],
                    'options': ' | '.join(old_result['options']),
                    'correct_answer': old_result['correct_answer'],
                    'coherence_1to5': '', 'relevance_1to5': '',
                    'distractor_quality_1to5': '', 'answer_correctness_1to5': '', 'notes': ''
                })

                new_result = generate_mcq_question(note.raw_text, topic.topic_name, other_names)
                if new_result is None:
                    rows.append({
                        'subject_id': subject_id, 'topic': topic.topic_name, 'model': 'new_flant5_sciq',
                        'question': '[SKIPPED - no confident content]', 'options': '', 'correct_answer': '',
                        'coherence_1to5': '', 'relevance_1to5': '',
                        'distractor_quality_1to5': '', 'answer_correctness_1to5': '', 'notes': ''
                    })
                    continue
                rows.append({
                    'subject_id': subject_id, 'topic': topic.topic_name, 'model': 'new_flant5_sciq',
                    'question': new_result['question_text'],
                    'options': ' | '.join(new_result['options']),
                    'correct_answer': new_result['correct_answer'],
                    'coherence_1to5': '', 'relevance_1to5': '',
                    'distractor_quality_1to5': '', 'answer_correctness_1to5': '', 'notes': ''
                })

    return rows


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python compare_question_models.py <subject_id_1> [<subject_id_2> ...]")
        sys.exit(1)

    subject_ids = [int(s) for s in sys.argv[1:]]
    app = create_app()
    rows = run_comparison(app, subject_ids)

    with open('question_model_comparison.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nGenerated {len(rows)} questions ({len(rows)//2} pairs) across {len(subject_ids)} subjects.")
    print("Saved to question_model_comparison.csv - score each row on the same rubric as before.")