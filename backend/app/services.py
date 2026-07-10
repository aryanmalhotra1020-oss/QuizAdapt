from transformers import T5Tokenizer, T5ForConditionalGeneration, AutoTokenizer, AutoModel, T5TokenizerFast
import torch
import os
import torch.nn.functional as F
from sentence_transformers import SentenceTransformer, util
import random
import re

FLAN_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'mcq_gen_model')

flan_tokenizer = None
flan_model = None

def load_flan_model():
    global flan_tokenizer, flan_model
    if flan_model is None:
        flan_tokenizer = T5TokenizerFast.from_pretrained(FLAN_MODEL_PATH)
        flan_model = T5ForConditionalGeneration.from_pretrained(FLAN_MODEL_PATH)
        flan_model.tie_weights()
        flan_model.eval()
    return flan_tokenizer, flan_model


def parse_mcq_output(raw_output):
    text = raw_output if raw_output.strip().startswith("Question:") else "Question:" + raw_output

    patterns = {
        'question': r'Question:\s*(.+?)(?:\s*Correct:)',
        'correct': r'Correct:\s*(.+?)(?:\s*Wrong1:)',
        'wrong1': r'Wrong1:\s*(.+?)(?:\s*Wrong2:)',
        'wrong2': r'Wrong2:\s*(.+?)(?:\s*Wrong3:)',
        'wrong3': r'Wrong3:\s*(.+?)$',
    }

    result = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.DOTALL)
        result[key] = match.group(1).strip() if match else None

    if not all(result.values()):
        return None
    return result


def _is_valid_mcq(result):
    options = [result['correct'], result['wrong1'], result['wrong2'], result['wrong3']]
    normalized = [o.lower().strip() for o in options]
    return len(set(normalized)) == 4


def generate_mcq_with_flan(context, answer, max_attempts=3):
    tok, mdl = load_flan_model()
    input_text = f"generate mcq: context: {context} answer: {answer}"
    input_ids = tok(input_text, return_tensors="pt", max_length=384, truncation=True).input_ids

    for attempt in range(max_attempts):
        with torch.no_grad():
            outputs = mdl.generate(
                input_ids,
                max_length=160,
                do_sample=True,
                temperature=0.9,
                top_p=0.9
            )

        raw_output = tok.decode(outputs[0], skip_special_tokens=True)
        result = parse_mcq_output(raw_output)

        if result and _is_valid_mcq(result):
            return result

    return None


def generate_mcq_question(raw_text, topic, other_topic_names, difficulty='medium'):
    context = extract_relevant_sentences(raw_text, topic, max_sentences=4, difficulty=difficulty)
    result = generate_mcq_with_flan(context, topic)

    if result and not is_malformed_question(result['question']):
        options = [result['correct'], result['wrong1'], result['wrong2'], result['wrong3']]
        random.shuffle(options)
        return {
            'question_text': result['question'],
            'correct_answer': result['correct'],
            'options': options
        }

    fib = generate_fill_in_blank(raw_text, topic, difficulty=difficulty)
    options = generate_mcq_options(topic, other_topic_names)
    return {
        'question_text': fib['question_text'],
        'correct_answer': topic,
        'options': options
    }

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 't5_qg_model')

_NOISE_PATTERNS = [
    re.compile(r'\bsyed fawad hussain\b', re.IGNORECASE),
    re.compile(r'\bfall 2025\b', re.IGNORECASE),
    re.compile(r'\buniversity of birmingham\b', re.IGNORECASE),
    re.compile(r'\b\d{1,3}\b'),  # standalone slide/page numbers
]

tokenizer = None
model = None
similarity_tokenizer = None
similarity_model = None

def clean_sentence_noise(sentence):
    cleaned = sentence
    for pattern in _NOISE_PATTERNS:
        cleaned = pattern.sub('', cleaned)
    return re.sub(r'\s+', ' ', cleaned).strip()

def split_into_clean_sentences(raw_text):
    lines = raw_text.split('\n')
    sentences = []
    for line in lines:
        parts = re.split(r'(?<=[.?!])\s+', line.strip())
        sentences.extend(parts)
    cleaned = [clean_sentence_noise(s) for s in sentences]
    return [s for s in cleaned if 4 <= len(s.split()) <= 40]

def load_qg_model():
    global tokenizer, model
    if model is None:
        tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH)
        model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)
        model.tie_weights()
        model.eval()
    return tokenizer, model

