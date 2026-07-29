import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const NotesSummary = ({ subjectId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
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
      <span style={styles.loadingIcon}>📝</span>
      <p style={styles.loadingText}>Building your summary...</p>
    </div>
  );

  if (error) return <p style={styles.error}>{error}</p>;

  if (sections.length === 0) {
    return (
      <div style={styles.emptyBox}>
        <span style={styles.emptyIcon}>📄</span>
        <p>No notes uploaded yet — upload your notes in Files & Revision to see a summary here.</p>
      </div>
    );
  }

  return (
    <div>
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
  loadingBox: { textAlign: 'center', padding: '3rem', color: '#64748B' },
  loadingIcon: { fontSize: '2rem', display: 'block', marginBottom: '0.75rem' },
  loadingText: { fontSize: '0.95rem' },
  error: { color: '#EF4444', fontSize: '0.9rem' },
  emptyBox: { textAlign: 'center', padding: '3rem', color: '#94A3B8' },
  emptyIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '1.75rem',
    marginBottom: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' },
  weekBadge: {
    backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.75rem', fontWeight: '700',
    padding: '0.25rem 0.75rem', borderRadius: '20px', flexShrink: 0,
  },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#1A1A2E', margin: 0 },
  summaryParagraph: {
    color: '#334155', fontSize: '0.95rem', lineHeight: '1.7', margin: 0,
  },
  sectionIntro: { color: '#64748B', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.75rem' },
  noContent: { color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' },
  summaryList: { margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  summaryItem: { color: '#334155', fontSize: '0.92rem', lineHeight: '1.6' },
};

export default NotesSummary;