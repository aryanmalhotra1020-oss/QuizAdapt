import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create a new subject</h2>
        <p style={styles.subtitle}>
          Upload your notes and we'll build a diagnostic quiz to find your starting point.
        </p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>Subject Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Machine Learning"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }}
              placeholder="What is this subject about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={styles.label}>Initial Notes (.txt or .pdf)</label>
            <input
              style={styles.fileInput}
              type="file"
              accept=".txt,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create →'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem 2rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '480px',
  },
  title: {
    margin: '0 0 0.4rem',
    color: '#1A1A2E',
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  subtitle: {
    margin: '0 0 1.75rem',
    color: '#94A3B8',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
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
    fontFamily: 'inherit',
  },
  fileInput: {
    width: '100%',
    fontSize: '0.9rem',
    color: '#1A1A2E',
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
};

export default CreateSubject;