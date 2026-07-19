import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const tokens = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#DBEAFE',
  foreground: '#1E293B',
  bodyMuted: '#64748B',
  border: '#E2E8F0',
  bgLight: '#F8FAFC',
  bgWhite: '#FFFFFF',
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
  typeDiagnostic: '#2563EB',
  typeDiagnosticSoft: '#EFF6FF',
  typeAdaptive: '#7C3AED',
  typeAdaptiveSoft: '#F5F3FF',
  typeInitial: '#0891B2',
  typeInitialSoft: '#ECFEFF',
  headingFont: "'Space Grotesk', 'Segoe UI', sans-serif",
  bodyFont: "'DM Sans', 'Segoe UI', sans-serif",
};

const getStatus = (pct) => {
  if (pct >= 70) return { color: tokens.good, label: 'Strong' };
  if (pct >= 40) return { color: tokens.warning, label: 'Moderate' };
  return { color: tokens.critical, label: 'Weak' };
};

const ScoreGauge = ({ score }) => {
  const status = getStatus(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div style={styles.gaugeWrap}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke={tokens.border} strokeWidth="10" />
        <circle
          className="score-gauge-fill"
          cx="65" cy="65" r={radius} fill="none"
          stroke={status.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
        />
      </svg>
      <div style={styles.gaugeCenter}>
        <span style={styles.gaugeNum}>{score}%</span>
        <span style={styles.gaugeLabel}>Overall</span>
      </div>
    </div>
  );
};

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.bodyMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.bodyMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const TargetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const TYPE_META = {
  diagnostic: { label: 'Diagnostic', color: tokens.typeDiagnostic, bg: tokens.typeDiagnosticSoft, Icon: ClipboardIcon },
  adaptive: { label: 'Adaptive', color: tokens.typeAdaptive, bg: tokens.typeAdaptiveSoft, Icon: TargetIcon },
  initial: { label: 'Initial', color: tokens.typeInitial, bg: tokens.typeInitialSoft, Icon: PencilIcon },
};

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
      <p style={styles.loadingText}>Loading your performance data...</p>
    </div>
  );

  if (error) return <p style={styles.error} role="alert">{error}</p>;

  const { summary, weak, moderate, strong, quiz_history, topic_breakdown } = data;
  const overallScore = topic_breakdown.length > 0
    ? Math.round((topic_breakdown.reduce((sum, t) => sum + t.strength_score, 0) / topic_breakdown.length) * 100)
    : 0;

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        @media (prefers-reduced-motion: no-preference) {
          .score-gauge-fill { transition: stroke-dashoffset 0.8s ease-out; }
          .topic-bar-fill { transition: width 0.6s ease-out; }
        }
        .continue-btn:hover { background-color: ${tokens.primaryHover} !important; }
        button { cursor: pointer; }
        button:focus-visible { outline: 2px solid ${tokens.primary}; outline-offset: 2px; }

        @media (max-width: 900px) {
          .perf-summary-grid { grid-template-columns: 1fr !important; }
          .perf-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .perf-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Summary */}
      <div style={styles.summaryGrid} className="perf-summary-grid">
        <div style={styles.overallCard}>
          <ScoreGauge score={overallScore} />
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

        <div style={styles.statsGrid} className="perf-stats-grid">
          <div style={styles.statCard}>
            <span style={styles.statNum}>{summary.total_quizzes}</span>
            <span style={styles.statLabel}>Quizzes Taken</span>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: tokens.critical }}>
            <span style={styles.statLabel}><span style={{ ...styles.statDot, backgroundColor: tokens.critical }} />Weak Topics</span>
            <span style={styles.statNum}>{summary.weak_count}</span>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: tokens.warning }}>
            <span style={styles.statLabel}><span style={{ ...styles.statDot, backgroundColor: tokens.warning }} />Moderate</span>
            <span style={styles.statNum}>{summary.moderate_count}</span>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: tokens.good }}>
            <span style={styles.statLabel}><span style={{ ...styles.statDot, backgroundColor: tokens.good }} />Strong</span>
            <span style={styles.statNum}>{summary.strong_count}</span>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid} className="perf-main-grid">
        {/* Topic Knowledge Map */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}><ChartIcon /> Topic Knowledge Map</h2>
          <p style={styles.cardSubtitle}>Your knowledge level per topic</p>

          {topic_breakdown.length === 0 ? (
            <div style={styles.empty}><p>Complete a quiz to see your topic breakdown</p></div>
          ) : (
            <div>
              {weak.length > 0 && (
                <TopicGroup label="Needs Work" color={tokens.critical} topics={weak} />
              )}
              {moderate.length > 0 && (
                <TopicGroup label="Getting There" color={tokens.warning} topics={moderate} />
              )}
              {strong.length > 0 && (
                <TopicGroup label="Strong" color={tokens.good} topics={strong} />
              )}
            </div>
          )}
        </div>

        {/* Quiz History */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}><HistoryIcon /> Quiz History</h2>
          <p style={styles.cardSubtitle}>{quiz_history.length} quizzes completed</p>

          {quiz_history.length === 0 ? (
            <div style={styles.empty}><p>No quizzes taken yet</p></div>
          ) : (
            <div style={styles.historyList}>
              {quiz_history.slice().reverse().map((quiz) => {
                const meta = TYPE_META[quiz.type] || TYPE_META.initial;
                return (
                  <div key={quiz.quiz_id} style={styles.historyItem}>
                    <div style={styles.historyLeft}>
                      <span style={{ ...styles.typeBadge, backgroundColor: meta.bg, color: meta.color }}>
                        <meta.Icon /> {meta.label}
                      </span>
                      <span style={styles.historyDate}>
                        {new Date(quiz.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div style={styles.historyRight}>
                      <span style={styles.historyScore}>{quiz.score}</span>
                      <span style={styles.historyPct}>{quiz.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {onContinueLearning && (
            <button className="continue-btn" style={styles.continueBtn} onClick={onContinueLearning}>
              Continue Learning <ArrowIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TopicGroup = ({ label, color, topics }) => (
  <div style={styles.topicGroup}>
    <div style={styles.groupHeader}>
      <span style={{ ...styles.groupDot, backgroundColor: color }} />
      <h3 style={{ ...styles.groupTitle, color }}>{label}</h3>
    </div>
    {topics.map((topic) => (
      <div key={topic.topic_id} style={topicStyles.row}>
        <span style={topicStyles.name}>{topic.topic_name}</span>
        <div style={topicStyles.barContainer}>
          <div
            className="topic-bar-fill"
            style={{ ...topicStyles.bar, width: `${topic.strength_score * 100}%`, backgroundColor: color }}
          />
        </div>
        <span style={topicStyles.score}>{Math.round(topic.strength_score * 100)}%</span>
      </div>
    ))}
  </div>
);

const topicStyles = {
  row: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' },
  name: { width: '140px', fontSize: '0.85rem', color: tokens.foreground, flexShrink: 0, textTransform: 'capitalize', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barContainer: { flex: 1, minWidth: 0, height: '8px', backgroundColor: tokens.bgLight, borderRadius: '4px', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: '4px' },
  score: { width: '38px', fontSize: '0.8rem', fontWeight: '600', textAlign: 'right', flexShrink: 0, color: tokens.foreground },
};

const styles = {
  root: { fontFamily: tokens.bodyFont },
  loadingBox: { textAlign: 'center', padding: '3rem' },
  loadingText: { color: tokens.bodyMuted, fontSize: '1rem' },
  error: { color: tokens.critical },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' },
  overallCard: {
    backgroundColor: tokens.bgWhite, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center',
  },
  gaugeWrap: { position: 'relative', width: '130px', height: '130px' },
  gaugeCenter: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  gaugeNum: { fontFamily: tokens.headingFont, fontSize: '1.7rem', fontWeight: '700', color: tokens.foreground, lineHeight: 1 },
  gaugeLabel: { fontSize: '0.7rem', color: tokens.bodyMuted, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  overallTitle: { fontFamily: tokens.headingFont, fontSize: '1rem', fontWeight: '700', color: tokens.foreground, margin: '0 0 0.3rem' },
  overallDesc: { fontSize: '0.85rem', color: tokens.bodyMuted, lineHeight: '1.4', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  statCard: {
    backgroundColor: tokens.bgWhite, borderRadius: '12px', padding: '1.1rem 1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '3px solid #CBD5E1', minWidth: 0,
  },
  statNum: { fontFamily: tokens.headingFont, fontSize: '1.8rem', fontWeight: '700', color: tokens.foreground },
  statLabel: { fontSize: '0.75rem', color: tokens.bodyMuted, display: 'flex', alignItems: 'center', gap: '0.4rem' },
  statDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' },
  card: { backgroundColor: tokens.bgWhite, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minWidth: 0 },
  cardTitle: { fontFamily: tokens.headingFont, fontSize: '1.1rem', fontWeight: '700', color: tokens.foreground, margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  cardSubtitle: { color: tokens.bodyMuted, fontSize: '0.85rem', marginBottom: '1.25rem' },
  topicGroup: { marginBottom: '1.25rem' },
  groupHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' },
  groupDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  groupTitle: { fontSize: '0.85rem', fontWeight: '700', margin: 0 },
  empty: { textAlign: 'center', padding: '2rem', color: tokens.bodyMuted, fontSize: '0.9rem' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: tokens.bgLight, borderRadius: '10px', border: `1px solid ${tokens.border}`, flexWrap: 'wrap', gap: '0.5rem' },
  historyLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  typeBadge: { padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' },
  historyDate: { color: tokens.bodyMuted, fontSize: '0.8rem' },
  historyRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  historyScore: { fontWeight: '700', color: tokens.foreground, fontSize: '0.9rem' },
  historyPct: { fontWeight: '700', fontSize: '0.9rem', color: tokens.foreground },
  continueBtn: {
    width: '100%', padding: '0.85rem', backgroundColor: tokens.primary, color: '#fff', border: 'none',
    borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '0.5rem', transition: 'background-color 0.15s',
  },
};

export default PerformanceOverview;
