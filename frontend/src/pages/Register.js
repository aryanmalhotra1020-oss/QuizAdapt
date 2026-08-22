import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoLight from '../logo/logo-light.png';
import { tokens, fontImport } from '../theme';

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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        ${fontImport}

        .auth-input {
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .auth-input:focus {
          outline: none;
          border-color: ${tokens.accent} !important;
          box-shadow: 0 0 0 3px ${tokens.accentSoft};
        }
        .auth-btn:hover:not(:disabled) {
          background-color: ${tokens.accentHover} !important;
        }
        a, button {
          cursor: pointer;
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid ${tokens.accent};
          outline-offset: 2px;
        }
        .password-toggle:hover {
          color: ${tokens.ink} !important;
        }

        @media (max-width: 900px) {
          .brand-side { display: none !important; }
          .form-side { flex: 1 1 100% !important; }
        }
      `}</style>

      <div style={styles.formSide} className="form-side">
        <div style={styles.formWrap}>
          <Link to="/" style={styles.brandLink}>
            <img src={logoLight} alt="QuizAdapt" style={styles.brandLogo} />
          </Link>

          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Start your adaptive learning journey.</p>

          {error && (
            <div style={styles.errorBanner} role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form style={styles.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="register-name" style={styles.label}>Full name</label>
              <input
                id="register-name"
                className="auth-input"
                style={styles.input}
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="register-email" style={styles.label}>Email</label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  id="register-password"
                  className="auth-input"
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={styles.link}>
            Already have an account? <Link to="/login" style={styles.linkAccent}>Log in</Link>
          </p>
        </div>
      </div>

      <div style={styles.brandSide} className="brand-side">
        <div style={styles.brandContent}>
          <h2 style={styles.brandHeadline}>Turn your notes into a personal trainer.</h2>
          <p style={styles.brandSubhead}>
            Upload your notes once, let QuizAdapt handle the rest.
          </p>

          <div style={styles.featureCard}>
            {[
              'Adaptive quizzes weighted to your weak topics',
              'MCQ, fill-in-the-blank, choose, or long-answer',
              'Spaced repetition before you forget',
            ].map((feature) => (
              <div key={feature} style={styles.featureRow}>
                <CheckIcon />
                <span style={styles.featureText}>{feature}</span>
              </div>
            ))}
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
    backgroundColor: tokens.paper,
    padding: '3rem 2rem',
  },
  formWrap: {
    width: '100%',
    maxWidth: '380px',
  },
  brandLink: {
    display: 'inline-block',
    textDecoration: 'none',
    marginBottom: '2rem',
  },
  brandLogo: { height: '100px', width: 'auto', display: 'block', borderRadius: '12px' },
  title: {
    margin: '0 0 0.4rem',
    color: tokens.ink,
    fontFamily: tokens.displayFont,
    fontSize: '1.7rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 1.75rem',
    color: tokens.inkSoft,
    fontSize: '0.95rem',
  },
  errorBanner: {
    backgroundColor: tokens.dangerSoft, 
    border: `1px solid ${tokens.dangerBorder}`,
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
    fontSize: '0.75rem',
    fontFamily: tokens.monoFont,
    fontWeight: '600',
    color: tokens.inkSoft,
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
    color: tokens.ink,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: tokens.card,
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
    color: tokens.inkSoft,
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    padding: '0.85rem',
    backgroundColor: tokens.accent,
    color: tokens.onAccent,
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: '700',
    marginTop: '0.25rem',
    transition: 'background-color 0.15s',
  },
  link: {
    marginTop: '1.75rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: tokens.inkSoft,
  },
  linkAccent: {
    color: tokens.ink,
    fontWeight: '700',
    textDecoration: 'underline',
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
    fontFamily: tokens.displayFont,
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1.25',
    margin: '0 0 0.9rem',
    letterSpacing: '-0.5px',
  },
  brandSubhead: {
    color: tokens.onInkMuted,
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 2rem',
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  featureText: {
    color: '#E2E8F0',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
};

export default Register;
