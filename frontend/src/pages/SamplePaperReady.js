import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={tokens.good} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <polyline points="8 12 11 15 16 9" />
  </svg>
);

const SamplePaperReady = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [subjectId, setSubjectId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    api.get(`/quiz/${quizId}`)
      .then((res) => {
        setSubjectId(res.data.subject_id);
        setQuestionCount(res.data.questions.length);
        return api.get(`/subjects/${res.data.subject_id}`);
      })
      .then((res) => setSubjectName(res.data.name))
      .catch(() => setError('Failed to load this sample paper.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const download = async (docType, format) => {
    const key = `${docType}-${format}`;
    setDownloading(key);
    try {
      const response = await api.get(`/quiz/sample-paper/${quizId}/download`, {
        params: { doc: docType, format },
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeSubject = (subjectName || 'Subject').replace(/[^A-Za-z0-9]+/g, '_');
      const suffix = docType === 'answers' ? 'AnswerKey' : 'SamplePaper';
      a.href = url;
      a.download = `${safeSubject}_${suffix}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file. Please try again.');
    } finally {
      setDownloading('');
    }
  };

  if (loading) return <div style={styles.centered}><p style={{ fontFamily: tokens.bodyFont }}>Loading...</p></div>;
  if (error) return <div style={styles.centered}><p style={{ color: tokens.dangerText, fontFamily: tokens.bodyFont }}>{error}</p></div>;

  return (
    <div style={styles.centered}>
      <style>{`${fontImport}
        button { cursor: pointer; }
        button:focus-visible { outline: 2px solid ${tokens.accent}; outline-offset: 2px; }
        .sp-download-btn:hover:not(:disabled) { border-color: ${tokens.accent}; background-color: ${tokens.accentSoft}; }
        .sp-back-btn:hover { background-color: ${tokens.accentHover} !important; }
      `}</style>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.iconWrap}><CheckCircleIcon /></span>
          <h2 style={styles.title}>Sample Paper Ready</h2>
          <p style={styles.subtitle}>{subjectName} — {questionCount} questions</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>Question Paper</h3>
          <div style={styles.btnRow}>
            <button
              className="sp-download-btn"
              style={styles.downloadBtn}
              onClick={() => download('paper', 'pdf')}
              disabled={downloading !== ''}
            >
              <DownloadIcon /> {downloading === 'paper-pdf' ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              className="sp-download-btn"
              style={styles.downloadBtn}
              onClick={() => download('paper', 'docx')}
              disabled={downloading !== ''}
            >
              <DownloadIcon /> {downloading === 'paper-docx' ? 'Downloading...' : 'Download Word'}
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>Answer Key</h3>
          <div style={styles.btnRow}>
            <button
              className="sp-download-btn"
              style={styles.downloadBtn}
              onClick={() => download('answers', 'pdf')}
              disabled={downloading !== ''}
            >
              <DownloadIcon /> {downloading === 'answers-pdf' ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              className="sp-download-btn"
              style={styles.downloadBtn}
              onClick={() => download('answers', 'docx')}
              disabled={downloading !== ''}
            >
              <DownloadIcon /> {downloading === 'answers-docx' ? 'Downloading...' : 'Download Word'}
            </button>
          </div>
        </div>

        <button className="sp-back-btn" style={styles.primaryBtn} onClick={() => navigate(`/subject/${subjectId}`)}>
          Back to Subject →
        </button>
      </div>
    </div>
  );
};

const styles = {
  centered: { display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: tokens.paper, padding: '2rem' },
  card: {
    backgroundColor: tokens.card, borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '560px',
    border: `1px solid ${tokens.border}`, boxShadow: '0 4px 24px rgba(33,29,28,0.08)',
  },
  header: { textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: `1px solid ${tokens.paper}` },
  iconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' },
  title: { fontFamily: tokens.displayFont, fontSize: '1.5rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.3rem' },
  subtitle: { color: tokens.inkSoft, fontSize: '0.9rem', margin: 0 },
  section: { marginBottom: '1.75rem' },
  sectionLabel: { fontSize: '0.78rem', fontFamily: tokens.monoFont, fontWeight: '600', color: tokens.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' },
  btnRow: { display: 'flex', gap: '0.75rem' },
  downloadBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    padding: '0.85rem', borderRadius: '10px', borderWidth: '2px', borderStyle: 'solid', borderColor: tokens.border,
    backgroundColor: tokens.card, color: tokens.ink, fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit',
    transition: 'border-color 0.15s, background-color 0.15s',
  },
  primaryBtn: {
    width: '100%', padding: '0.9rem', backgroundColor: tokens.accent, color: tokens.onAccent, border: 'none',
    borderRadius: '999px', fontSize: '1rem', fontWeight: '700', transition: 'background-color 0.15s',
  },
};

export default SamplePaperReady;