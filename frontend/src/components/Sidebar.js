import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Subjects', path: '/subjects' },
    { label: 'Create Subject', path: '/subjects/new' },
    { label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.sidebar}>
      <Link to="/dashboard" style={styles.brand}>
        <span style={styles.brandIcon}>⚡</span>
        AdaptIQ
      </Link>

      <div style={styles.navSection}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navLink,
              ...(isActive(item.path) ? styles.navLinkActive : {}),
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={styles.userName}>{user.name}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '240px',
    backgroundColor: '#1A1A2E',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  brand: {
    color: '#00B4D8',
    textDecoration: 'none',
    fontSize: '1.3rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    letterSpacing: '-0.5px',
    marginBottom: '2.5rem',
    padding: '0 0.5rem',
  },
  brandIcon: {
    fontSize: '1.1rem',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },
  navLink: {
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '0.95rem',
    padding: '0.65rem 0.75rem',
    borderRadius: '6px',
    transition: 'all 0.15s',
  },
  navLinkActive: {
    backgroundColor: '#16213E',
    color: '#00B4D8',
    fontWeight: '600',
  },
  bottomSection: {
    borderTop: '1px solid #374151',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0 0.5rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#00B4D8',
    color: '#1A1A2E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userName: {
    color: '#E2E8F0',
    fontSize: '0.9rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #374151',
    color: '#94A3B8',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    width: '100%',
  },
};

export default Sidebar;