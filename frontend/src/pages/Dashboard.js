import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            {getTimeOfDay()}, {user?.name.split(' ')[0]}! 👋
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
        <button style={styles.createBtn} onClick={() => navigate('/subjects/new')}>
          + Create Subject
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}

      {/* Subjects Grid */}
      {loading ? (
        <div style={styles.loadingGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📚</div>
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
                style={styles.card}
                onClick={() => handleOpenSubject(subject)}
              >
                <div style={styles.cardHeader}>
                  <div style={{
                    ...styles.cardIcon,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}>
                    {subject.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.cardArrow}>→</span>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => handleDeleteSubject(e, subject.id)}
                    title="Delete subject"
                  >
                    ✕
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
                    <span style={styles.cardActionPending}>⚠ Pending Diagnostic Quiz</span>
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
  );
};

const COLORS = ['#00B4D8', '#7C3AED', '#059669', '#DC2626', '#D97706', '#2563EB'];

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  hero: {
    background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)',
    borderRadius: '16px',
    padding: '2rem 2.5rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  heroContent: {},
  heroTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: '1rem',
  },
  heroStats: {
    display: 'flex',
    gap: '1rem',
  },
  statPill: {
    backgroundColor: 'rgba(0,180,216,0.15)',
    border: '1px solid rgba(0,180,216,0.3)',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNum: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#00B4D8',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#94A3B8',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1A1A2E',
    margin: 0,
  },
  createBtn: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  error: {
    color: '#EF4444',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  skeletonCard: {
    height: '160px',
    borderRadius: '16px',
    backgroundColor: '#E2E8F0',
    animation: 'pulse 1.5s infinite',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.3rem',
    color: '#1A1A2E',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: '0.95rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
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
  cardArrow: {
    color: '#CBD5E1',
    fontSize: '1.2rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: '0.4rem',
  },
  cardDate: {
    color: '#94A3B8',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  cardFooter: {
    borderTop: '1px solid #F1F5F9',
    paddingTop: '0.75rem',
  },
  cardAction: {
    color: '#00B4D8',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  cardActionPending: {
    color: '#F59E0B',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#CBD5E1',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.2rem',
  },
};


export default Dashboard;