import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <style>{`${fontImport}`}</style>
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
      <style>{`${fontImport}
        .diag-btn:hover { background-color: ${tokens.accentHover} !important; }
      `}</style>
      <div style={styles.loadingCard}>
        <p style={styles.error} role="alert">{error}</p>
        <button className="diag-btn" style={styles.button} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  if (submitted) {
    const correct = results.filter(r => r.is_correct).length;
    return (
      <div style={styles.container}>
        <style>{`${fontImport}
          .diag-btn:hover { background-color: ${tokens.accentHover} !important; }
        `}</style>
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
            {results.map((result) => {
              const question = questions.find(q => q.id === result.question_id);
              return (
                <div key={result.question_id} style={{
                  ...styles.resultItem,
                  borderLeft: `4px solid ${result.is_correct ? tokens.good : tokens.critical}`
                }}>
                <div style={styles.resultHeader}>
                  <span style={styles.topicTag}>{question?.topic}</span>
                  <span style={{
                    ...styles.resultStatus,
                    color: result.is_correct ? tokens.successText : tokens.dangerText,
                  }}>
                    {result.is_correct
                      ? <><SmallCheckIcon color={tokens.successText} /> Known</>
                      : <><SmallXIcon color={tokens.dangerText} /> Needs Work</>}
                  </span>
                </div>
                <p style={styles.resultQuestion}>{question?.question_text}</p>
                <p style={styles.userAnswer}>
                  Your answer: <strong>{result.user_answer}</strong>
                </p>
                {!result.is_correct && (
                  <p style={styles.correctAnswer}>
                    Correct answer: <strong>{result.correct_answer}</strong>
                  </p>
                )}
              </div>
              )})}
          </div>

          <button className="diag-btn" style={styles.button} onClick={() => navigate(`/subject/${subjectId}`)}>
            Start Adaptive Learning →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`${fontImport}
        .diag-btn:hover:not(:disabled) { background-color: ${tokens.accentHover} !important; }
        .diag-option-btn:hover { border-color: #CBD5E1; }
      `}</style>
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
                      className="diag-option-btn"
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
          className="diag-btn"
          style={{ ...styles.button, opacity: (!allAnswered || submitting) ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting ? 'Submitting...' : 'Complete Assessment →'}
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
    minHeight: '100vh',
    backgroundColor: tokens.paper,
    padding: '2rem',
    fontFamily: tokens.bodyFont,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.paper,
    padding: '2rem',
    fontFamily: tokens.bodyFont,
  },
  loadingCard: {
    backgroundColor: tokens.card,
    borderRadius: '16px',
    padding: '2.5rem',
    border: `1px solid ${tokens.border}`,
    boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  loadingTitle: {
    fontFamily: tokens.displayFont,
    color: tokens.ink,
    fontWeight: '700',
    marginBottom: '1rem',
  },
  loadingText: {
    color: tokens.inkSoft,
    lineHeight: '1.6',
  },
  card: {
    backgroundColor: tokens.card,
    borderRadius: '16px',
    padding: '2.5rem',
    border: `1px solid ${tokens.border}`,
    boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
    width: '100%',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  diagnosticBadge: {
    display: 'inline-block',
    backgroundColor: tokens.accentSoft,
    color: tokens.accentText,
    padding: '0.3rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  diagnosticInfo: {
    color: tokens.inkSoft,
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: 0,
  },
  progressBadge: {
    backgroundColor: tokens.paper,
    color: tokens.accentText,
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    border: `1px solid ${tokens.border}`,
  },
  questionBlock: {
    borderTop: `1px solid ${tokens.border}`,
    paddingTop: '1.5rem',
    marginTop: '1.5rem',
  },
  questionNumber: {
    display: 'inline-block',
    backgroundColor: tokens.accentSoft,
    color: tokens.accentText,
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    marginBottom: '0.75rem',
  },
  question: {
    fontFamily: tokens.displayFont,
    fontSize: '1.15rem',
    color: tokens.ink,
    marginBottom: '1.25rem',
    lineHeight: '1.5',
    fontWeight: '700',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  optionBtn: {
    width: '100%',
    padding: '0.85rem 1.1rem',
    backgroundColor: tokens.card,
    color: tokens.ink,
    border: `2px solid ${tokens.border}`,
    borderRadius: '10px',
    borderColor: tokens.border,
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, background-color 0.15s',
    fontFamily: 'inherit',
  },
  optionBtnSelected: {
    borderColor: tokens.accent,
    backgroundColor: tokens.accentSoft,
    color: tokens.accentText,
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '10px',
    border: `2px solid ${tokens.border}`,
    fontSize: '1rem',
    color: tokens.ink,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: tokens.card,
  },
  submitHint: {
    color: tokens.inkSoft,
    fontSize: '0.85rem',
    textAlign: 'center',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  button: {
    width: '100%',
    padding: '0.9rem',
    backgroundColor: tokens.accent,
    color: tokens.onAccent,
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.15s',
  },
  error: {
    color: tokens.dangerText,
    marginBottom: '1rem',
  },
  resultsTitle: {
    fontFamily: tokens.displayFont,
    fontSize: '1.8rem',
    color: tokens.ink,
    fontWeight: '700',
    margin: '0.5rem 0',
  },
  resultsSubtitle: {
    color: tokens.inkSoft,
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
    backgroundColor: tokens.paper,
    borderRadius: '12px',
  },
  scoreNum: {
    fontFamily: tokens.displayFont,
    fontSize: '3rem',
    fontWeight: '700',
    color: tokens.accentText,
  },
  scoreLabel: {
    fontSize: '1rem',
    color: tokens.inkSoft,
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  resultItem: {
    padding: '1rem',
    backgroundColor: tokens.paper,
    borderRadius: '8px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  topicTag: {
    backgroundColor: tokens.accentSoft,
    color: tokens.accentText,
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  resultStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  resultQuestion: {
    margin: '0 0 0.5rem',
    color: tokens.ink,
    fontSize: '0.95rem',
  },
  userAnswer: {
    margin: '0 0 0.25rem',
    color: tokens.inkSoft,
    fontSize: '0.9rem',
  },
  correctAnswer: {
    margin: 0,
    color: tokens.successText,
    fontSize: '0.9rem',
  },
};

export default DiagnosticQuiz;
