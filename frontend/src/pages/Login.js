import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);

      const response = await api.get('/subjects/last-accessed');
      const lastSubject = response.data.subject;

      if (lastSubject) {
        navigate(`/subject/${lastSubject.id}`);
      } else {
        navigate('/subjects/new');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.icon}>🎓</span>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Log in to continue your learning journey</p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#00B4D8')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              required
            />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#00B4D8')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              required
            />
          </div>
          <button
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.linkAccent}>Register</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#F0F4F8',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  title: {
    margin: '0 0 0.4rem',
    color: '#1A1A2E',
    fontSize: '1.7rem',
    fontWeight: '800',
  },
  subtitle: {
    margin: '0 0 1.75rem',
    color: '#94A3B8',
    fontSize: '0.9rem',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748B',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    border: '2px solid #E2E8F0',
    fontSize: '0.95rem',
    color: '#1A1A2E',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '0.85rem',
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '700',
    marginTop: '0.25rem',
  },
  link: {
    marginTop: '1.75rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#94A3B8',
  },
  linkAccent: {
    color: '#00B4D8',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;