import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import torch
from transformers import T5TokenizerFast, T5ForConditionalGeneration
from app import create_app
from app.models import Note
from app.services import extract_summary_sentences

SMOOTH_PROMPT_TEMPLATE = (
    "Combine the following sentences into a single paragraph. "
    "Include all the information below, do not skip any point, and do not add anything new.\n\n"
    "{points}\n\nParagraph:"
)


def load_fresh_base_model():
    tok = T5TokenizerFast.from_pretrained("google/flan-t5-base")
    mdl = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")
    mdl.eval()
    return tok, mdl


def smooth_into_paragraph(sentences, tok, mdl):
    points_text = " ".join(f"{i+1}. {s}" for i, s in enumerate(sentences))
    prompt = SMOOTH_PROMPT_TEMPLATE.format(points=points_text)
    input_ids = tok(prompt, return_tensors="pt", max_length=512, truncation=True).input_ids

    with torch.no_grad():
        outputs = mdl.generate(
            input_ids,
            max_length=250,
            min_length=80,
            num_beams=4,
            early_stopping=False
        )

    return tok.decode(outputs[0], skip_special_tokens=True)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python test_abstractive_summary.py <subject_id>")
        sys.exit(1)

    app = create_app()
    tok, mdl = load_fresh_base_model()

    with app.app_context():
        notes = Note.query.filter_by(subject_id=int(sys.argv[1])).all()
        for note in notes[:3]:  # just first 3 files for a quick test
            sentences = extract_summary_sentences(note.raw_text)
            if not sentences:
                continue
            print(f"\n{'='*70}\nFILE: {note.filename}\n{'='*70}")
            print("Extracted sentences:")
            for s in sentences:
                print(f"  - {s}")
            print("\nSmoothed paragraph:")
            print(smooth_into_paragraph(sentences, tok, mdl))