import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Subject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState('');
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubjectName();
    fetchNotes();
    fetchTopics();
  }, []);

  const fetchSubjectName = async () => {
    try {
      const response = await api.get(`/subjects/${id}`);
      setSubjectName(response.data.name);
    } catch (err) {
      console.error('Failed to load subject name');
    }
  };

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
      setSuccess('Notes uploaded and topics extracted successfully!');
      fetchNotes();
      fetchTopics();
    } catch (err) {
      setError('Failed to upload notes. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await api.post(`/quiz/generate/${id}`);
      navigate(`/quiz/${response.data.quiz_id}`);
    } catch (err) {
      setError('Failed to generate quiz. Make sure you have uploaded notes first.');
      setGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>{subjectName || 'Subject'}</h1>
          <p style={styles.subtitle}>Upload your notes and start your adaptive learning journey</p>
        </div>
      </div>

      {/* Action Cards */}
      {topics.length > 0 && (
        <div style={styles.actionGrid}>
          <div style={styles.actionCard} onClick={() => navigate(`/diagnostic/${id}`)}>
            <span style={styles.actionIcon}>📊</span>
            <div>
              <h3 style={styles.actionTitle}>Knowledge Assessment</h3>
              <p style={styles.actionDesc}>Test your baseline knowledge first</p>
            </div>
            <span style={styles.actionArrow}>→</span>
          </div>
          <div style={{
            ...styles.actionCard,
            ...styles.actionCardPrimary,
            opacity: generating ? 0.7 : 1,
            cursor: generating ? 'not-allowed' : 'pointer'
          }} onClick={!generating ? handleGenerateQuiz : undefined}>
            <span style={styles.actionIcon}>🧠</span>
            <div>
              <h3 style={styles.actionTitlePrimary}>
                {generating ? 'Generating Quiz...' : 'Adaptive Quiz'}
              </h3>
              <p style={styles.actionDescPrimary}>
                {generating ? 'This may take a moment' : 'Personalised to your weak areas'}
              </p>
            </div>
            <span style={styles.actionArrow}>→</span>
          </div>
          <div style={styles.actionCard} onClick={() => navigate(`/review/${id}`)}>
            <span style={styles.actionIcon}>🔁</span>
            <div>
              <h3 style={styles.actionTitle}>Review Due Topics</h3>
              <p style={styles.actionDesc}>Spaced repetition for topics you're due to revisit</p>
            </div>
            <span style={styles.actionArrow}>→</span>
          </div>
          <div style={styles.actionCard} onClick={() => navigate(`/performance/${id}`)}>
            <span style={styles.actionIcon}>📈</span>
            <div>
              <h3 style={styles.actionTitle}>Performance</h3>
              <p style={styles.actionDesc}>View your progress and knowledge map</p>
            </div>
            <span style={styles.actionArrow}>→</span>
          </div>
        </div>
      )}

      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}

      <div style={styles.grid}>
        {/* Upload Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📄 Upload Notes</h2>
          <p style={styles.cardSubtitle}>Supported: .txt and .pdf files</p>
          <label style={styles.uploadLabel}>
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleUpload}
              style={styles.fileInput}
              disabled={uploading}
            />
            <div style={styles.uploadBox}>
              {uploading ? (
                <>
                  <span style={styles.uploadIcon}>⏳</span>
                  <p style={styles.uploadText}>Uploading and extracting topics...</p>
                  <p style={styles.uploadHint}>This may take a moment</p>
                </>
              ) : (
                <>
                  <span style={styles.uploadIcon}>☁️</span>
                  <p style={styles.uploadText}>Click to upload a file</p>
                  <p style={styles.uploadHint}>.txt or .pdf — max 10MB</p>
                </>
              )}
            </div>
          </label>

          {/* Uploaded Notes */}
          {notes.length > 0 && (
            <div style={styles.notesList}>
              <h3 style={styles.notesTitle}>Uploaded Files</h3>
              {notes.map(note => (
                <div key={note.id} style={styles.noteItem}>
                  <span style={styles.noteIcon}>
                    {note.filename.endsWith('.pdf') ? '📕' : '📄'}
                  </span>
                  <div style={styles.noteInfo}>
                    <p style={styles.noteName}>{note.filename}</p>
                    <p style={styles.noteDate}>
                      {new Date(note.uploaded_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topics Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🏷️ Extracted Topics</h2>
          <p style={styles.cardSubtitle}>
            {topics.length > 0
              ? `${topics.length} topics identified from your notes`
              : 'Upload notes to see extracted topics'}
          </p>
          {topics.length === 0 ? (
            <div style={styles.emptyTopics}>
              <span style={styles.emptyIcon}>📝</span>
              <p>No topics yet — upload your notes to get started</p>
            </div>
          ) : (
            <div style={styles.topicsGrid}>
              {topics.map(topic => (
                <div key={topic.id} style={styles.topicTag}>
                  {topic.topic_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#00B4D8',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '0.75rem',
    display: 'block',
    fontWeight: '500',
  },
  headerContent: {},
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: '0.3rem',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: '0.95rem',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    border: '2px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
  },
  actionCardPrimary: {
    backgroundColor: '#1A1A2E',
    border: '2px solid #00B4D8',
  },
  actionIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  actionTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: '0.2rem',
  },
  actionDesc: {
    fontSize: '0.8rem',
    color: '#94A3B8',
  },
  actionArrow: {
    marginLeft: 'auto',
    color: '#CBD5E1',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  actionTitlePrimary: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '0.2rem',
  },
  actionDescPrimary: {
    fontSize: '0.8rem',
    color: '#CBD5E1',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#16A34A',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: '0.3rem',
  },
  cardSubtitle: {
    color: '#94A3B8',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  fileInput: {
    display: 'none',
  },
  uploadBox: {
    border: '2px dashed #E2E8F0',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  uploadIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  uploadText: {
    color: '#1A1A2E',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
  },
  uploadHint: {
    color: '#94A3B8',
    fontSize: '0.8rem',
  },
  notesList: {
    marginTop: '1rem',
    borderTop: '1px solid #F1F5F9',
    paddingTop: '1rem',
  },
  notesTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  noteItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0',
    borderBottom: '1px solid #F8FAFC',
  },
  noteIcon: {
    fontSize: '1.2rem',
  },
  noteInfo: {},
  noteName: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#1A1A2E',
    margin: 0,
  },
  noteDate: {
    fontSize: '0.75rem',
    color: '#94A3B8',
    margin: 0,
  },
  emptyTopics: {
    textAlign: 'center',
    padding: '2rem',
    color: '#94A3B8',
    fontSize: '0.9rem',
  },
  emptyIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  topicsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  topicTag: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: '1px solid #BFDBFE',
    textTransform: 'capitalize',
  },
};

export default Subject;