import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const Subject = () => {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchTopics();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/${id}`);
      setNotes(response.data);
    } catch (err) {
      setError('Failed to load notes');
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await api.get(`/notes/${id}/topics`);
      setTopics(response.data);
    } catch (err) {
      console.error('Failed to load topics');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/notes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Notes uploaded and topics extracted!');
      fetchNotes();
      fetchTopics();
    } catch (err) {
      setError('Failed to upload notes');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Subject Notes</h1>
        <p style={styles.subtitle}>Upload your lecture notes to generate quizzes</p>
      </div>

      <div style={styles.uploadBox}>
        <h3 style={styles.sectionTitle}>Upload Notes</h3>
        <p style={styles.hint}>Supported formats: .txt files</p>
        <input
          type="file"
          accept=".txt"
          onChange={handleUpload}
          style={styles.fileInput}
          disabled={uploading}
        />
        {uploading && <p style={styles.uploading}>Uploading and extracting topics...</p>}
        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </div>

      {topics.length > 0 && (
        <div style={styles.topicsSection}>
          <h3 style={styles.sectionTitle}>Extracted Topics</h3>
          <p style={styles.hint}>These topics were identified from your uploaded notes</p>
          <div style={styles.topicsGrid}>
            {topics.map((topic) => (
              <div key={topic.id} style={styles.topicTag}>
                {topic.topic_name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.notesSection}>
        <h3 style={styles.sectionTitle}>Uploaded Notes</h3>
        {notes.length === 0 ? (
          <p style={styles.empty}>No notes uploaded yet.</p>
        ) : (
          <div style={styles.notesList}>
            {notes.map((note) => (
              <div key={note.id} style={styles.noteCard}>
                <span style={styles.noteIcon}>📄</span>
                <div>
                  <p style={styles.noteName}>{note.filename}</p>
                  <p style={styles.noteDate}>
                    Uploaded {new Date(note.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
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
  uploadBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
    border: '2px dashed #00B4D8',
  },
  sectionTitle: {
    margin: '0 0 0.5rem',
    color: '#1A1A2E',
  },
  hint: {
    color: '#999',
    fontSize: '0.85rem',
    margin: '0 0 1rem',
  },
  fileInput: {
    display: 'block',
    marginTop: '0.5rem',
  },
  uploading: {
    color: '#00B4D8',
    marginTop: '0.5rem',
  },
  success: {
    color: 'green',
    marginTop: '0.5rem',
  },
  error: {
    color: 'red',
    marginTop: '0.5rem',
  },
  topicsSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
  },
  topicsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  topicTag: {
    backgroundColor: '#E0F7FA',
    color: '#00838F',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: '1px solid #B2EBF2',
  },
  notesSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: '2rem',
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  noteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  noteIcon: {
    fontSize: '1.5rem',
  },
  noteName: {
    margin: 0,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  noteDate: {
    margin: 0,
    color: '#999',
    fontSize: '0.85rem',
  },
};

export default Subject;