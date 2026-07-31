import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { tokens, fontImport } from '../theme';

const SpinnerIcon = () => (
  <svg className="notes-summary-spinner" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke={tokens.border} strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={tokens.accent} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const DocIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={tokens.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const NotesSummary = ({ subjectId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/notes/${subjectId}/summary`);
      setSections(response.data.sections);
    } catch (err) {
      setError("Failed to load summary. Upload notes first if you haven't already.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingBox}>
      <style>{`${fontImport}
        @media (prefers-reduced-motion: no-preference) {
          .notes-summary-spinner { animation: notes-summary-spin 0.8s linear infinite; }
        }
        @keyframes notes-summary-spin { to { transform: rotate(360deg); } }
      `}</style>
      <span style={styles.loadingIconWrap}><SpinnerIcon /></span>
      <p style={styles.loadingText}>Building your summary...</p>
    </div>
  );

  if (error) return (
    <div style={styles.root}>
      <style>{`${fontImport}`}</style>
      <p style={styles.error} role="alert">{error}</p>
    </div>
  );

  if (sections.length === 0) {
    return (
      <div style={styles.emptyBox}>
        <style>{`${fontImport}`}</style>
        <span style={styles.emptyIconWrap}><DocIcon /></span>
        <p style={styles.emptyText}>No notes uploaded yet — upload your notes in Files & Revision to see a summary here.</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{`${fontImport}`}</style>
      {sections.map((section) => (
        <div key={section.note_id} style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            {section.week_number !== null && (
              <span style={styles.weekBadge}>Week {section.week_number}</span>
            )}
            <h3 style={styles.sectionTitle}>{section.filename}</h3>
          </div>

          {section.summary_paragraph ? (
            <p style={styles.summaryParagraph}>{section.summary_paragraph}</p>
          ) : section.key_sentences && section.key_sentences.length > 0 ? (
            <>
              <p style={styles.sectionIntro}>Key points from this lecture:</p>
              <ul style={styles.summaryList}>
                {section.key_sentences.map((sentence, i) => (
                  <li key={i} style={styles.summaryItem}>{sentence}.</li>
                ))}
              </ul>
            </>
          ) : (
            <p style={styles.noContent}>Not enough content to summarise.</p>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  root: { fontFamily: tokens.bodyFont },
  loadingBox: { textAlign: 'center', padding: '3rem', color: tokens.inkSoft, fontFamily: tokens.bodyFont },
  loadingIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' },
  loadingText: { fontSize: '0.95rem', margin: 0 },
  error: { color: tokens.dangerText, fontSize: '0.9rem' },
  emptyBox: { textAlign: 'center', padding: '3rem', color: tokens.inkSoft, fontFamily: tokens.bodyFont },
  emptyIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' },
  emptyText: { margin: 0, fontSize: '0.95rem' },
  sectionCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '1.75rem',
    marginBottom: '1.25rem', border: `1px solid ${tokens.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  weekBadge: {
    backgroundColor: tokens.accentSoft, color: tokens.accentText, fontSize: '0.75rem', fontWeight: '700',
    padding: '0.25rem 0.75rem', borderRadius: '20px', flexShrink: 0,
  },
  sectionTitle: { fontFamily: tokens.displayFont, fontSize: '1rem', fontWeight: '700', color: tokens.ink, margin: 0 },
  summaryParagraph: {
    color: tokens.ink, fontSize: '0.95rem', lineHeight: '1.7', margin: 0,
  },
  sectionIntro: { color: tokens.inkSoft, fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.75rem' },
  noContent: { color: tokens.inkSoft, fontSize: '0.9rem', fontStyle: 'italic', margin: 0 },
  summaryList: { margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  summaryItem: { color: tokens.ink, fontSize: '0.92rem', lineHeight: '1.6' },
};

export default NotesSummary;
