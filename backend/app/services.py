from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import os
from sentence_transformers import SentenceTransformer, util

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 't5_qg_model')

tokenizer = None
model = None
similarity_model = None

def load_qg_model():
    global tokenizer, model
    if model is None:
        tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH)
        model = T5ForConditionalGeneration.from_pretrained(
            MODEL_PATH,
            low_cpu_mem_usage=False   
        )
        model = model.to("cpu")       
        model.eval()
    return tokenizer, model

def extract_relevant_sentences(text, topic, max_sentences=3):
    sentences = [s.strip() for s in text.replace('\n', ' ').split('.') if s.strip()]
    topic_words = set(topic.lower().split())
    
    scored = []
    for sentence in sentences:
        sentence_words = set(sentence.lower().split())
        overlap = len(topic_words & sentence_words)
        if overlap > 0:
            scored.append((overlap, sentence))
    
    scored.sort(reverse=True)
    top_sentences = [s for _, s in scored[:max_sentences]]
    
    if not top_sentences:
        return ' '.join(sentences[:max_sentences])
    
    return '. '.join(top_sentences)

def generate_question(context, answer):
    tok, mdl = load_qg_model()
    input_text = f"generate question: context: {context} answer: {answer}"
    input_ids = tok(input_text, return_tensors="pt", max_length=512, truncation=True).input_ids
    
    with torch.no_grad():
        outputs = mdl.generate(input_ids, max_length=64, num_beams=4, early_stopping=True)
    
    question = tok.decode(outputs[0], skip_special_tokens=True)
    return question

def generate_question_for_topic(raw_text, topic):
    context = extract_relevant_sentences(raw_text, topic)
    return generate_question(context, topic)

def load_similarity_model():
    global similarity_model
    if similarity_model is None:
        similarity_model = SentenceTransformer(
            'all-MiniLM-L6-v2',
            device='cpu',
            model_kwargs={"low_cpu_mem_usage": False}
        )
    return similarity_model

def score_answer(user_answer, correct_answer, threshold=0.5):
    """
    Score a user's answer against the correct answer using semantic similarity.
    Returns a score between 0 and 1, and whether it's considered correct.
    """
    if not user_answer.strip():
        return 0.0, False
    
    model = load_similarity_model()
    
    embeddings = model.encode([user_answer, correct_answer], convert_to_tensor=True)
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
    
    score = round(float(similarity), 4)
    is_correct = score >= threshold
    
    return score, is_correct