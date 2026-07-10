import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DiagnosticQuiz = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateDiagnostic();
  }, []);

  const generateDiagnostic = async () => {
    try {
      const response = await api.post(`/quiz/diagnostic/${subjectId}`);
      setQuizId(response.data.quiz_id);
      setQuestions(response.data.questions);
    } catch (err) {
      setError('Failed to generate diagnostic quiz. Make sure you have uploaded notes first.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([question_id, answer]) => ({
        question_id: parseInt(question_id),
        answer
      }));
      const response = await api.post(`/quiz/diagnostic/submit/${quizId}`, { answers: payload });
      setResults(response.data.results);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit diagnostic quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingCard}>
        <h2 style={styles.loadingTitle}>Generating Diagnostic Quiz...</h2>
        <p style={styles.loadingText}>
          We're writing each question specifically from your notes — this can take a minute or two. Hang tight.
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingCard}>
        <p style={styles.error}>{error}</p>
        <button style={styles.button} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  if (submitted) {
    const correct = results.filter(r => r.is_correct).length;
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.diagnosticBadge}>Diagnostic Complete</div>
          <h2 style={styles.resultsTitle}>Knowledge Baseline Set!</h2>
          <p style={styles.resultsSubtitle}>
            Your results have been used to personalise your learning experience.
            Future quizzes will focus on areas where you need the most improvement.
          </p>

          <div style={styles.scoreBox}>
            <span style={styles.scoreNum}>{correct}/{results.length}</span>
            <span style={styles.scoreLabel}>Initial Knowledge Score</span>
          </div>

          <div style={styles.resultsList}>
            {results.map((result, i) => (
              <div key={i} style={{
                ...styles.resultItem,
                borderLeft: `4px solid ${result.is_correct ? '#22C55E' : '#EF4444'}`
              }}>
                <div style={styles.resultHeader}>
                  <span style={styles.topicTag}>{questions[i]?.topic}</span>
                  <span style={{ color: result.is_correct ? '#22C55E' : '#EF4444', fontWeight: 'bold' }}>
                    {result.is_correct ? '✓ Known' : '✗ Needs Work'}
                  </span>
                </div>
                <p style={styles.resultQuestion}>{questions[i]?.question_text}</p>
                <p style={styles.userAnswer}>
                  Your answer: <strong>{result.user_answer}</strong>
                </p>
                {!result.is_correct && (
                  <p style={styles.correctAnswer}>
                    Correct answer: <strong>{result.correct_answer}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>

          <button style={styles.button} onClick={() => navigate(`/subject/${subjectId}`)}>
            Start Adaptive Learning →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, maxWidth: '720px' }}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.diagnosticBadge}>Knowledge Assessment</div>
            <p style={styles.diagnosticInfo}>
              Answer these questions so we can personalise your learning experience.
              Don't worry if you don't know — just do your best!
            </p>
          </div>
          <span style={styles.progressBadge}>{answeredCount} / {questions.length} answered</span>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} style={styles.questionBlock}>
            <div style={styles.questionNumber}>Q{index + 1}</div>
            <h2 style={styles.question}>{question.question_text}</h2>

            {question.question_type === 'mcq' && question.options ? (
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
                      onClick={() => handleSelectOption(question.id, option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                style={styles.input}
                type="text"
                placeholder="Type your answer here..."
                value={answers[question.id] || ''}
                onChange={(e) => handleSelectOption(question.id, e.target.value)}
              />
            )}
          </div>
        ))}

        {!allAnswered && (
          <p style={styles.submitHint}>Answer all {questions.length} questions to submit</p>
        )}
        <button
          style={{ ...styles.button, opacity: (!allAnswered || submitting) ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting ? 'Submitting...' : 'Complete Assessment ✓'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f0f4f8',
    padding: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    backgroundColor: '#f0f4f8',
    padding: '2rem',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  loadingTitle: {
    color: '#1A1A2E',
    marginBottom: '1rem',
  },
  loadingText: {
    color: '#666',
    lineHeight: '1.6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  diagnosticBadge: {
    display: 'inline-block',
    backgroundColor: '#E0F7FA',
    color: '#00838F',
    padding: '0.3rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },
  diagnosticInfo: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: 0,
  },
  progressBadge: {
    backgroundColor: '#F0F4F8',
    color: '#00B4D8',
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  questionBlock: {
    borderTop: '1px solid #F1F5F9',
    paddingTop: '1.5rem',
    marginTop: '1.5rem',
  },
  questionNumber: {
    display: 'inline-block',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    marginBottom: '0.75rem',
  },
  question: {
    fontSize: '1.15rem',
    color: '#1A1A2E',
    marginBottom: '1.25rem',
    lineHeight: '1.5',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  optionBtn: {
    width: '100%',
    padding: '0.85rem 1.1rem',
    backgroundColor: '#fff',
    color: '#1A1A2E',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  optionBtnSelected: {
    borderColor: '#00B4D8',
    backgroundColor: '#EFFCFF',
    color: '#00838F',
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '8px',
    border: '2px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitHint: {
    color: '#94A3B8',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  button: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
  resultsTitle: {
    fontSize: '1.8rem',
    color: '#1A1A2E',
    margin: '0.5rem 0',
  },
  resultsSubtitle: {
    color: '#666',
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  scoreBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f0f4f8',
    borderRadius: '12px',
  },
  scoreNum: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#00B4D8',
  },
  scoreLabel: {
    fontSize: '1rem',
    color: '#666',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  resultItem: {
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  topicTag: {
    backgroundColor: '#E0F7FA',
    color: '#00838F',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  resultQuestion: {
    margin: '0 0 0.5rem',
    color: '#1A1A2E',
    fontSize: '0.95rem',
  },
  userAnswer: {
    margin: '0 0 0.25rem',
    color: '#475569',
    fontSize: '0.9rem',
  },
  correctAnswer: {
    margin: 0,
    color: '#22C55E',
    fontSize: '0.9rem',
  },
};

export default DiagnosticQuiz;