import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tokens = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#DBEAFE',
  darkSurface: '#0F172A',
  darkSurfaceAlt: '#1E3A8A',
  bgLight: '#F8FAFC',
  bgWhite: '#FFFFFF',
  foreground: '#1E293B',
  onDarkMuted: '#94A3B8',
  bodyMuted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  warning: '#D97706',
  headingFont: "'Space Grotesk', 'Segoe UI', sans-serif",
  bodyFont: "'DM Sans', 'Segoe UI', sans-serif",
};

const BookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.bodyMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/');
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubject = (subject) => {
    if (subject.status === 'pending_diagnostic') {
      navigate(`/diagnostic/${subject.id}`);
    } else {
      navigate(`/subject/${subject.id}`);
    }
  };

  const handleCardKeyDown = (e, subject) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenSubject(subject);
    }
  };

  const handleDeleteSubject = async (e, subjectId) => {
    e.stopPropagation(); // don't trigger the card's onClick (open subject)
    if (!window.confirm('Delete this subject? This cannot be undone.')) return;
    try {
      await api.delete(`/subjects/${subjectId}`);
      fetchSubjects();
    } catch (err) {
      setError('Failed to delete subject');
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .skeleton-card { animation: pulse 1.5s ease-in-out infinite; }
          .subject-card { transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
          .subject-card:hover, .subject-card:focus-visible {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(37,99,235,0.12);
          }
        }
        .subject-card { cursor: pointer; }
        a, button { cursor: pointer; }
        .subject-card:focus-visible, button:focus-visible {
          outline: 2px solid ${tokens.primary};
          outline-offset: 2px;
        }
        .create-btn:hover { background-color: ${tokens.primaryHover} !important; }
        .delete-btn:hover { background-color: rgba(220,38,38,0.1) !important; color: ${tokens.danger} !important; }

        @media (max-width: 640px) {
          .dashboard-container { padding: 1.25rem !important; }
          .dashboard-hero { flex-direction: column !important; align-items: flex-start !important; gap: 1.25rem !important; }
        }
      `}</style>

      <div style={styles.container} className="dashboard-container">
        {/* Hero Section */}
        <div style={styles.hero} className="dashboard-hero">
          <div>
            <h1 style={styles.heroTitle}>
              {getTimeOfDay()}, {user?.name.split(' ')[0]}!
            </h1>
            <p style={styles.heroSubtitle}>
              What would you like to study today?
            </p>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.statPill}>
              <span style={styles.statNum}>{subjects.length}</span>
              <span style={styles.statLabel}>Subjects</span>
            </div>
          </div>
        </div>

        {/* Section header + Create button */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Subjects</h2>
          <button className="create-btn" style={styles.createBtn} onClick={() => navigate('/subjects/new')}>
            + Create Subject
          </button>
        </div>
        {error && <p style={styles.error} role="alert">{error}</p>}

        {/* Subjects Grid */}
        {loading ? (
          <div style={styles.grid}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card" style={styles.skeletonCard} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}><BookIcon /></div>
            <h3 style={styles.emptyTitle}>No subjects yet</h3>
            <p style={styles.emptyText}>Create your first subject to get started!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {subjects.map((subject, index) => {
              const isPending = subject.status === 'pending_diagnostic';
              return (
                <div
                  key={subject.id}
                  className="subject-card"
                  style={styles.card}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenSubject(subject)}
                  onKeyDown={(e) => handleCardKeyDown(e, subject)}
                  aria-label={`Open subject ${subject.name}`}
                >
                  <div style={styles.cardHeader}>
                    <div style={{
                      ...styles.cardIcon,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}>
                      {subject.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      className="delete-btn"
                      style={styles.deleteBtn}
                      onClick={(e) => handleDeleteSubject(e, subject.id)}
                      aria-label={`Delete subject ${subject.name}`}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <h3 style={styles.cardTitle}>{subject.name}</h3>
                  <p style={styles.cardDate}>
                    Created {new Date(subject.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <div style={styles.cardFooter}>
                    {isPending ? (
                      <span style={styles.cardActionPending}>
                        <AlertIcon /> Pending Diagnostic Quiz
                      </span>
                    ) : (
                      <span style={styles.cardAction}>Open Subject</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const COLORS = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2'];

const styles = {
  page: {
    backgroundColor: tokens.bgLight,
    minHeight: '100vh',
    fontFamily: tokens.bodyFont,
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  hero: {
    background: `linear-gradient(135deg, ${tokens.darkSurface} 0%, ${tokens.darkSurfaceAlt} 100%)`,
    borderRadius: '16px',
    padding: '2rem 2.5rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  heroTitle: {
    fontFamily: tokens.headingFont,
    fontSize: '1.7rem',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 0.5rem',
  },
  heroSubtitle: {
    color: tokens.onDarkMuted,
    fontSize: '1rem',
    margin: 0,
  },
  heroStats: {
    display: 'flex',
    gap: '1rem',
  },
  statPill: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    border: '1px solid rgba(37,99,235,0.35)',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNum: {
    fontFamily: tokens.headingFont,
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#93C5FD',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: tokens.onDarkMuted,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    fontFamily: tokens.headingFont,
    fontSize: '1.3rem',
    fontWeight: '700',
    color: tokens.foreground,
    margin: 0,
  },
  createBtn: {
    padding: '0.65rem 1.25rem',
    backgroundColor: tokens.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s',
  },
  error: {
    color: tokens.danger,
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  skeletonCard: {
    flex: '1 1 280px',
    minWidth: 0,
    height: '160px',
    borderRadius: '16px',
    backgroundColor: tokens.border,
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: tokens.bgWhite,
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  emptyIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontFamily: tokens.headingFont,
    fontSize: '1.3rem',
    fontWeight: '700',
    color: tokens.foreground,
    margin: '0 0 0.5rem',
  },
  emptyText: {
    color: tokens.bodyMuted,
    fontSize: '0.95rem',
    margin: 0,
  },
  card: {
    flex: '1 1 280px',
    minWidth: 0,
    backgroundColor: tokens.bgWhite,
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '2px solid transparent',
    boxSizing: 'border-box',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  cardIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: tokens.foreground,
    margin: '0 0 0.4rem',
  },
  cardDate: {
    color: tokens.bodyMuted,
    fontSize: '0.8rem',
    margin: '0 0 1rem',
  },
  cardFooter: {
    borderTop: `1px solid ${tokens.bgLight}`,
    paddingTop: '0.75rem',
  },
  cardAction: {
    color: tokens.primary,
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  cardActionPending: {
    color: tokens.warning,
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    width: '44px',
    height: '44px',
    margin: '-10px -10px 0 0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s, color 0.15s',
  },
};


export default Dashboard;
