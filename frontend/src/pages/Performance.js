import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PerformanceOverview from '../components/PerformanceOverview';
import { tokens, fontImport } from '../theme';

const Performance = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    api.get(`/subjects/${subjectId}`)
      .then((res) => setSubjectName(res.data.name))
      .catch(() => {});
  }, [subjectId]);

  return (
    <div style={styles.page}>
      <style>{`${fontImport}
        .perf-back-btn:hover { color: ${tokens.ink} !important; }
      `}</style>
      <div style={styles.container}>
        <button className="perf-back-btn" style={styles.backBtn} onClick={() => navigate(`/subject/${subjectId}`)}>
          ← Back to Subject
        </button>
        <h1 style={styles.title}>{subjectName || 'Performance'}</h1>
        <p style={styles.subtitle}>Your learning progress and knowledge breakdown</p>
        <PerformanceOverview subjectId={subjectId} onContinueLearning={() => navigate(`/subject/${subjectId}`)} />
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: tokens.paper, minHeight: '100vh', fontFamily: tokens.bodyFont },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  backBtn: {
    background: 'none', border: 'none', color: tokens.inkSoft, fontSize: '0.9rem', cursor: 'pointer',
    padding: 0, marginBottom: '0.9rem', display: 'block', fontWeight: '600', transition: 'color 0.15s',
  },
  title: { fontFamily: tokens.displayFont, fontSize: '1.9rem', fontWeight: '700', color: tokens.ink, marginBottom: '0.3rem' },
  subtitle: { color: tokens.inkSoft, fontSize: '0.95rem', marginBottom: '1.5rem' },
};

export default Performance;
