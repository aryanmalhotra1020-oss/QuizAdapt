import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import torch
from app import create_app
from app.models import Note
from app.services import load_flan_model

SUMMARY_PROMPT_TEMPLATE = "Summarize the following lecture content in 4-6 sentences:\n\n{text}"


def generate_summary_attempt(text, max_input_chars=2000):
    tok, mdl = load_flan_model()
    prompt = SUMMARY_PROMPT_TEMPLATE.format(text=text[:max_input_chars])
    input_ids = tok(prompt, return_tensors="pt", max_length=512, truncation=True).input_ids

    with torch.no_grad():
        outputs = mdl.generate(input_ids, max_length=200, num_beams=4, early_stopping=True)

    return tok.decode(outputs[0], skip_special_tokens=True)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python test_summarization.py <subject_id>")
        sys.exit(1)

    app = create_app()
    with app.app_context():
        notes = Note.query.filter_by(subject_id=int(sys.argv[1])).all()
        for note in notes:
            print(f"\n{'='*70}\nFILE: {note.filename}\n{'='*70}")
            summary = generate_summary_attempt(note.raw_text)
            print(summary)