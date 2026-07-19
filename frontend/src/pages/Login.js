import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tokens = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#DBEAFE',
  darkSurface: '#0F172A',
  bgLight: '#F8FAFC',
  bgWhite: '#FFFFFF',
  foreground: '#1E293B',
  onDarkMuted: '#F1F5F9',
  bodyMuted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  headingFont: "'Space Grotesk', 'Segoe UI', sans-serif",
  bodyFont: "'DM Sans', 'Segoe UI', sans-serif",
};

const LogoMark = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill={tokens.primary} />
    <rect x="5" y="13" width="3.2" height="6" rx="1" fill="#FFFFFF" />
    <rect x="10.4" y="9" width="3.2" height="10" rx="1" fill="#FFFFFF" />
    <rect x="15.8" y="5" width="3.2" height="14" rx="1" fill="#93C5FD" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
        <path d="M9.36 5.6A9.77 9.77 0 0 1 12 5c5 0 9 4 10 7-.36 1.05-1.05 2.23-2.03 3.31M6.61 6.6C4.6 7.8 3.06 9.6 2 12c1 3 5 7 10 7 1.13 0 2.2-.19 3.19-.53" />
      </>
    ) : (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        if (lastSubject.status === 'pending_diagnostic') {
          navigate(`/diagnostic/${lastSubject.id}`);
        } else {
          navigate(`/subject/${lastSubject.id}`);
        }
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
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .auth-input {
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .auth-input:focus {
          outline: none;
          border-color: ${tokens.primary} !important;
          box-shadow: 0 0 0 3px ${tokens.primarySoft};
        }
        .auth-btn:hover:not(:disabled) {
          background-color: ${tokens.primaryHover} !important;
        }
        a, button {
          cursor: pointer;
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid ${tokens.primary};
          outline-offset: 2px;
        }
        .password-toggle:hover {
          color: ${tokens.foreground} !important;
        }

        @media (max-width: 900px) {
          .brand-side { display: none !important; }
          .form-side { flex: 1 1 100% !important; }
        }
      `}</style>

      <div style={styles.formSide} className="form-side">
        <div style={styles.formWrap}>
          <Link to="/" style={styles.brandLink}>
            <LogoMark />
            QuizAdapt
          </Link>

          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Log in to continue your learning journey.</p>

          {error && (
            <div style={styles.errorBanner} role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form style={styles.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" style={styles.label}>Email</label>
              <input
                id="login-email"
                className="auth-input"
                style={styles.input}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  id="login-password"
                  className="auth-input"
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>
            <button
              className="auth-btn"
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in →'}
            </button>
          </form>

          <p style={styles.link}>
            Don't have an account? <Link to="/register" style={styles.linkAccent}>Register</Link>
          </p>
        </div>
      </div>

      <div style={styles.brandSide} className="brand-side">
        <div style={styles.brandContent}>
          <h2 style={styles.brandHeadline}>Learn what you don't know yet.</h2>
          <p style={styles.brandSubhead}>
            QuizAdapt turns your notes into quizzes that target your weak spots.
          </p>

          <div style={styles.demoCard}>
            <span style={styles.demoBadge}>Generated by QuizAdapt</span>
            <p style={styles.demoQuestion}>
              What is the primary goal of Machine Learning?
            </p>
            <div style={styles.demoOptions}>
              <div style={styles.demoOption}>A. PManually label data for computers to 
                memorize known outcomes</div>
              <div style={{ ...styles.demoOption, ...styles.demoOptionCorrect }}>
                B. Develop methods that detect patterns and predict future data
              </div>
              <div style={styles.demoOption}>C. Replace human decision-making with fixed rules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: tokens.bodyFont,
  },
  formSide: {
    flex: '1 1 480px',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.bgWhite,
    padding: '3rem 2rem',
  },
  formWrap: {
    width: '100%',
    maxWidth: '380px',
  },
  brandLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontFamily: tokens.headingFont,
    fontSize: '1.15rem',
    fontWeight: '600',
    color: tokens.foreground,
    textDecoration: 'none',
    marginBottom: '2rem',
  },
  title: {
    margin: '0 0 0.4rem',
    color: tokens.foreground,
    fontFamily: tokens.headingFont,
    fontSize: '1.7rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 1.75rem',
    color: tokens.bodyMuted,
    fontSize: '0.95rem',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: tokens.danger,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontSize: '0.85rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: tokens.bodyMuted,
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    border: `2px solid ${tokens.border}`,
    fontSize: '0.95rem',
    color: tokens.foreground,
    outline: 'none',
    boxSizing: 'border-box',
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '0.25rem',
    color: tokens.bodyMuted,
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    padding: '0.85rem',
    backgroundColor: tokens.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    marginTop: '0.25rem',
    transition: 'background-color 0.15s',
  },
  link: {
    marginTop: '1.75rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: tokens.bodyMuted,
  },
  linkAccent: {
    color: tokens.primary,
    fontWeight: '600',
    textDecoration: 'none',
  },
  brandSide: {
    flex: '1 1 480px',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.darkSurface,
    padding: '3rem',
  },
  brandContent: {
    maxWidth: '420px',
  },
  brandHeadline: {
    color: '#FFFFFF',
    fontFamily: tokens.headingFont,
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1.2',
    margin: '0 0 0.75rem',
  },
  brandSubhead: {
    color: tokens.onDarkMuted,
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 2rem',
  },
  demoCard: {
    backgroundColor: tokens.bgWhite,
    borderRadius: '14px',
    padding: '1.5rem',
    boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
  },
  demoBadge: {
    display: 'inline-block',
    backgroundColor: tokens.primarySoft,
    color: tokens.primaryHover,
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.28rem 0.6rem',
    borderRadius: '999px',
    marginBottom: '0.75rem',
  },
  demoQuestion: {
    fontSize: '0.95rem',
    fontWeight: '600',
    margin: '0 0 0.85rem',
    color: tokens.foreground,
  },
  demoOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  demoOption: {
    fontSize: '0.85rem',
    padding: '0.5rem 0.7rem',
    borderRadius: '8px',
    border: `1px solid ${tokens.border}`,
    color: tokens.bodyMuted,
  },
  demoOptionCorrect: {
    borderColor: tokens.primary,
    backgroundColor: tokens.primarySoft,
    color: tokens.foreground,
    fontWeight: '600',
  },
};

export default Login;
