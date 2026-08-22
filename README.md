# QuizAdapt

An adaptive learning platform that turns a student's own lecture notes into personalised, targeted quizzes.

QuizAdapt extracts the topics from the uploaded notes, diagnoses your baseline knowledge, and generates multiple-choice quizzes that adapt to what the user actually don't know yet - weighted towards a user's weak topics using an online Bayesian Knowledge Tracing model, not just random questions from the material.

## Why this exists

Most quiz generating tools either use a hosted LLM API to do all the thinking, or generate shallow fill-in-the-blank questions with no real distractors. Neither felt genuine, and the second one produces quizzes nobody would actually want to take.

The goal here was to build a system where the model itself is fine-tuned on task-appropriate data, tested end-to-end. Not a wrapper around someone else's API.

## What it does

- **Notes to topics**: PDF/text notes are parsed (PyMuPDF), cleaned (boilerplate stripping, admin-slide filtering, duplicate-text repair), and run through KeyBERT per-clause to extract clean, non-overlapping topics.
- **Diagnostic quiz**: Short initial quiz that establishes a knowledge baseline per topic.
- **Adaptive quiz engine**: Uses an online Bayesian Knowledge Tracing (BKT) model to classify topics as weak/moderate/strong and weight future quizzes accordingly (50/30/20 split), across four question types (multiple-choice, fill-in-the-blank, long-answer, multi-select) with user-selectable difficulty.
- **MCQ generation**: A fine-tuned Flan-T5 model generates genuine multiple-choice questions with real question, real answer, three plausible distractors, grounded in the student's own notes, with a graceful fallback to sentence-based fill-in-the-blank when generation confidence is low.
- **Summary of Notes**: A second, separately fine-tuned Flan-T5 model turns MMR-extracted key sentences from each uploaded file into a short, flowing summary, with an extractive bullet-point fallback if generation fails.
- **Sample Papers**: Generates a downloadable, comprehensive-coverage practice paper (question paper and separate answer key, in both PDF and Word) covering the whole subject, not just weak topics.
- **Review queue**: SM-2 spaced repetition combined with a BKT-based forgetting-curve decay resurfaces topics right before they'd likely be forgotten.
- **Performance dashboard**: Topic-by-topic mastery breakdown and full quiz history, with each past attempt reviewable question-by-question.

## Stack

- **Frontend**: React
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **ML/NLP**: Hugging Face Transformers: two independently fine-tuned Flan-T5 models (MCQ generation fine-tuned on SciQ and Summaries fine-tuned on CNN/DailyMail). Plus KeyBERT for topic extraction, sentence-transformers (`all-MiniLM-L6-v2`) for semantic similarity/clustering, and spaCy for named-entity and sentence-quality filtering.
- **Adaptive learning**: Custom Bayesian Knowledge Tracing implementation, SM-2 spaced repetition.

## Status

Built as an MSc dissertation project (report due September 2026). The full adaptive loop is complete and evaluated end-to-end: notes upload, topic extraction, diagnostic quiz, adaptive quiz generation across all four question types, Summary of Notes, Sample Papers, spaced-repetition review, and the performance dashboard. See the dissertation report for the full evaluation methodology and results.

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt --break-system-packages
```

Create a `.env` file in `backend/` with:
DATABASE_URL=postgresql://<user>:<password>@localhost:<port>/quiz_adapt
JWT_SECRET_KEY=<any-random-secret-string>

Set up PostgreSQL and create a `quiz_adapt` database matching the connection details above.

The three fine-tuned model checkpoints are gitignored due to size and are not included in this repository - see Appendix A of the dissertation report (or contact the author) for how to obtain them. Once downloaded, place them at:

backend/app/models/mcq_gen_model/
backend/app/models/summary_model/
backend/app/models/t5_qg_model/

Then run:

```bash
python run.py
```

The backend starts on `http://localhost:5001`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend starts on `http://localhost:3000` and expects the backend to be running at `http://localhost:5001`.