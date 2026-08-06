"""
Comparative Evaluation: Summarization Approaches

Generates a summary for each uploaded note using all three tested
approaches - extractive-only, untrained base Flan-T5, and the final
fine-tuned model - for side-by-side rubric scoring.
"""

import sys
import csv
import torch
from transformers import T5TokenizerFast, T5ForConditionalGeneration
from app import create_app
from app.models import Note
from app.services import extract_summary_sentences, generate_abstractive_summary

UNTRAINED_PROMPT = (
    "Rewrite the following key points as a short, flowing paragraph. "
    "Do not add any new information, only connect and rephrase what is given.\n\n"
    "Key points:\n{points}\n\nParagraph:"
)


def load_untrained_base_model():
    tok = T5TokenizerFast.from_pretrained("google/flan-t5-base")
    mdl = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")
    mdl.eval()
    return tok, mdl


def generate_untrained_summary(sentences, tok, mdl):
    points_text = "\n".join(f"- {s}" for s in sentences)
    prompt = UNTRAINED_PROMPT.format(points=points_text)
    input_ids = tok(prompt, return_tensors="pt", max_length=512, truncation=True).input_ids
    with torch.no_grad():
        outputs = mdl.generate(input_ids, max_length=200, num_beams=4, early_stopping=True)
    return tok.decode(outputs[0], skip_special_tokens=True)


def run_comparison(app, subject_ids):
    rows = []
    untrained_tok, untrained_mdl = load_untrained_base_model()

    with app.app_context():
        for subject_id in subject_ids:
            notes = Note.query.filter_by(subject_id=subject_id).all()
            for note in notes:
                sentences = extract_summary_sentences(note.raw_text)
                if not sentences:
                    continue

                rows.append({
                    'subject_id': subject_id, 'filename': note.filename, 'model': 'extractive_only',
                    'summary': ' '.join(sentences),
                    'coherence_1to5': '', 'faithfulness_1to5': '', 'completeness_1to5': '', 'notes': ''
                })

                untrained_result = generate_untrained_summary(sentences, untrained_tok, untrained_mdl)
                rows.append({
                    'subject_id': subject_id, 'filename': note.filename, 'model': 'untrained_base_flant5',
                    'summary': untrained_result,
                    'coherence_1to5': '', 'faithfulness_1to5': '', 'completeness_1to5': '', 'notes': ''
                })

                finetuned_result = generate_abstractive_summary(sentences)
                rows.append({
                    'subject_id': subject_id, 'filename': note.filename, 'model': 'finetuned_summary_model',
                    'summary': finetuned_result or '[GENERATION FAILED]',
                    'coherence_1to5': '', 'faithfulness_1to5': '', 'completeness_1to5': '', 'notes': ''
                })

    return rows


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python compare_summary_models.py <subject_id_1> [<subject_id_2> ...]")
        sys.exit(1)

    subject_ids = [int(s) for s in sys.argv[1:]]
    app = create_app()
    rows = run_comparison(app, subject_ids)

    with open('summary_model_comparison.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nGenerated {len(rows)} summaries ({len(rows)//3} triples) across {len(subject_ids)} subjects.")
    print("Saved to summary_model_comparison.csv - score each row.")