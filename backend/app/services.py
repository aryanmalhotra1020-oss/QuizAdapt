from transformers import T5Tokenizer, T5ForConditionalGeneration, AutoTokenizer, AutoModel
import torch
import os
import torch.nn.functional as F
from sentence_transformers import SentenceTransformer, util

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 't5_qg_model')

tokenizer = None
model = None
similarity_tokenizer = None
similarity_model = None

def load_qg_model():
    global tokenizer, model
    if model is None:
        tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH)
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)
        model.tie_weights()
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
    global similarity_tokenizer, similarity_model
    if similarity_model is None:
        similarity_tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
        similarity_model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
        similarity_model.tie_weights()
        similarity_model.eval()
    return similarity_tokenizer, similarity_model

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    mask = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * mask, 1) / torch.clamp(mask.sum(1), min=1e-9)

def embed_texts(texts):
    tok, mdl = load_similarity_model()
    encoded = tok(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        output = mdl(**encoded)
    embeddings = mean_pooling(output, encoded["attention_mask"])
    return F.normalize(embeddings, p=2, dim=1)

def score_answer(user_answer, correct_answer, threshold=0.5):
    if not user_answer.strip():
        return 0.0, False

    embeddings = embed_texts([user_answer, correct_answer])
    similarity = F.cosine_similarity(embeddings[0].unsqueeze(0), embeddings[1].unsqueeze(0)).item()

    score = round(float(similarity), 4)
    is_correct = score >= threshold
    return score, is_correct