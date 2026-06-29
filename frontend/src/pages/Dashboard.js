import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/');
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      await api.post('/subjects/', { name: newSubject });
      setNewSubject('');
      fetchSubjects();
    } catch (err) {
      setError('Failed to create subject');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Subjects</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name}! Select a subject to continue learning.</p>
      </div>

      <div style={styles.createBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="New subject name (e.g. Artificial Intelligence)"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateSubject()}
        />
        <button style={styles.button} onClick={handleCreateSubject}>
          + Add Subject
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.loading}>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <div style={styles.empty}>
          <p>No subjects yet. Create your first one above!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {subjects.map((subject) => (
            <div
              key={subject.id}
              style={styles.card}
              onClick={() => navigate(`/subject/${subject.id}`)}
            >
              <h3 style={styles.cardTitle}>{subject.name}</h3>
              <p style={styles.cardDate}>
                Created {new Date(subject.created_at).toLocaleDateString()}
              </p>
              <div style={styles.cardFooter}>
                <span style={styles.cardLink}>Open Subject →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#1A1A2E',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
  },
  createBox: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#00B4D8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  error: {
    color: 'red',
    fontSize: '0.85rem',
  },
  loading: {
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #eee',
  },
  cardTitle: {
    margin: '0 0 0.5rem',
    color: '#1A1A2E',
    fontSize: '1.2rem',
  },
  cardDate: {
    color: '#999',
    fontSize: '0.85rem',
    margin: '0 0 1rem',
  },
  cardFooter: {
    borderTop: '1px solid #eee',
    paddingTop: '0.75rem',
  },
  cardLink: {
    color: '#00B4D8',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
};

export default Dashboard;