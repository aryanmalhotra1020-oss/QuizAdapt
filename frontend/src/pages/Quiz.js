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

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${quizId}`);
      setQuestions(response.data.questions);
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

  if (loading) return <div style={styles.loading}>Loading quiz...</div>;

  if (submitted) {
    const { correct, total } = getScore();
    return (
      <div style={styles.container}>
        <div style={styles.resultsCard}>
          <h2 style={styles.resultsTitle}>Quiz Complete! 🎉</h2>
          <div style={styles.scoreBox}>
            <span style={styles.scoreNum}>{correct}/{total}</span>
            <span style={styles.scoreLabel}>Correct</span>
          </div>
          <div style={styles.resultsList}>
            {results.map((result, i) => (
              <div key={i} style={{
                ...styles.resultItem,
                borderLeft: `4px solid ${result.is_correct ? '#22C55E' : '#EF4444'}`
              }}>
                <p style={styles.resultQuestion}>{questions[i]?.question_text}</p>
                <p style={styles.resultAnswer}>
                  Your answer: <strong>{Object.values(answers)[i] || currentAnswer}</strong>
                </p>
                {!result.is_correct && (
                  <p style={styles.correctAnswer}>
                    Correct answer: <strong>{result.correct_answer}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
          <button style={styles.button} onClick={() => navigate(-1)}>
            Back to Subject
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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
            {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
          </button>
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
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 60px)',
    color: '#666',
    fontSize: '1.2rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '680px',
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
    transition: 'border-color 0.2s',
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
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '680px',
  },
  resultsTitle: {
    fontSize: '1.8rem',
    color: '#1A1A2E',
    marginBottom: '1.5rem',
    textAlign: 'center',
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
  resultQuestion: {
    margin: '0 0 0.5rem',
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  resultAnswer: {
    margin: '0 0 0.25rem',
    color: '#666',
    fontSize: '0.9rem',
  },
  correctAnswer: {
    margin: 0,
    color: '#22C55E',
    fontSize: '0.9rem',
  },
};

export default Quiz;