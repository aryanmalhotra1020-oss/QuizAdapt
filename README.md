# QuizAdapt

An adaptive learning platform that turns a student's own lecture notes into personalised, targeted quizzes.

QuizAdapt extracts the topics from the uploaded notes, diagnoses your baseline knowledge, and generates multiple-choice quizzes that adapt to what the user actually don't know yet - weighted towards a user's weak topics using an online Bayesian Knowledge Tracing model, not just random questions from the material.

## Why this exists

Most quiz generating tools either use a hosted LLM API to do all the thinking, or generate shallow fill-in-the-blank questions with no real distractors. Neither felt genuine, and the second one produces quizzes nobody would actually want to take.

The goal here was to build a system where the model itself is fine-tuned on task-appropriate data, tested end-to-end, and shipped with a fallback path for when generation quality dips. Not a wrapper around someone else's API.

## What it does

- **Notes TO topics**: PDF/text notes are parsed (PyMuPDF), cleaned (boilerplate stripping, admin-slide filtering, duplicate-text repair), and run through KeyBERT per-clause to extract clean, non-overlapping topics.
- **Diagnostic quiz**: Short initial quiz that establishes a knowledge baseline per topic. 
- **Adaptive quiz engine**: Uses an online Bayesian Knowledge Tracing (BKT) model to classify topics as weak/moderate/strong and weight future quizzes accordingly (50/30/20 split)
- **MCQ generation**: A fine-tuned Flan-T5 model generates genuine multiple-choice questions with real question, real answer, three plausible distractors - grounded in the student's own notes, with a graceful fallback to sentence-based fill-in-the-blank when generation confidence is low
- **Spaced repetition**: SM-2 + exponential forgetting-curve decay resurfaces topics right before they'd likely be forgotten
- **Performance dashboard**: Topic-by-Topic mastery breakdown and quiz history

## Stack

- **Frontend**: React
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **ML/NLP**: Hugging Face Transformers (fine-tuned Flan-T5), KeyBERT, sentence-transformers (`all-MiniLM-L6-v2`) for semantic similarity, spaCy for named-entity filtering
- **Adaptive learning**: Custom Bayesian Knowledge Tracing implementation, SM-2 spaced repetition

## Status

Actively in development as an MSc dissertation project (deadline: September 2026). Core adaptive quiz loop - notes upload, topic extraction, diagnostic, adaptive MCQ generation, performance tracking - is complete and tested end-to-end. Custom quiz configuration (question type/difficulty selection) and sample paper generation are planned future additions.
