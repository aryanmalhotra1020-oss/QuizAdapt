import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

const SpinnerIcon = () => (
  <svg className="review-spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke={tokens.border} strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={tokens.accent} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CheckCircleIcon = ({ size = 34, color = tokens.good }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 5-5" />
  </svg>
);

const TrophyIcon = ({ size = 34, color = tokens.good }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 21h8" /><path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
    <path d="M17 5h2.5a1.5 1.5 0 0 1 0 3H17" />
    <path d="M7 5H4.5a1.5 1.5 0 0 0 0 3H7" />
  </svg>
);

const SmallCheckIcon = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SmallXIcon = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getScoreColor = (isCorrect) => (isCorrect ? tokens.good : tokens.critical);

  if (loading) {
    return (
      <div style={styles.centered}>
        <style>{`${fontImport}
          @media (prefers-reduced-motion: no-preference) {
            .review-spinner { animation: review-spin 0.8s linear infinite; }
          }
          @keyframes review-spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={styles.loadingCard}>
          <span style={styles.loadingIconWrap}><SpinnerIcon /></span>
          <h2 style={styles.loadingTitle}>Loading your review queue...</h2>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.centered}>
        <style>{`${fontImport}
          .review-secondary-btn:hover { border-color: #CBD5E1; }
        `}</style>
        <div style={styles.loadingCard}>
          <span style={styles.loadingIconWrap}><CheckCircleIcon /></span>
          <h2 style={styles.loadingTitle}>Nothing due right now</h2>
          <p style={styles.emptyText}>Check back later — topics will surface here as they become due for review.</p>
          <button className="review-secondary-btn" style={styles.secondaryBtn} onClick={() => navigate(-1)}>
            ← Back to Subject
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= items.length) {
    return (
      <div style={styles.centered}>
        <style>{`${fontImport}
          .review-secondary-btn:hover { border-color: #CBD5E1; }
          .review-primary-btn:hover { background-color: ${tokens.accentHover} !important; }
        `}</style>
        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsIconWrap}><TrophyIcon /></span>
            <h2 style={styles.resultsTitle}>Review Complete!</h2>
            <p style={styles.resultsFeedback}>
              You've worked through all {items.length} due topic{items.length !== 1 ? 's' : ''}. Nice consistency.
            </p>
          </div>
          <div style={styles.resultsActions}>
            <button className="review-secondary-btn" style={styles.secondaryBtn} onClick={() => navigate(-1)}>
              ← Back to Subject
            </button>
            <button className="review-primary-btn" style={styles.primaryBtn} onClick={fetchDueReviews}>
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
      <style>{`${fontImport}
        .review-input:focus { outline: none; border-color: ${tokens.accent} !important; box-shadow: 0 0 0 3px ${tokens.accentSoft}; }
        .review-primary-btn:hover:not(:disabled) { background-color: ${tokens.accentHover} !important; }
      `}</style>
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
                className="review-input"
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
              className="review-primary-btn"
              style={{ ...styles.primaryBtn, opacity: (!answer.trim() || submitting) ? 0.5 : 1 }}
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
            >
              {submitting ? 'Checking...' : 'Submit Answer →'}
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
                backgroundColor: feedback.is_correct ? tokens.successSoft : tokens.dangerSoft,
                color: feedback.is_correct ? tokens.successText : tokens.dangerText
              }}>
                {feedback.is_correct
                  ? <><SmallCheckIcon color={tokens.successText} /> Correct</>
                  : <><SmallXIcon color={tokens.dangerText} /> Not quite</>}
              </span>
              <p style={styles.resultAnswer}>
                Next review in <strong>{feedback.interval_days} day{feedback.interval_days !== 1 ? 's' : ''}</strong>
              </p>
              <p style={styles.resultAnswer}>
                Updated mastery: <strong>{Math.round(feedback.updated_strength * 100)}%</strong>
              </p>
            </div>

            <button className="review-primary-btn" style={styles.primaryBtn} onClick={handleNext}>
              {currentIndex < items.length - 1 ? 'Next Topic →' : 'Finish Review →'}
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
    minHeight: '100vh',
    backgroundColor: tokens.paper,
    padding: '2rem',
    fontFamily: tokens.bodyFont,
  },
  loadingCard: {
    backgroundColor: tokens.card,
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    border: `1px solid ${tokens.border}`,
    boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
    maxWidth: '480px',
  },
  loadingIconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  loadingTitle: {
    fontFamily: tokens.displayFont,
    color: tokens.ink,
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: tokens.inkSoft,
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  quizCard: {
    backgroundColor: tokens.card,
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '680px',
    border: `1px solid ${tokens.border}`,
    boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
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
    color: tokens.inkSoft,
    fontWeight: '500',
  },
  progressPct: {
    fontSize: '0.85rem',
    color: tokens.accentText,
    fontWeight: '600',
  },
  progressBar: {
    height: '6px',
    backgroundColor: tokens.paper,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.accent,
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  },
  questionSection: {
    marginBottom: '2rem',
  },
  questionNumber: {
    display: 'inline-block',
    backgroundColor: tokens.accentSoft,
    color: tokens.accentText,
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    marginBottom: '1rem',
    letterSpacing: '0.05em',
    textTransform: 'capitalize',
  },
  questionText: {
    fontFamily: tokens.displayFont,
    fontSize: '1.4rem',
    color: tokens.ink,
    lineHeight: '1.5',
    fontWeight: '700',
    margin: 0,
  },
  answerSection: {
    marginBottom: '1.5rem',
  },
  answerLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontFamily: tokens.monoFont,
    fontWeight: '600',
    color: tokens.inkSoft,
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  answerInput: {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '10px',
    border: `2px solid ${tokens.border}`,
    fontSize: '1rem',
    color: tokens.ink,
    boxSizing: 'border-box',
    marginBottom: '0.4rem',
    fontFamily: 'inherit',
    backgroundColor: tokens.card,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  answerHint: {
    fontSize: '0.75rem',
    color: tokens.inkSoft,
  },
  primaryBtn: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: tokens.accent,
    color: tokens.onAccent,
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  secondaryBtn: {
    flex: 1,
    padding: '0.9rem',
    backgroundColor: tokens.card,
    color: tokens.ink,
    border: `2px solid ${tokens.border}`,
    borderRadius: '999px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  resultsCard: {
    backgroundColor: tokens.card,
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '680px',
    border: `1px solid ${tokens.border}`,
    boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
  },
  resultsHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: `1px solid ${tokens.paper}`,
  },
  resultsIconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  resultsTitle: {
    fontFamily: tokens.displayFont,
    fontSize: '1.8rem',
    color: tokens.ink,
    fontWeight: '700',
    marginBottom: '1rem',
  },
  resultsFeedback: {
    color: tokens.inkSoft,
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  resultItem: {
    padding: '1rem',
    backgroundColor: tokens.paper,
    borderRadius: '10px',
    marginBottom: '1.5rem',
  },
  resultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.2rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '0.6rem',
  },
  resultAnswer: {
    margin: '0 0 0.25rem',
    color: tokens.inkSoft,
    fontSize: '0.85rem',
  },
  resultsActions: {
    display: 'flex',
    gap: '1rem',
  },
};

export default ReviewQueue;
