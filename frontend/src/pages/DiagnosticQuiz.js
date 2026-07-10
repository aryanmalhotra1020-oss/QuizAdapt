import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DiagnosticQuiz = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
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

  const submitAnswers = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const payload = Object.entries(finalAnswers).map(([question_id, answer]) => ({
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

  const handleNext = () => {
    if (!currentAnswer.trim()) return;
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: currentAnswer
    }));
    setCurrentAnswer('');
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    const finalAnswers = {
      ...answers,
      [questions[currentIndex].id]: currentAnswer
    };
    submitAnswers(finalAnswers);
  };

  const handleSelectOption = (option) => {
    const questionId = questions[currentIndex].id;
    const updatedAnswers = { ...answers, [questionId]: option };
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      submitAnswers(updatedAnswers);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingCard}>
        <h2 style={styles.loadingTitle}>Generating Diagnostic Quiz...</h2>
        <p style={styles.loadingText}>We're creating questions to assess your current knowledge level. This may take a moment.</p>
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

  const question = questions[currentIndex];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.diagnosticBadge}>Knowledge Assessment</div>
        <p style={styles.diagnosticInfo}>
          Answer these questions so we can personalise your learning experience.
          Don't worry if you don't know — just do your best!
        </p>

        <div style={styles.progress}>
          <span style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${((currentIndex + 1) / questions.length) * 100}%`
            }} />
          </div>
        </div>

        <h2 style={styles.question}>{question?.question_text}</h2>

        {question?.question_type === 'mcq' && question.options ? (
          <div style={styles.optionsGrid}>
            {question.options.map((option, i) => (
              <button
                key={i}
                style={styles.optionBtn}
                onClick={() => handleSelectOption(option)}
                disabled={submitting}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <>
            <input
              style={styles.input}
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

            {currentIndex < questions.length - 1 ? (
              <button style={styles.button} onClick={handleNext} disabled={!currentAnswer.trim()}>
                Next Question →
              </button>
            ) : (
              <button style={styles.button} onClick={handleSubmit} disabled={!currentAnswer.trim() || submitting}>
                {submitting ? 'Submitting...' : 'Complete Assessment ✓'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: '680px',
  },
  diagnosticBadge: {
    display: 'inline-block',
    backgroundColor: '#E0F7FA',
    color: '#00838F',
    padding: '0.3rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  diagnosticInfo: {
    color: '#666',
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  progress: {
    marginBottom: '2rem',
  },
  progressText: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'block',
    marginBottom: '0.5rem',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B4D8',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  question: {
    fontSize: '1.4rem',
    color: '#1A1A2E',
    marginBottom: '2rem',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '8px',
    border: '2px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '1.5rem',
    boxSizing: 'border-box',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  optionBtn: {
    width: '100%',
    padding: '0.9rem 1.1rem',
    backgroundColor: '#fff',
    color: '#1A1A2E',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    textTransform: 'capitalize',
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