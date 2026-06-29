import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>
        AdaptIQ
      </Link>
      {user && (
        <div style={styles.right}>
          <span style={styles.welcome}>Hi, {user.name}</span>
          <button onClick={handleLogout} style={styles.button}>
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
    height: '60px',
    backgroundColor: '#1A1A2E',
    color: '#fff',
  },
  brand: {
    color: '#00B4D8',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcome: {
    color: '#fff',
    fontSize: '0.9rem',
  },
  button: {
    backgroundColor: 'transparent',
    border: '1px solid #00B4D8',
    color: '#00B4D8',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar;