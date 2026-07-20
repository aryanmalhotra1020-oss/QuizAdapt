import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const tokens = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#DBEAFE',
  bgLight: '#F8FAFC',
  bgWhite: '#FFFFFF',
  foreground: '#1E293B',
  bodyMuted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  headingFont: "'Space Grotesk', 'Segoe UI', sans-serif",
  bodyFont: "'DM Sans', 'Segoe UI', sans-serif",
};

const CloudUploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tokens.bodyMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
  </svg>
);

const DocIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tokens.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const CreateSubject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }
    if (!file) {
      setError('Please upload your initial notes to get started');
      return;
    }

    setLoading(true);
    try {
      // Step 1: create the subject (starts as pending_diagnostic)
      const createRes = await api.post('/subjects/', { name, description });
      const subjectId = createRes.data.id;

      // Step 2: upload the notes, which triggers topic extraction
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/notes/${subjectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 3: hand off to the diagnostic quiz page, which generates
      // and runs the diagnostic itself
      navigate(`/diagnostic/${subjectId}`);
    } catch (err) {
      setError('Something went wrong creating your subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .cs-input {
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cs-input:focus {
          outline: none;
          border-color: ${tokens.primary} !important;
          box-shadow: 0 0 0 3px ${tokens.primarySoft};
        }
        .cs-submit-btn:hover:not(:disabled) { background-color: ${tokens.primaryHover} !important; }
        .cs-back-link:hover { color: ${tokens.primaryHover} !important; }
        a, button, label { cursor: pointer; }
        a:focus-visible, button:focus-visible { outline: 2px solid ${tokens.primary}; outline-offset: 2px; }

        @media (max-width: 640px) {
          .cs-page-container { padding: 1.5rem 1.25rem !important; }
          .cs-card { padding: 1.75rem !important; }
        }
      `}</style>

      <div style={styles.container} className="cs-page-container">
        <Link to="/dashboard" className="cs-back-link" style={styles.backLink}>
          ← Dashboard
        </Link>

        <div style={styles.card} className="cs-card">
          <h1 style={styles.title}>Create a new subject</h1>
          <p style={styles.subtitle}>
            Upload your notes and we'll build a diagnostic quiz to find your starting point.
          </p>

          {error && <div style={styles.errorBanner} role="alert">{error}</div>}

          <form style={styles.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="cs-name" style={styles.label}>Subject Name</label>
              <input
                id="cs-name"
                className="cs-input"
                style={styles.input}
                type="text"
                placeholder="e.g. Machine Learning"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="cs-description" style={styles.label}>Description <span style={styles.optionalTag}>(optional)</span></label>
              <textarea
                id="cs-description"
                className="cs-input"
                style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }}
                placeholder="What is this subject about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Initial Notes</label>
              <label style={styles.uploadLabel}>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  style={styles.fileInput}
                />
                <div style={styles.uploadBox}>
                  {file ? (
                    <>
                      <span style={styles.uploadIcon}><DocIcon /></span>
                      <p style={styles.uploadFileName}>{file.name}</p>
                      <p style={styles.uploadHint}>Click to choose a different file</p>
                    </>
                  ) : (
                    <>
                      <span style={styles.uploadIcon}><CloudUploadIcon /></span>
                      <p style={styles.uploadText}>Click to upload a file</p>
                      <p style={styles.uploadHint}>.txt or .pdf — max 10MB</p>
                      <p style={styles.uploadTip}>
                        Tip: notes with real explanatory sentences (definitions, examples, discussion)
                        work best. Slides that are mostly diagrams, citations, or pure formulas may
                        produce lower-quality questions.
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            <button
              className="cs-submit-btn"
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Subject →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: tokens.bgLight,
    minHeight: '100vh',
    fontFamily: tokens.bodyFont,
  },
  container: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  backLink: {
    display: 'inline-block',
    color: tokens.primary,
    fontSize: '0.9rem',
    fontWeight: '600',
    textDecoration: 'none',
    marginBottom: '1.25rem',
    transition: 'color 0.15s',
  },
  card: {
    backgroundColor: tokens.bgWhite,
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
    border: `1px solid ${tokens.border}`,
  },
  title: {
    margin: '0 0 0.4rem',
    color: tokens.foreground,
    fontFamily: tokens.headingFont,
    fontSize: '1.6rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 1.75rem',
    color: tokens.bodyMuted,
    fontSize: '0.9rem',
    lineHeight: '1.5',
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
    gap: '1.25rem',
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
  optionalTag: {
    textTransform: 'none',
    fontWeight: '400',
    letterSpacing: 'normal',
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
    fontFamily: 'inherit',
  },
  uploadLabel: {
    display: 'block',
  },
  fileInput: {
    display: 'none',
  },
  uploadBox: {
    border: `2px dashed ${tokens.border}`,
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
  },
  uploadIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  uploadText: {
    color: tokens.foreground,
    fontWeight: '600',
    fontSize: '0.95rem',
    margin: '0 0 0.25rem',
  },
  uploadFileName: {
    color: tokens.foreground,
    fontWeight: '600',
    fontSize: '0.95rem',
    margin: '0 0 0.25rem',
    wordBreak: 'break-word',
  },
  uploadHint: {
    color: tokens.bodyMuted,
    fontSize: '0.8rem',
    margin: 0,
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
  uploadTip: {
    color: '#94A3B8',
    fontSize: '0.78rem',
    marginTop: '0.6rem',
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
};

export default CreateSubject;
