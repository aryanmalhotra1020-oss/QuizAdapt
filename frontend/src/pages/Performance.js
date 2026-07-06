import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PerformanceOverview from '../components/PerformanceOverview';

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
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(`/subject/${subjectId}`)}>
        ← Back to Subject
      </button>
      <h1 style={styles.title}>{subjectName || 'Performance'}</h1>
      <p style={styles.subtitle}>Your learning progress and knowledge breakdown</p>
      <PerformanceOverview subjectId={subjectId} onContinueLearning={() => navigate(`/subject/${subjectId}`)} />
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  backBtn: { background: 'none', border: 'none', color: '#00B4D8', fontSize: '0.9rem', cursor: 'pointer', padding: 0, marginBottom: '0.75rem', display: 'block', fontWeight: '500' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#1A1A2E', marginBottom: '0.3rem' },
  subtitle: { color: '#94A3B8', fontSize: '0.95rem', marginBottom: '1.5rem' },
};

export default Performance;