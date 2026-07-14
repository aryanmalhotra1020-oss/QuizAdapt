import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
    if (pct >= 70) return '#22C55E';
    if (pct >= 40) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.loadingCard}>
        <span style={styles.loadingIcon}>🧠</span>
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
    return (
      <div style={styles.centered}>
        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsEmoji}>
              {percentage >= 70 ? '🎉' : percentage >= 40 ? '💪' : '📚'}
            </span>
            <h2 style={styles.resultsTitle}>Quiz Complete!</h2>
            <div style={{ ...styles.scoreCircle, borderColor: getScoreColor(percentage) }}>
              <span style={{ ...styles.scoreNum, color: getScoreColor(percentage) }}>{percentage}%</span>
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
                  borderLeft: `4px solid ${result.is_correct ? '#22C55E' : '#EF4444'}`
                }}>
                  <div style={styles.resultHeader}>
                    <span style={{
                      ...styles.resultBadge,
                      backgroundColor: result.is_correct ? '#F0FDF4' : '#FEF2F2',
                      color: result.is_correct ? '#16A34A' : '#DC2626'
                    }}>
                      {result.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p style={styles.resultQuestion}>{question?.question_text}</p>
                  <p style={styles.resultAnswer}>
                    Your answer: <strong>{formatAnswerForDisplay(question, answers[question?.id])}</strong>
                  </p>
                  {!result.is_correct && (
                    <p style={styles.correctAnswer}>
                      ✓ Correct answer: <strong>{formatAnswerForDisplay(question, result.correct_answer)}</strong>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button style={styles.primaryBtn} onClick={() => navigate(`/subject/${subjectId}`)}>
            Back to Subject →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
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
                              {isSelected && '✓'}
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
            style={{ ...styles.submitBtn, opacity: (!allAnswered || submitting) ? 0.5 : 1 }}
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  centered: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: 'calc(100vh - 64px)', backgroundColor: '#F0F4F8', padding: '2rem',
  },
  loadingCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '3rem', textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '420px',
  },
  loadingIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '1rem' },
  loadingTitle: { color: '#1A1A2E', fontSize: '1.3rem', marginBottom: '0.75rem' },
  loadingText: { color: '#64748B', fontSize: '0.9rem', lineHeight: '1.5' },
  pageContainer: { backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 64px)', padding: '2rem' },
  quizWrapper: { maxWidth: '720px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
    position: 'sticky', top: 0, backgroundColor: '#F0F4F8', padding: '0.5rem 0', zIndex: 10,
  },
  headerTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#1A1A2E', margin: 0 },
  progressBadge: {
    backgroundColor: '#fff', color: '#00B4D8', fontWeight: '700', fontSize: '0.85rem',
    padding: '0.4rem 0.9rem', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  questionCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  questionNumber: {
    display: 'inline-block', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.75rem',
    fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '20px', marginBottom: '0.9rem',
    letterSpacing: '0.05em',
  },
  questionText: { fontSize: '1.15rem', color: '#1A1A2E', lineHeight: '1.5', fontWeight: '600', margin: '0 0 1.25rem' },
  fillBlankSentence: { fontSize: '1.1rem', color: '#1A1A2E', lineHeight: '2.2', fontWeight: '500' },
  inlineSelect: {
    display: 'inline-block', margin: '0 0.4rem', padding: '0.3rem 0.6rem', borderRadius: '8px',
    border: '2px solid #00B4D8', backgroundColor: '#EFFCFF', color: '#00838F', fontWeight: '700',
    fontSize: '1rem', cursor: 'pointer',
  },
  multiSelectHint: { color: '#94A3B8', fontSize: '0.8rem', margin: '-0.75rem 0 1rem' },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  optionBtn: {
    width: '100%', padding: '0.85rem 1.1rem', backgroundColor: '#fff', color: '#1A1A2E',
    border: '2px solid #E2E8F0', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
  },
  optionBtnSelected: { borderColor: '#00B4D8', backgroundColor: '#EFFCFF', color: '#00838F' },
  checkboxOptionBtn: { display: 'flex', alignItems: 'center', gap: '0.7rem' },
  miniCheckbox: {
    width: '18px', height: '18px', borderRadius: '5px', border: '2px solid #CBD5E1',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
    color: '#fff', flexShrink: 0,
  },
  miniCheckboxChecked: { backgroundColor: '#00B4D8', borderColor: '#00B4D8' },
  answerInput: {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '2px solid #E2E8F0',
    fontSize: '0.95rem', color: '#1A1A2E', boxSizing: 'border-box',
  },
  submitSection: { textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '2rem' },
  submitHint: { color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.75rem' },
  submitBtn: {
    padding: '0.95rem 2.5rem', backgroundColor: '#00B4D8', color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
  },
  resultsCard: {
    backgroundColor: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%',
    maxWidth: '680px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  resultsHeader: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #F1F5F9' },
  resultsEmoji: { fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' },
  resultsTitle: { fontSize: '1.8rem', color: '#1A1A2E', fontWeight: '800', marginBottom: '1.5rem' },
  scoreCircle: {
    width: '120px', height: '120px', borderRadius: '50%', border: '4px solid', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
  },
  scoreNum: { fontSize: '2rem', fontWeight: '800', lineHeight: 1 },
  scoreLabel: { fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' },
  resultsFeedback: { color: '#64748B', fontSize: '0.95rem', lineHeight: '1.5' },
  resultsList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  resultItem: { padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '10px' },
  resultHeader: { marginBottom: '0.5rem' },
  resultBadge: { display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  resultQuestion: { margin: '0 0 0.4rem', fontWeight: '600', color: '#1A1A2E', fontSize: '0.95rem' },
  resultAnswer: { margin: '0 0 0.25rem', color: '#64748B', fontSize: '0.85rem' },
  correctAnswer: { margin: 0, color: '#16A34A', fontSize: '0.85rem' },
  primaryBtn: {
    width: '100%', padding: '0.9rem', backgroundColor: '#00B4D8', color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
  },
};

export default Quiz;