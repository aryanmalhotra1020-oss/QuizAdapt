import React from 'react';
import { useAuth } from '../context/AuthContext';
import { tokens, fontImport } from '../theme';

const SettingsIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={tokens.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={styles.page}>
      <style>{`${fontImport}`}</style>
      <div style={styles.container}>
        <h1 style={styles.title}>Profile</h1>

        <div style={styles.card}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase() || '?'}</div>
          <div style={{ minWidth: 0 }}>
            <p style={styles.name}>{user?.name}</p>
            <p style={styles.email}>{user?.email}</p>
          </div>
        </div>

        <div style={styles.comingSoonCard}>
          <span style={styles.comingSoonIconWrap}><SettingsIcon /></span>
          <h3 style={styles.comingSoonTitle}>Account settings — coming soon</h3>
          <p style={styles.comingSoonText}>
            Password changes, notification preferences, and study reminders will live here.
          </p>
        </div>
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
  comingSoonCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: `1px solid ${tokens.border}`,
  },
  comingSoonIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  comingSoonTitle: { fontFamily: tokens.displayFont, fontSize: '1.15rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.5rem' },
  comingSoonText: { color: tokens.inkSoft, fontSize: '0.9rem', lineHeight: '1.6', margin: 0 },
};

export default Profile;
