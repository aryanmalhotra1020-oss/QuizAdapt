import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Performance = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    fetchPerformance();
    fetchSubjectName();
  }, []);

  const fetchSubjectName = async () => {
    try {
      const response = await api.get(`/subjects/${subjectId}`);
      setSubjectName(response.data.name);
    } catch (err) {
      console.error('Failed to load subject name');
    }
  };
  const fetchPerformance = async () => {
    try {
      const response = await api.get(`/quiz/performance/${subjectId}`);
      setData(response.data);
    } catch (err) {
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <p>Loading your performance data...</p>
    </div>
  );

  if (error) return (
    <div style={styles.loadingContainer}>
      <p style={styles.error}>{error}</p>
    </div>
  );

  const { summary, weak, moderate, strong, quiz_history } = data;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={styles.title}>{subjectName ? `${subjectName} — Performance` : 'Performance Dashboard'}</h1>
        <p style={styles.subtitle}>Track your learning progress and knowledge gaps</p>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryNum}>{summary.total_quizzes}</span>
          <span style={styles.summaryLabel}>Quizzes Taken</span>
        </div>
        <div style={{ ...styles.summaryCard, borderTop: '4px solid #EF4444' }}>
          <span style={styles.summaryNum}>{summary.weak_count}</span>
          <span style={styles.summaryLabel}>Weak Topics</span>
        </div>
        <div style={{ ...styles.summaryCard, borderTop: '4px solid #F59E0B' }}>
          <span style={styles.summaryNum}>{summary.moderate_count}</span>
          <span style={styles.summaryLabel}>Moderate Topics</span>
        </div>
        <div style={{ ...styles.summaryCard, borderTop: '4px solid #22C55E' }}>
          <span style={styles.summaryNum}>{summary.strong_count}</span>
          <span style={styles.summaryLabel}>Strong Topics</span>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Topic Knowledge Map</h2>

        {weak.length > 0 && (
          <div style={styles.topicGroup}>
            <h3 style={{ ...styles.groupTitle, color: '#EF4444' }}>Needs Work</h3>
            {weak.map(topic => (
              <div key={topic.topic_id} style={styles.topicRow}>
                <span style={styles.topicName}>{topic.topic_name}</span>
                <div style={styles.barContainer}>
                  <div style={{
                    ...styles.bar,
                    width: `${topic.strength_score * 100}%`,
                    backgroundColor: '#EF4444'
                  }} />
                </div>
                <span style={styles.scoreLabel}>{Math.round(topic.strength_score * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {moderate.length > 0 && (
          <div style={styles.topicGroup}>
            <h3 style={{ ...styles.groupTitle, color: '#F59E0B' }}>Getting There</h3>
            {moderate.map(topic => (
              <div key={topic.topic_id} style={styles.topicRow}>
                <span style={styles.topicName}>{topic.topic_name}</span>
                <div style={styles.barContainer}>
                  <div style={{
                    ...styles.bar,
                    width: `${topic.strength_score * 100}%`,
                    backgroundColor: '#F59E0B'
                  }} />
                </div>
                <span style={styles.scoreLabel}>{Math.round(topic.strength_score * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {strong.length > 0 && (
          <div style={styles.topicGroup}>
            <h3 style={{ ...styles.groupTitle, color: '#22C55E' }}>Strong</h3>
            {strong.map(topic => (
              <div key={topic.topic_id} style={styles.topicRow}>
                <span style={styles.topicName}>{topic.topic_name}</span>
                <div style={styles.barContainer}>
                  <div style={{
                    ...styles.bar,
                    width: `${topic.strength_score * 100}%`,
                    backgroundColor: '#22C55E'
                  }} />
                </div>
                <span style={styles.scoreLabel}>{Math.round(topic.strength_score * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz History */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quiz History</h2>
        {quiz_history.length === 0 ? (
          <p style={styles.empty}>No quizzes taken yet.</p>
        ) : (
          <div style={styles.historyList}>
            {quiz_history.map((quiz, i) => (
              <div key={quiz.quiz_id} style={styles.historyItem}>
                <div style={styles.historyLeft}>
                  <span style={{
                    ...styles.quizTypeBadge,
                    backgroundColor: quiz.type === 'diagnostic' ? '#E0F7FA' :
                      quiz.type === 'adaptive' ? '#EDE9FE' : '#F0FDF4',
                    color: quiz.type === 'diagnostic' ? '#00838F' :
                      quiz.type === 'adaptive' ? '#7C3AED' : '#16A34A'
                  }}>
                    {quiz.type}
                  </span>
                  <span style={styles.historyDate}>
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.historyRight}>
                  <span style={styles.historyScore}>{quiz.score}</span>
                  <span style={{
                    ...styles.historyPct,
                    color: quiz.percentage >= 70 ? '#22C55E' :
                      quiz.percentage >= 40 ? '#F59E0B' : '#EF4444'
                  }}>
                    {quiz.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button
          style={styles.adaptiveButton}
          onClick={() => navigate(`/subject/${subjectId}`)}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 60px)',
    color: '#666',
  },
  header: {
    marginBottom: '2rem',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#00B4D8',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '1rem',
    display: 'block',
  },
  title: {
    fontSize: '2rem',
    color: '#1A1A2E',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
    margin: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderTop: '4px solid #00B4D8',
  },
  summaryNum: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  summaryLabel: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.25rem',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#1A1A2E',
    margin: '0 0 1.5rem',
  },
  topicGroup: {
    marginBottom: '1.5rem',
  },
  groupTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },
  topicRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  topicName: {
    width: '180px',
    fontSize: '0.9rem',
    color: '#1A1A2E',
    flexShrink: 0,
    textTransform: 'capitalize',
  },
  barContainer: {
    flex: 1,
    height: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.5s ease',
  },
  scoreLabel: {
    width: '40px',
    fontSize: '0.85rem',
    color: '#666',
    textAlign: 'right',
    flexShrink: 0,
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  quizTypeBadge: {
    padding: '0.2rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  historyDate: {
    color: '#999',
    fontSize: '0.85rem',
  },
  historyRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  historyScore: {
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  historyPct: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
  },
  adaptiveButton: {
    flex: 1,
    padding: '0.9rem',
    backgroundColor: '#1A1A2E',
    color: '#00B4D8',
    border: '2px solid #00B4D8',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
  },
};

export default Performance;