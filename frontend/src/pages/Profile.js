import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.accentText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.accentText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill={tokens.accentText} stroke="none" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.accentText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={tokens.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/profile')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <style>{`${fontImport}
        button { cursor: pointer; }
        button:focus-visible { outline: 2px solid ${tokens.accent}; outline-offset: 2px; }
        .profile-logout-btn:hover { background-color: ${tokens.dangerSoft}; }
      `}</style>
      <div style={styles.container}>
        <h1 style={styles.title}>Profile</h1>

        <div style={styles.card}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || '?'}</div>
          <div style={{ minWidth: 0 }}>
            <p style={styles.name}>{user?.name}</p>
            <p style={styles.email}>{user?.email}</p>
          </div>
        </div>

        {!loading && stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statIconWrap}><BookIcon /></span>
              <span style={styles.statNum}>{stats.total_subjects}</span>
              <span style={styles.statLabel}>Subjects</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statIconWrap}><TargetIcon /></span>
              <span style={styles.statNum}>{stats.total_quizzes}</span>
              <span style={styles.statLabel}>Quizzes Taken</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statIconWrap}><TrendingUpIcon /></span>
              <span style={styles.statNum}>{stats.average_score}%</span>
              <span style={styles.statLabel}>Average Score</span>
            </div>
          </div>
        )}

        <div style={styles.comingSoonCard}>
          <span style={styles.comingSoonIconWrap}><SettingsIcon /></span>
          <h3 style={styles.comingSoonTitle}>Account settings — coming soon</h3>
          <p style={styles.comingSoonText}>
            Password changes, notification preferences, and study reminders will live here.
          </p>
        </div>

        <button className="profile-logout-btn" style={styles.logoutBtn} onClick={handleLogout}>
          <LogOutIcon /> Sign Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: tokens.paper, minHeight: '100vh', fontFamily: tokens.bodyFont },
  container: { maxWidth: '640px', margin: '0 auto', padding: '2rem' },
  title: { fontFamily: tokens.displayFont, fontSize: '1.9rem', fontWeight: '700', color: tokens.ink, margin: '0 0 1.5rem' },
  card: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${tokens.border}`,
    boxShadow: '0 2px 12px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
  },
  avatar: {
    width: '52px', height: '52px', borderRadius: '50%', backgroundColor: tokens.accent, color: tokens.onAccent,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.3rem', flexShrink: 0,
  },
  name: { fontSize: '1.05rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.2rem' },
  email: { fontSize: '0.9rem', color: tokens.inkSoft, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: {
    backgroundColor: tokens.card, borderRadius: '12px', padding: '1.1rem 1rem', border: `1px solid ${tokens.border}`,
    boxShadow: '0 2px 12px rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
  },
  statIconWrap: { display: 'flex', marginBottom: '0.15rem' },
  statNum: { fontFamily: tokens.displayFont, fontSize: '1.5rem', fontWeight: '700', color: tokens.ink },
  statLabel: { fontSize: '0.75rem', color: tokens.inkSoft, textAlign: 'center' },
  comingSoonCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: `1px solid ${tokens.border}`, marginBottom: '1.5rem',
  },
  comingSoonIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  comingSoonTitle: { fontFamily: tokens.displayFont, fontSize: '1.15rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.5rem' },
  comingSoonText: { color: tokens.inkSoft, fontSize: '0.9rem', lineHeight: '1.6', margin: 0 },
  logoutBtn: {
    width: '100%', padding: '0.85rem', backgroundColor: tokens.card, color: tokens.dangerText,
    borderWidth: '2px', borderStyle: 'solid', borderColor: tokens.dangerBorder, borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    transition: 'background-color 0.15s',
  },
};

export default Profile;