def extract_relevant_sentences(text, topic, max_sentences=3, difficulty='medium'):
    sentences = [s.strip() for s in text.replace('\n', ' ').split('.') if s.strip()]
    if not sentences:
        return ''

    n = len(sentences)

    try:
        embeddings = embed_texts([topic] + sentences)
        topic_emb = embeddings[0].unsqueeze(0)
        sentence_embs = embeddings[1:]
        similarities = F.cosine_similarity(topic_emb, sentence_embs).tolist()
    except Exception as e:
        print(f"Similarity ranking failed, falling back: {e}")
        similarities = [0.0] * n

    # Soft positional preference: easy leans toward the start of the notes,
    # hard leans toward the end, medium has no positional bias
    ideal_pos = {'easy': 0.15, 'hard': 0.85, 'medium': 0.5}.get(difficulty, 0.5)

    scored = []
    for i, (sim, sentence) in enumerate(zip(similarities, sentences)):
        pos_norm = i / max(1, n - 1)
        position_penalty = abs(pos_norm - ideal_pos) * 0.15
        scored.append((sim - position_penalty, sim, sentence))

    # Keep only genuinely relevant sentences (real similarity, not just position)
    relevant = [row for row in scored if row[1] > 0.2]
    if not relevant:
        relevant = scored  # nothing cleared the threshold — use best-available anyway

    relevant.sort(key=lambda x: x[0], reverse=True)
    top_sentences = [sentence for _, _, sentence in relevant[:max_sentences]]

    return '. '.join(top_sentences) if top_sentences else '. '.join(sentences[:max_sentences])
    

def generate_question(context, answer):
    tok, mdl = load_qg_model()
    input_text = f"generate question: context: {context} answer: {answer}"
    input_ids = tok(input_text, return_tensors="pt", max_length=512, truncation=True).input_ids
    
    with torch.no_grad():
        outputs = mdl.generate(input_ids, max_length=64, num_beams=4, early_stopping=True)
    
    question = tok.decode(outputs[0], skip_special_tokens=True)
    return question

def generate_question_for_topic(raw_text, topic, difficulty='medium'):
    context = extract_relevant_sentences(raw_text, topic, difficulty=difficulty)
    question = generate_question(context, topic)
    question = mask_topic_in_question(question, topic)
    return question

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

def generate_mcq_options(topic_name, other_topic_names, num_options=4):
    if not other_topic_names:
        return [topic_name]

    try:
        embeddings = embed_texts([topic_name] + other_topic_names)
        topic_emb = embeddings[0].unsqueeze(0)
        other_embs = embeddings[1:]
        similarities = F.cosine_similarity(topic_emb, other_embs).tolist()
        ranked = sorted(zip(similarities, other_topic_names), key=lambda x: x[0], reverse=True)
        distractors = [name for _, name in ranked[:num_options - 1]]
    except Exception as e:
        print(f"MCQ distractor ranking failed, using random fallback: {e}")
        distractors = random.sample(other_topic_names, min(num_options - 1, len(other_topic_names)))

    options = distractors + [topic_name]
    random.shuffle(options)
    return options

def generate_fill_in_blank(raw_text, topic, difficulty='medium'):
    sentences = split_into_clean_sentences(raw_text)
    pattern = re.compile(re.escape(topic), re.IGNORECASE)

    matches = [s for s in sentences if pattern.search(s)]
    if matches:
        # For difficulty, prefer earlier matches for 'easy', later for 'hard'
        if difficulty == 'easy':
            chosen = matches[0]
        elif difficulty == 'hard':
            chosen = matches[-1]
        else:
            chosen = matches[len(matches) // 2]

        blank_sentence = pattern.sub('_____', chosen, count=1)
        return {
            'question_text': blank_sentence.strip(),
            'correct_answer': topic,
            'from_real_sentence': True
        }

    # No verbatim match - use the best clean sentence available rather
    # than falling back to the looser extract_relevant_sentences(), which
    # doesn't have the same page/clause contamination protections
    fallback_candidates = [s for s in sentences if len(s.split()) >= 5]
    base_sentence = fallback_candidates[0] if fallback_candidates else topic
    return {
        'question_text': f"_____ is best described as: {base_sentence}",
        'correct_answer': topic,
        'from_real_sentence': False
    }

def generate_mcq_stem(raw_text, topic, difficulty='medium'):
    fib = generate_fill_in_blank(raw_text, topic, difficulty=difficulty)
    if fib['from_real_sentence']:
        return fib['question_text']
    return generate_question_for_topic(raw_text, topic, difficulty=difficulty)

def mask_topic_in_question(question_text, topic):
    pattern = re.compile(re.escape(topic), re.IGNORECASE)
    if pattern.search(question_text):
        return pattern.sub('_____', question_text)
    return question_text

def is_malformed_question(question_text, min_words=4):
    words = question_text.strip().split()
    if len(words) < min_words:
        return True
    if not question_text.strip().endswith(('?', '.')):
        return True
    return False