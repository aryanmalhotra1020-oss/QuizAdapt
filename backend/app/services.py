from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 't5_qg_model')

tokenizer = None
model = None

def load_qg_model():
    global tokenizer, model
    if model is None:
        tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH)
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)
        model.eval()
    return tokenizer, model

def generate_question(context, answer):
    tok, mdl = load_qg_model()
    input_text = f"generate question: context: {context} answer: {answer}"
    input_ids = tok(input_text, return_tensors="pt", max_length=512, truncation=True).input_ids
    
    with torch.no_grad():
        outputs = mdl.generate(input_ids, max_length=64, num_beams=4, early_stopping=True)
    
    question = tok.decode(outputs[0], skip_special_tokens=True)
    return question