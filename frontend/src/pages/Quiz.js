import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

const SpinnerIcon = () => (
  <svg className="quiz-spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke={tokens.border} strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={tokens.accent} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const TrophyIcon = ({ color }) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 21h8" /><path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
    <path d="M17 5h2.5a1.5 1.5 0 0 1 0 3H17" />
    <path d="M7 5H4.5a1.5 1.5 0 0 0 0 3H7" />
  </svg>
);

const TargetIcon = ({ color }) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill={color} stroke="none" />
  </svg>
);

const BookIcon = ({ color }) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

const CheckCircleIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XCircleIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subjectId, setSubjectId] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${quizId}`);
      setQuestions(response.data.questions);
      setSubjectId(response.data.subject_id);
    } catch (err) {
      console.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleToggleMultiSelect = (questionId, option) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const isAnswered = (question) => {
    const a = answers[question.id];
    if (question.question_type === 'multi_select') {
      return Array.isArray(a) && a.length > 0;
    }
    return !!a && a.toString().trim() !== '';
  };

  const allAnswered = questions.length > 0 && questions.every(isAnswered);
  const answeredCount = questions.filter(isAnswered).length;

  const formatAnswerForDisplay = (question, rawAnswer) => {
    if (question.question_type === 'multi_select') {
      if (Array.isArray(rawAnswer)) return rawAnswer.join(', ');
      try {
        return JSON.parse(rawAnswer).join(', ');
      } catch {
        return rawAnswer;
      }
    }
    return rawAnswer;
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({
        question_id: q.id,
        answer: q.question_type === 'multi_select'
          ? JSON.stringify(answers[q.id])
          : answers[q.id]
      }));
      const response = await api.post(`/quiz/attempt/${quizId}`, { answers: payload });
      setResults(response.data.results);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getScore = () => {
    const correct = results.filter(r => r.is_correct).length;
    return { correct, total: results.length };
  };

  const getScoreColor = (pct) => {
    if (pct >= 70) return tokens.good;
    if (pct >= 40) return tokens.moderate;
    return tokens.critical;
  };

  if (loading) return (
    <div style={styles.centered}>
      <style>{`${fontImport}
        @media (prefers-reduced-motion: no-preference) {
          .quiz-spinner { animation: quiz-spin 0.8s linear infinite; }
        }
        @keyframes quiz-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={styles.loadingCard}>
        <span style={styles.loadingIconWrap}><SpinnerIcon /></span>
        <h2 style={styles.loadingTitle}>Generating your quiz...</h2>
        <p style={styles.loadingText}>
          Each question is being written specifically for you — this can take a minute or two. Hang tight.
        </p>
      </div>
    </div>
  );

  if (submitted) {
    const { correct, total } = getScore();
    const percentage = Math.round((correct / total) * 100);
    const scoreColor = getScoreColor(percentage);
    const ResultIcon = percentage >= 70 ? TrophyIcon : percentage >= 40 ? TargetIcon : BookIcon;
    return (
      <div style={styles.centered}>
        <style>{`${fontImport}
          .quiz-back-btn:hover { background-color: ${tokens.accentHover} !important; }
          button { cursor: pointer; }
          button:focus-visible { outline: 2px solid ${tokens.accent}; outline-offset: 2px; }
        `}</style>
        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsIconWrap}><ResultIcon color={scoreColor} /></span>
            <h2 style={styles.resultsTitle}>Quiz Complete!</h2>
            <div style={{ ...styles.scoreCircle, borderColor: scoreColor }}>
              <span style={{ ...styles.scoreNum, color: scoreColor }}>{percentage}%</span>
              <span style={styles.scoreLabel}>{correct}/{total} correct</span>
            </div>
            <p style={styles.resultsFeedback}>
              {percentage >= 70
                ? 'Excellent work! Your knowledge is strong in these areas.'
                : percentage >= 40
                ? 'Good effort! Keep practising the areas you missed.'
                : 'Keep going! The adaptive system will focus on these topics next time.'}
            </p>
          </div>

          <div style={styles.resultsList}>
            {results.map((result, i) => {
              const question = questions[i];
              return (
                <div key={i} style={{
                  ...styles.resultItem,
                  borderLeft: `4px solid ${result.is_correct ? tokens.good : tokens.critical}`
                }}>
                  <div style={styles.resultHeader}>
                    <span style={{
                      ...styles.resultBadge,
                      backgroundColor: result.is_correct ? tokens.successSoft : tokens.dangerSoft,
                      color: result.is_correct ? tokens.successText : tokens.dangerText
                    }}>
                      {result.is_correct
                        ? <><CheckCircleIcon color={tokens.successText} /> Correct</>
                        : <><XCircleIcon color={tokens.dangerText} /> Incorrect</>}
                    </span>
                  </div>
                  <p style={styles.resultQuestion}>{question?.question_text}</p>
                  <p style={styles.resultAnswer}>
                    Your answer: <strong>{formatAnswerForDisplay(question, answers[question?.id])}</strong>
                  </p>
                  {!result.is_correct && (
                    <p style={styles.correctAnswer}>
                      <CheckCircleIcon color={tokens.successText} /> Correct answer: <strong>{formatAnswerForDisplay(question, result.correct_answer)}</strong>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button className="quiz-back-btn" style={styles.primaryBtn} onClick={() => navigate(`/subject/${subjectId}`)}>
            Back to Subject →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <style>{`${fontImport}
        .quiz-option-btn:hover { border-color: #CBD5E1; }
        .quiz-submit-btn:hover:not(:disabled) { background-color: ${tokens.accentHover} !important; }
        button { cursor: pointer; }
        button:focus-visible, select:focus-visible { outline: 2px solid ${tokens.accent}; outline-offset: 2px; }
      `}</style>
      <div style={styles.quizWrapper}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Adaptive Quiz</h1>
          <span style={styles.progressBadge}>{answeredCount} / {questions.length} answered</span>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} style={styles.questionCard}>
            <div style={styles.questionNumber}>Q{index + 1}</div>

            {question.question_type === 'fill_blank' && question.options ? (
              <>
                <p style={styles.fillBlankSentence}>
                  {question.question_text.split('_____')[0]}
                  <select
                    style={styles.inlineSelect}
                    value={answers[question.id] || ''}
                    onChange={(e) => handleSetAnswer(question.id, e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    {question.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {question.question_text.split('_____')[1]}
                </p>
              </>
            ) : (
              <>
                <h2 style={styles.questionText}>{question.question_text}</h2>

                {question.question_type === 'mcq' && question.options && (
                  <div style={styles.optionsGrid}>
                    {question.options.map((option, i) => {
                      const isSelected = answers[question.id] === option;
                      return (
                        <button
                          key={i}
                          className="quiz-option-btn"
                          style={{
                            ...styles.optionBtn,
                            ...(isSelected ? styles.optionBtnSelected : {}),
                          }}
                          onClick={() => handleSetAnswer(question.id, option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.question_type === 'multi_select' && question.options && (
                  <>
                    <p style={styles.multiSelectHint}>Select all that apply</p>
                    <div style={styles.optionsGrid}>
                      {question.options.map((option, i) => {
                        const selectedArr = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                        const isSelected = selectedArr.includes(option);
                        return (
                          <button
                            key={i}
                            className="quiz-option-btn"
                            style={{
                              ...styles.optionBtn,
                              ...styles.checkboxOptionBtn,
                              ...(isSelected ? styles.optionBtnSelected : {}),
                            }}
                            onClick={() => handleToggleMultiSelect(question.id, option)}
                          >
                            <span style={{
                              ...styles.miniCheckbox,
                              ...(isSelected ? styles.miniCheckboxChecked : {}),
                            }}>
                              {isSelected && <CheckCircleIcon color="#FFFFFF" />}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {question.question_type === 'long_answer' && (
                  <input
                    style={styles.answerInput}
                    type="text"
                    placeholder="Type your answer here..."
                    value={answers[question.id] || ''}
                    onChange={(e) => handleSetAnswer(question.id, e.target.value)}
                  />
                )}
              </>
            )}
          </div>
        ))}

        <div style={styles.submitSection}>
          {!allAnswered && (
            <p style={styles.submitHint}>Answer all {questions.length} questions to submit</p>
          )}
          <button
            className="quiz-submit-btn"
            style={{ ...styles.submitBtn, opacity: (!allAnswered || submitting) ? 0.5 : 1 }}
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz →'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  centered: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', backgroundColor: tokens.paper, padding: '2rem', fontFamily: tokens.bodyFont,
  },
  loadingCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '3rem', textAlign: 'center',
    border: `1px solid ${tokens.border}`, boxShadow: '0 4px 20px rgba(33,29,28,0.08)', maxWidth: '420px',
  },
  loadingIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  loadingTitle: { fontFamily: tokens.displayFont, color: tokens.ink, fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem' },
  loadingText: { color: tokens.inkSoft, fontSize: '0.9rem', lineHeight: '1.5' },
  pageContainer: { backgroundColor: tokens.paper, minHeight: '100vh', padding: '2rem', fontFamily: tokens.bodyFont },
  quizWrapper: { maxWidth: '720px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
    position: 'sticky', top: 0, backgroundColor: tokens.paper, padding: '0.5rem 0', zIndex: 10,
  },
  headerTitle: { fontFamily: tokens.displayFont, fontSize: '1.5rem', fontWeight: '700', color: tokens.ink, margin: 0 },
  progressBadge: {
    backgroundColor: tokens.card, color: tokens.accentText, fontWeight: '700', fontSize: '0.85rem',
    padding: '0.4rem 0.9rem', borderRadius: '20px', border: `1px solid ${tokens.border}`, boxShadow: '0 2px 8px rgba(33,29,28,0.06)',
  },
  questionCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem',
    border: `1px solid ${tokens.border}`, boxShadow: '0 2px 12px rgba(33,29,28,0.06)',
  },
  questionNumber: {
    display: 'inline-block', backgroundColor: tokens.accentSoft, color: tokens.accentText, fontSize: '0.75rem',
    fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '20px', marginBottom: '0.9rem',
    letterSpacing: '0.05em',
  },
  questionText: { fontSize: '1.15rem', color: tokens.ink, lineHeight: '1.5', fontWeight: '600', margin: '0 0 1.25rem' },
  fillBlankSentence: { fontSize: '1.1rem', color: tokens.ink, lineHeight: '2.2', fontWeight: '500' },
  inlineSelect: {
    display: 'inline-block', margin: '0 0.4rem', padding: '0.3rem 0.6rem', borderRadius: '8px',
    border: `2px solid ${tokens.accent}`, backgroundColor: tokens.accentSoft, color: tokens.accentText, fontWeight: '700',
    fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
  },
  multiSelectHint: { color: tokens.inkSoft, fontSize: '0.8rem', margin: '-0.75rem 0 1rem' },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  optionBtn: {
    width: '100%', padding: '0.85rem 1.1rem', backgroundColor: tokens.card, color: tokens.ink,
    border: `2px solid ${tokens.border}`, borderRadius: '10px', borderColor: tokens.border, fontSize: '0.95rem', fontWeight: '600',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
  },
  optionBtnSelected: { borderColor: tokens.accent, backgroundColor: tokens.accentSoft, color: tokens.accentText },
  checkboxOptionBtn: { display: 'flex', alignItems: 'center', gap: '0.7rem', outline: 'none', },
  miniCheckbox: {
    width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${tokens.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
    flexShrink: 0,
  },
  miniCheckboxChecked: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  answerInput: {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `2px solid ${tokens.border}`,
    fontSize: '0.95rem', color: tokens.ink, boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: tokens.card,
  },
  submitSection: { textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '2rem' },
  submitHint: { color: tokens.inkSoft, fontSize: '0.85rem', marginBottom: '0.75rem' },
  submitBtn: {
    padding: '0.95rem 2.5rem', backgroundColor: tokens.accent, color: tokens.onAccent, border: 'none',
    borderRadius: '999px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.15s',
  },
  resultsCard: {
    backgroundColor: tokens.card, borderRadius: '20px', padding: '2.5rem', width: '100%',
    maxWidth: '680px', border: `1px solid ${tokens.border}`, boxShadow: '0 4px 24px rgba(33,29,28,0.08)',
  },
  resultsHeader: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: `1px solid ${tokens.paper}` },
  resultsIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' },
  resultsTitle: { fontFamily: tokens.displayFont, fontSize: '1.8rem', color: tokens.ink, fontWeight: '700', marginBottom: '1.5rem' },
  scoreCircle: {
    width: '120px', height: '120px', borderRadius: '50%', border: '4px solid', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
  },
  scoreNum: { fontFamily: tokens.displayFont, fontSize: '2rem', fontWeight: '700', lineHeight: 1 },
  scoreLabel: { fontSize: '0.75rem', color: tokens.inkSoft, marginTop: '0.25rem' },
  resultsFeedback: { color: tokens.inkSoft, fontSize: '0.95rem', lineHeight: '1.5' },
  resultsList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  resultItem: { padding: '1rem', backgroundColor: tokens.paper, borderRadius: '10px' },
  resultHeader: { marginBottom: '0.5rem' },
  resultBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  resultQuestion: { margin: '0 0 0.4rem', fontWeight: '600', color: tokens.ink, fontSize: '0.95rem' },
  resultAnswer: { margin: '0 0 0.25rem', color: tokens.inkSoft, fontSize: '0.85rem' },
  correctAnswer: { margin: 0, color: tokens.successText, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' },
  primaryBtn: {
    width: '100%', padding: '0.9rem', backgroundColor: tokens.accent, color: tokens.onAccent, border: 'none',
    borderRadius: '999px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.15s',
  },
};

export default Quiz;
