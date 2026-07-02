import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
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

  const handleNext = () => {
    if (!currentAnswer.trim()) return;
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: currentAnswer
    }));
    setCurrentAnswer('');
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;
    const finalAnswers = {
      ...answers,
      [questions[currentIndex].id]: currentAnswer
    };

    setSubmitting(true);
    try {
      const payload = Object.entries(finalAnswers).map(([question_id, answer]) => ({
        question_id: parseInt(question_id),
        answer
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
        <span style={styles.loadingIcon}>⏳</span>
        <h2 style={styles.loadingTitle}>Loading your quiz...</h2>
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
            <div style={{
              ...styles.scoreCircle,
              borderColor: getScoreColor(percentage)
            }}>
              <span style={{ ...styles.scoreNum, color: getScoreColor(percentage) }}>
                {percentage}%
              </span>
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
            {results.map((result, i) => (
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
                <p style={styles.resultQuestion}>{questions[i]?.question_text}</p>
                <p style={styles.resultAnswer}>
                  Your answer: <strong>{Object.values(answers)[i] || currentAnswer}</strong>
                </p>
                {!result.is_correct && (
                  <p style={styles.correctAnswer}>
                    ✓ Correct answer: <strong>{result.correct_answer}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={styles.resultsActions}>
            <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
              ← Back to Subject
            </button>
            <button style={styles.primaryBtn} onClick={() => navigate(`/performance/${subjectId}`)}>
              View Performance →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={styles.centered}>
      <div style={styles.quizCard}>
        {/* Progress */}
        <div style={styles.progressSection}>
          <div style={styles.progressInfo}>
            <span style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</span>
            <span style={styles.progressPct}>{Math.round(progress)}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div style={styles.questionSection}>
          <div style={styles.questionNumber}>Q{currentIndex + 1}</div>
          <h2 style={styles.questionText}>{question?.question_text}</h2>
        </div>

        {/* Answer */}
        <div style={styles.answerSection}>
          <label style={styles.answerLabel}>Your Answer</label>
          <input
            style={styles.answerInput}
            type="text"
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                currentIndex < questions.length - 1 ? handleNext() : handleSubmit();
              }
            }}
            autoFocus
          />
          <p style={styles.answerHint}>Press Enter or click the button to continue</p>
        </div>

        {/* Button */}
        {currentIndex < questions.length - 1 ? (
          <button
            style={{ ...styles.primaryBtn, opacity: !currentAnswer.trim() ? 0.5 : 1 }}
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
          >
            Next Question →
          </button>
        ) : (
          <button
            style={{ ...styles.primaryBtn, opacity: (!currentAnswer.trim() || submitting) ? 0.5 : 1 }}
            onClick={handleSubmit}
            disabled={!currentAnswer.trim() || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
          </button>
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
  },
  loadingIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '1rem',
  },
  loadingTitle: {
    color: '#1A1A2E',
    fontSize: '1.3rem',
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
    marginBottom: '1.5rem',
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  scoreNum: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: '#94A3B8',
    marginTop: '0.25rem',
  },
  resultsFeedback: {
    color: '#64748B',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  resultItem: {
    padding: '1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
  },
  resultHeader: {
    marginBottom: '0.5rem',
  },
  resultBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  resultQuestion: {
    margin: '0 0 0.4rem',
    fontWeight: '600',
    color: '#1A1A2E',
    fontSize: '0.95rem',
  },
  resultAnswer: {
    margin: '0 0 0.25rem',
    color: '#64748B',
    fontSize: '0.85rem',
  },
  correctAnswer: {
    margin: 0,
    color: '#16A34A',
    fontSize: '0.85rem',
  },
  resultsActions: {
    display: 'flex',
    gap: '1rem',
  },
};

export default Quiz;