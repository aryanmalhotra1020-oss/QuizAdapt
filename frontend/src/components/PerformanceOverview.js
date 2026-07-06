import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PerformanceOverview = ({ subjectId, onContinueLearning }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformance();
  }, [subjectId]);

  const fetchPerformance = async () => {
    setLoading(true);
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
    <div style={styles.loadingBox}>
      <span style={styles.loadingIcon}>📊</span>
      <p style={styles.loadingText}>Loading your performance data...</p>
    </div>
  );

  if (error) return <p style={styles.error}>{error}</p>;

  const { summary, weak, moderate, strong, quiz_history, topic_breakdown } = data;
  const overallScore = topic_breakdown.length > 0
    ? Math.round((topic_breakdown.reduce((sum, t) => sum + t.strength_score, 0) / topic_breakdown.length) * 100)
    : 0;

  const getScoreColor = (pct) => {
    if (pct >= 70) return '#22C55E';
    if (pct >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div>
      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.overallCard}>
          <div style={{ ...styles.overallCircle, borderColor: getScoreColor(overallScore) }}>
            <span style={{ ...styles.overallNum, color: getScoreColor(overallScore) }}>
              {overallScore}%
            </span>
            <span style={styles.overallLabel}>Overall</span>
          </div>
          <div>
            <h3 style={styles.overallTitle}>Knowledge Score</h3>
            <p style={styles.overallDesc}>
              {overallScore >= 70
                ? 'You\'re doing great! Keep it up.'
                : overallScore >= 40
                ? 'Good progress! Focus on weak areas.'
                : 'Keep practising — you\'re improving!'}
            </p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{summary.total_quizzes}</span>
            <span style={styles.statLabel}>Quizzes Taken</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '3px solid #EF4444' }}>
            <span style={{ ...styles.statNum, color: '#EF4444' }}>{summary.weak_count}</span>
            <span style={styles.statLabel}>Weak Topics</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '3px solid #F59E0B' }}>
            <span style={{ ...styles.statNum, color: '#F59E0B' }}>{summary.moderate_count}</span>
            <span style={styles.statLabel}>Moderate Topics</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: '3px solid #22C55E' }}>
            <span style={{ ...styles.statNum, color: '#22C55E' }}>{summary.strong_count}</span>
            <span style={styles.statLabel}>Strong Topics</span>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Topic Knowledge Map */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Topic Knowledge Map</h2>
          <p style={styles.cardSubtitle}>Your knowledge level per topic</p>

          {topic_breakdown.length === 0 ? (
            <div style={styles.empty}><p>Complete a quiz to see your topic breakdown</p></div>
          ) : (
            <div>
              {weak.length > 0 && (
                <div style={styles.topicGroup}>
                  <div style={styles.groupHeader}>
                    <span style={styles.groupDot} />
                    <h3 style={{ ...styles.groupTitle, color: '#EF4444' }}>Needs Work</h3>
                  </div>
                  {weak.map(topic => <TopicBar key={topic.topic_id} topic={topic} color="#EF4444" />)}
                </div>
              )}
              {moderate.length > 0 && (
                <div style={styles.topicGroup}>
                  <div style={styles.groupHeader}>
                    <span style={{ ...styles.groupDot, backgroundColor: '#F59E0B' }} />
                    <h3 style={{ ...styles.groupTitle, color: '#F59E0B' }}>Getting There</h3>
                  </div>
                  {moderate.map(topic => <TopicBar key={topic.topic_id} topic={topic} color="#F59E0B" />)}
                </div>
              )}
              {strong.length > 0 && (
                <div style={styles.topicGroup}>
                  <div style={styles.groupHeader}>
                    <span style={{ ...styles.groupDot, backgroundColor: '#22C55E' }} />
                    <h3 style={{ ...styles.groupTitle, color: '#22C55E' }}>Strong</h3>
                  </div>
                  {strong.map(topic => <TopicBar key={topic.topic_id} topic={topic} color="#22C55E" />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quiz History */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Quiz History</h2>
          <p style={styles.cardSubtitle}>{quiz_history.length} quizzes completed</p>

          {quiz_history.length === 0 ? (
            <div style={styles.empty}><p>No quizzes taken yet</p></div>
          ) : (
            <div style={styles.historyList}>
              {quiz_history.slice().reverse().map((quiz) => (
                <div key={quiz.quiz_id} style={styles.historyItem}>
                  <div style={styles.historyLeft}>
                    <span style={{
                      ...styles.typeBadge,
                      backgroundColor:
                        quiz.type === 'diagnostic' ? '#EFF6FF' :
                        quiz.type === 'adaptive' ? '#F5F3FF' : '#F0FDF4',
                      color:
                        quiz.type === 'diagnostic' ? '#2563EB' :
                        quiz.type === 'adaptive' ? '#7C3AED' : '#16A34A'
                    }}>
                      {quiz.type === 'diagnostic' ? '📊 Diagnostic' :
                       quiz.type === 'adaptive' ? '🧠 Adaptive' : '📝 Initial'}
                    </span>
                    <span style={styles.historyDate}>
                      {new Date(quiz.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div style={styles.historyRight}>
                    <span style={styles.historyScore}>{quiz.score}</span>
                    <span style={{ ...styles.historyPct, color: getScoreColor(quiz.percentage) }}>
                      {quiz.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onContinueLearning && (
            <button style={styles.continueBtn} onClick={onContinueLearning}>
              🧠 Continue Learning
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TopicBar = ({ topic, color }) => (
  <div style={topicStyles.row}>
    <span style={topicStyles.name}>{topic.topic_name}</span>
    <div style={topicStyles.barContainer}>
      <div style={{ ...topicStyles.bar, width: `${topic.strength_score * 100}%`, backgroundColor: color }} />
    </div>
    <span style={{ ...topicStyles.score, color }}>{Math.round(topic.strength_score * 100)}%</span>
  </div>
);

const topicStyles = {
  row: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' },
  name: { width: '160px', fontSize: '0.85rem', color: '#1A1A2E', flexShrink: 0, textTransform: 'capitalize', fontWeight: '500' },
  barContainer: { flex: 1, height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  score: { width: '38px', fontSize: '0.8rem', fontWeight: '600', textAlign: 'right', flexShrink: 0 },
};

const styles = {
  loadingBox: { textAlign: 'center', padding: '3rem' },
  loadingIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '1rem' },
  loadingText: { color: '#64748B', fontSize: '1rem' },
  error: { color: '#EF4444' },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' },
  overallCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center',
  },
  overallCircle: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  overallNum: { fontSize: '1.6rem', fontWeight: '800', lineHeight: 1 },
  overallLabel: { fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem' },
  overallTitle: { fontSize: '1rem', fontWeight: '700', color: '#1A1A2E', marginBottom: '0.3rem' },
  overallDesc: { fontSize: '0.85rem', color: '#64748B', lineHeight: '1.4' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  statCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '3px solid #00B4D8' },
  statNum: { fontSize: '2rem', fontWeight: '800', color: '#1A1A2E' },
  statLabel: { fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem', textAlign: 'center' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1A1A2E', marginBottom: '0.3rem' },
  cardSubtitle: { color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.25rem' },
  topicGroup: { marginBottom: '1.25rem' },
  groupHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' },
  groupDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', flexShrink: 0 },
  groupTitle: { fontSize: '0.85rem', fontWeight: '700', margin: 0 },
  empty: { textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.9rem' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' },
  historyLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  typeBadge: { padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  historyDate: { color: '#94A3B8', fontSize: '0.8rem' },
  historyRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  historyScore: { fontWeight: '700', color: '#1A1A2E', fontSize: '0.9rem' },
  historyPct: { fontWeight: '700', fontSize: '0.9rem' },
  continueBtn: { width: '100%', padding: '0.85rem', backgroundColor: '#1A1A2E', color: '#00B4D8', border: '2px solid #00B4D8', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' },
};

export default PerformanceOverview;