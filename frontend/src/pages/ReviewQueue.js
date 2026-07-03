import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ReviewQueue = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDueReviews();
  }, []);

  const fetchDueReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/review/due/${subjectId}`);
      setItems(response.data.due_items);
      setCurrentIndex(0);
      setFeedback(null);
      setAnswer('');
    } catch (err) {
      console.error('Failed to load due reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const item = items[currentIndex];

    setSubmitting(true);
    try {
      const response = await api.post('/review/submit', {
        subject_id: parseInt(subjectId, 10),
        topic_id: item.topic_id,
        answer,
        correct_answer: item.correct_answer
      });
      setFeedback(response.data);
    } catch (err) {
      console.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    setCurrentIndex(prev => prev + 1);
  };

  const getScoreColor = (isCorrect) => (isCorrect ? '#22C55E' : '#EF4444');

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.loadingCard}>
          <span style={styles.loadingIcon}>⏳</span>
          <h2 style={styles.loadingTitle}>Loading your review queue...</h2>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.centered}>
        <div style={styles.loadingCard}>
          <span style={styles.loadingIcon}>✅</span>
          <h2 style={styles.loadingTitle}>Nothing due right now</h2>
          <p style={styles.emptyText}>Check back later — topics will surface here as they become due for review.</p>
          <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
            ← Back to Subject
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= items.length) {
    return (
      <div style={styles.centered}>
        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsEmoji}>🎉</span>
            <h2 style={styles.resultsTitle}>Review Complete!</h2>
            <p style={styles.resultsFeedback}>
              You've worked through all {items.length} due topic{items.length !== 1 ? 's' : ''}. Nice consistency.
            </p>
          </div>
          <div style={styles.resultsActions}>
            <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
              ← Back to Subject
            </button>
            <button style={styles.primaryBtn} onClick={fetchDueReviews}>
              Refresh Queue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const item = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <div style={styles.centered}>
      <div style={styles.quizCard}>
        {/* Progress */}
        <div style={styles.progressSection}>
          <div style={styles.progressInfo}>
            <span style={styles.progressText}>Topic {currentIndex + 1} of {items.length}</span>
            <span style={styles.progressPct}>{Math.round(progress)}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div style={styles.questionSection}>
          <div style={styles.questionNumber}>{item.topic_name}</div>
          <h2 style={styles.questionText}>{item.question_text}</h2>
        </div>

        {!feedback ? (
          <>
            {/* Answer */}
            <div style={styles.answerSection}>
              <label style={styles.answerLabel}>Your Answer</label>
              <input
                style={styles.answerInput}
                type="text"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                autoFocus
              />
              <p style={styles.answerHint}>Press Enter or click the button to continue</p>
            </div>

            <button
              style={{ ...styles.primaryBtn, opacity: (!answer.trim() || submitting) ? 0.5 : 1 }}
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
            >
              {submitting ? 'Checking...' : 'Submit Answer ✓'}
            </button>
          </>
        ) : (
          <>
            {/* Feedback */}
            <div style={{
              ...styles.resultItem,
              borderLeft: `4px solid ${getScoreColor(feedback.is_correct)}`
            }}>
              <span style={{
                ...styles.resultBadge,
                backgroundColor: feedback.is_correct ? '#F0FDF4' : '#FEF2F2',
                color: feedback.is_correct ? '#16A34A' : '#DC2626'
              }}>
                {feedback.is_correct ? '✓ Correct' : '✗ Not quite'}
              </span>
              <p style={styles.resultAnswer}>
                Next review in <strong>{feedback.interval_days} day{feedback.interval_days !== 1 ? 's' : ''}</strong>
              </p>
              <p style={styles.resultAnswer}>
                Updated mastery: <strong>{Math.round(feedback.updated_strength * 100)}%</strong>
              </p>
            </div>

            <button style={styles.primaryBtn} onClick={handleNext}>
              {currentIndex < items.length - 1 ? 'Next Topic →' : 'Finish Review ✓'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#F0F4F8',
    padding: '2rem',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '480px',
  },
  loadingIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '1rem',
  },
  loadingTitle: {
    color: '#1A1A2E',
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  progressSection: {
    marginBottom: '2.5rem',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  progressText: {
    fontSize: '0.85rem',
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressPct: {
    fontSize: '0.85rem',
    color: '#00B4D8',
    fontWeight: '600',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#F1F5F9',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B4D8',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  },
  questionSection: {
    marginBottom: '2rem',
  },
  questionNumber: {
    display: 'inline-block',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    marginBottom: '1rem',
    letterSpacing: '0.05em',
    textTransform: 'capitalize',
  },
  questionText: {
    fontSize: '1.4rem',
    color: '#1A1A2E',
    lineHeight: '1.5',
    fontWeight: '600',
  },
  answerSection: {
    marginBottom: '1.5rem',
  },
  answerLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748B',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  answerInput: {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '10px',
    border: '2px solid #E2E8F0',
    fontSize: '1rem',
    color: '#1A1A2E',
    boxSizing: 'border-box',
    marginBottom: '0.4rem',
  },
  answerHint: {
    fontSize: '0.75rem',
    color: '#94A3B8',
  },
  primaryBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  secondaryBtn: {
    flex: 1,
    padding: '0.9rem',
    backgroundColor: '#fff',
    color: '#1A1A2E',
    border: '2px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  resultsHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #F1F5F9',
  },
  resultsEmoji: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  resultsTitle: {
    fontSize: '1.8rem',
    color: '#1A1A2E',
    fontWeight: '800',
    marginBottom: '1rem',
  },
  resultsFeedback: {
    color: '#64748B',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  resultItem: {
    padding: '1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    marginBottom: '1.5rem',
  },
  resultBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '0.6rem',
  },
  resultAnswer: {
    margin: '0 0 0.25rem',
    color: '#64748B',
    fontSize: '0.85rem',
  },
  resultsActions: {
    display: 'flex',
    gap: '1rem',
  },
};

export default ReviewQueue;