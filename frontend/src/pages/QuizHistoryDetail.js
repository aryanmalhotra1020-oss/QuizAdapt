import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

const TrophyIcon = ({ color }) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 21h8" /><path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
    <path d="M17 5h2.5a1.5 1.5 0 0 1 0 3H17" />
    <path d="M7 5H4.5a1.5 1.5 0 0 0 0 3H7" />
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

const formatAnswer = (question, rawAnswer) => {
  if (!rawAnswer) return '(no answer)';
  if (question.question_type === 'multi_select') {
    try {
      return JSON.parse(rawAnswer).join(', ');
    } catch {
      return rawAnswer;
    }
  }
  return rawAnswer;
};

const QuizHistoryDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/quiz/history/${quizId}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load this quiz.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const getScoreColor = (pct) => {
    if (pct >= 70) return tokens.good;
    if (pct >= 40) return tokens.moderate;
    return tokens.critical;
  };

  if (loading) return (
    <div style={styles.centered}>
      <style>{fontImport}</style>
      <p style={{ color: tokens.inkSoft, fontFamily: tokens.bodyFont }}>Loading...</p>
    </div>
  );

  if (error || !data) return (
    <div style={styles.centered}>
      <style>{fontImport}</style>
      <p style={{ color: tokens.dangerText, fontFamily: tokens.bodyFont }}>{error}</p>
    </div>
  );

  const correct = data.questions.filter(q => q.is_correct).length;
  const total = data.questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreColor = getScoreColor(percentage);

  return (
    <div style={styles.centered}>
      <style>{`${fontImport}
        .qhd-back-btn:hover { background-color: ${tokens.accentHover} !important; }
        button { cursor: pointer; }
        button:focus-visible { outline: 2px solid ${tokens.accent}; outline-offset: 2px; }
      `}</style>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.iconWrap}><TrophyIcon color={scoreColor} /></span>
          <span style={styles.badge}>
            {data.type === 'diagnostic' ? 'Diagnostic' : data.type === 'adaptive' ? 'Adaptive Quiz' : 'Initial Quiz'}
          </span>
          <h2 style={styles.title}>Quiz Review</h2>
          <p style={styles.date}>
            {new Date(data.attempted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div style={{ ...styles.scoreCircle, borderColor: scoreColor }}>
            <span style={{ ...styles.scoreNum, color: scoreColor }}>{percentage}%</span>
            <span style={styles.scoreLabel}>{correct}/{total} correct</span>
          </div>
        </div>

        <div style={styles.resultsList}>
          {data.questions.map((q) => (
            <div key={q.question_id} style={{
              ...styles.resultItem,
              borderLeft: `4px solid ${q.is_correct ? tokens.good : tokens.critical}`
            }}>
              <span style={{
                ...styles.resultBadge,
                backgroundColor: q.is_correct ? tokens.successSoft : tokens.dangerSoft,
                color: q.is_correct ? tokens.successText : tokens.dangerText
              }}>
                {q.is_correct
                  ? <><CheckCircleIcon color={tokens.successText} /> Correct</>
                  : <><XCircleIcon color={tokens.dangerText} /> Incorrect</>}
              </span>
              <p style={styles.resultQuestion}>{q.question_text}</p>
              <p style={styles.resultAnswer}>
                Your answer: <strong>{formatAnswer(q, q.user_answer)}</strong>
              </p>
              {!q.is_correct && (
                <p style={styles.correctAnswer}>
                  <CheckCircleIcon color={tokens.successText} /> Correct answer: <strong>{formatAnswer(q, q.correct_answer)}</strong>
                </p>
              )}
            </div>
          ))}
        </div>

        <button className="qhd-back-btn" style={styles.primaryBtn} onClick={() => navigate(`/subject/${data.subject_id}`)}>
          Back to Subject →
        </button>
      </div>
    </div>
  );
};

const styles = {
  centered: { display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: tokens.paper, padding: '2rem', fontFamily: tokens.bodyFont },
  card: {
    backgroundColor: tokens.card, borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '680px',
    border: `1px solid ${tokens.border}`, boxShadow: '0 4px 24px rgba(33,29,28,0.08)',
  },
  header: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: `1px solid ${tokens.paper}` },
  iconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' },
  badge: {
    display: 'inline-block', backgroundColor: tokens.accentSoft, color: tokens.accentText, fontSize: '0.75rem',
    fontWeight: '700', padding: '0.25rem 0.9rem', borderRadius: '20px', marginBottom: '0.75rem',
  },
  title: { fontFamily: tokens.displayFont, fontSize: '1.6rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.3rem' },
  date: { color: tokens.inkSoft, fontSize: '0.85rem', marginBottom: '1.25rem' },
  scoreCircle: {
    width: '110px', height: '110px', borderRadius: '50%', borderWidth: '4px', borderStyle: 'solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
  },
  scoreNum: { fontFamily: tokens.displayFont, fontSize: '1.8rem', fontWeight: '700', lineHeight: 1 },
  scoreLabel: { fontSize: '0.72rem', color: tokens.inkSoft, marginTop: '0.2rem' },
  resultsList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  resultItem: { padding: '1rem', backgroundColor: tokens.paper, borderRadius: '10px' },
  resultBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' },
  resultQuestion: { margin: '0 0 0.4rem', fontWeight: '600', color: tokens.ink, fontSize: '0.95rem' },
  resultAnswer: { margin: '0 0 0.25rem', color: tokens.inkSoft, fontSize: '0.85rem' },
  correctAnswer: { margin: 0, color: tokens.successText, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' },
  primaryBtn: {
    width: '100%', padding: '0.9rem', backgroundColor: tokens.accent, color: tokens.onAccent, border: 'none',
    borderRadius: '999px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.15s',
  },
};

export default QuizHistoryDetail;