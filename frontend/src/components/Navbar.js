import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/dashboard" style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          AdaptIQ
        </Link>
        {user && !isAuthPage && (
          <div style={styles.breadcrumb}>
            <Link to="/dashboard" style={styles.breadcrumbLink}>Dashboard</Link>
          </div>
        )}
      </div>
      {user && (
        <div style={styles.right}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    height: '64px',
    backgroundColor: '#1A1A2E',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  brand: {
    color: '#00B4D8',
    textDecoration: 'none',
    fontSize: '1.4rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    letterSpacing: '-0.5px',
  },
  brandIcon: {
    fontSize: '1.2rem',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#94A3B8',
    fontSize: '0.9rem',
  },
  breadcrumbLink: {
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
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
  },
  userName: {
    color: '#E2E8F0',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #374151',
    color: '#94A3B8',
    padding: '0.35rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
};

export default Navbar;