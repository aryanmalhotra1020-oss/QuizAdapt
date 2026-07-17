import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PerformanceOverview from '../components/PerformanceOverview';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'adaptive', label: 'Adaptive Quiz' },
  { key: 'files', label: 'Files & Revision' },
  { key: 'samples', label: 'Sample Papers' },
];

const QUESTION_TYPE_OPTIONS = [
  { key: 'mcq', label: 'Multiple Choice', desc: 'Pick the correct answer from 4 options' },
  { key: 'fill_blank', label: 'Fill in the Blank', desc: 'Choose the missing word from a sentence' },
  { key: 'long_answer', label: 'Long Answer', desc: 'Answer in your own words' },
  { key: 'multi_select', label: 'Choose', desc: 'Select all correct options that apply' },
];

const DIFFICULTY_OPTIONS = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

const Subject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [subjectName, setSubjectName] = useState('');
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['mcq']);
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    fetchSubjectName();
    fetchNotes();
    fetchTopics();
  }, [id]);

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

  const toggleType = (typeKey) => {
    setSelectedTypes(prev =>
      prev.includes(typeKey)
        ? prev.filter(t => t !== typeKey)
        : [...prev, typeKey]
    );
  };

  const handleGenerateQuiz = async () => {
    if (selectedTypes.length === 0) return;
    setGenerating(true);
    setError('');
    try {
      const response = await api.post(`/quiz/generate/${id}`, {
        question_types: selectedTypes,
        difficulty
      });
      navigate(`/quiz/${response.data.quiz_id}`);
    } catch (err) {
      setError('Failed to generate quiz. Make sure you have uploaded notes first.');
      setGenerating(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this topic? It will no longer be used to generate questions.')) return;
    try {
      await api.delete(`/notes/${id}/topics/${topicId}`);
      fetchTopics();
    } catch (err) {
      setError('Failed to delete topic');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
        <h1 style={styles.title}>{subjectName || 'Subject'}</h1>
      </div>

      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.key ? styles.tabBtnActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}

      {activeTab === 'overview' && (
        <PerformanceOverview subjectId={id} onContinueLearning={() => setActiveTab('adaptive')} />
      )}

      {activeTab === 'adaptive' && (
        <div style={styles.configCard}>
          <h2 style={styles.configTitle}>Configure your quiz</h2>
          <p style={styles.configSubtitle}>
            Still adaptive under the hood — weighted toward your weak topics. Pick how you want to be tested.
          </p>

          <div style={styles.configSection}>
            <h3 style={styles.configSectionLabel}>Question Types</h3>
            <div style={styles.typeGrid}>
              {QUESTION_TYPE_OPTIONS.map((opt) => {
                const isSelected = selectedTypes.includes(opt.key);
                return (
                  <div
                    key={opt.key}
                    style={{
                      ...styles.typeOption,
                      ...(isSelected ? styles.typeOptionSelected : {}),
                    }}
                    onClick={() => toggleType(opt.key)}
                  >
                    <div style={styles.typeOptionHeader}>
                      <div style={{
                        ...styles.checkbox,
                        ...(isSelected ? styles.checkboxChecked : {}),
                      }}>
                        {isSelected && '✓'}
                      </div>
                      <span style={styles.typeOptionLabel}>{opt.label}</span>
                    </div>
                    <p style={styles.typeOptionDesc}>{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.configSection}>
            <h3 style={styles.configSectionLabel}>Difficulty</h3>
            <div style={styles.difficultyRow}>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDifficulty(opt.key)}
                  style={{
                    ...styles.difficultyBtn,
                    ...(difficulty === opt.key ? styles.difficultyBtnActive : {}),
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {selectedTypes.length === 0 && (
            <p style={styles.configHint}>Select at least one question type to continue</p>
          )}

          <button
            style={{
              ...styles.generateBtn,
              opacity: (selectedTypes.length === 0 || generating) ? 0.5 : 1,
              cursor: (selectedTypes.length === 0 || generating) ? 'not-allowed' : 'pointer',
            }}
            onClick={handleGenerateQuiz}
            disabled={selectedTypes.length === 0 || generating}
          >
            {generating ? 'Generating Quiz...' : 'Generate Quiz →'}
          </button>
        </div>
      )}

      {activeTab === 'files' && (
        <div style={styles.grid}>
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

            {notes.length > 0 && (
              <div style={styles.notesList}>
                <h3 style={styles.notesTitle}>Uploaded Files</h3>
                {notes.map(note => (
                  <div key={note.id} style={styles.noteItem}>
                    <span style={styles.noteIcon}>
                      {note.filename.endsWith('.pdf') ? '📕' : '📄'}
                    </span>
                    <div>
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
                    <span>{topic.topic_name}</span>
                    <button
                      style={styles.topicDeleteBtn}
                      onclick={() => handleDeleteTopic(topic.id)}
                      title = "Delete topic"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.reviewCard} onClick={() => navigate(`/review/${id}`)}>
              <span style={styles.actionIcon}>🔁</span>
              <div>
                <h3 style={styles.actionTitle}>Review Due Topics</h3>
                <p style={styles.actionDesc}>Spaced repetition for topics you're due to revisit</p>
              </div>
              <span style={styles.actionArrow}>→</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'samples' && (
        <div style={styles.comingSoonCard}>
          <span style={styles.comingSoonIcon}>🔒</span>
          <h3 style={styles.comingSoonTitle}>Sample Papers — coming soon</h3>
          <p style={styles.comingSoonText}>
            Full-length practice papers styled after real exams, generated from your notes.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { marginBottom: '1.5rem' },
  backBtn: { background: 'none', border: 'none', color: '#00B4D8', fontSize: '0.9rem', cursor: 'pointer', padding: 0, marginBottom: '0.75rem', display: 'block', fontWeight: '500' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#1A1A2E', marginBottom: '0.3rem' },
  tabBar: { display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tabBtn: {
    background: 'none', border: 'none', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: '600',
    color: '#94A3B8', cursor: 'pointer', borderBottom: '3px solid transparent', marginBottom: '-2px',
  },
  tabBtnActive: { color: '#00B4D8', borderBottom: '3px solid #00B4D8' },
  errorBanner: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  successBanner: { backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },

  configCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '2rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: '680px',
  },
  configTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#1A1A2E', margin: '0 0 0.4rem' },
  configSubtitle: { color: '#94A3B8', fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: '1.5' },
  configSection: { marginBottom: '1.75rem' },
  configSectionLabel: {
    fontSize: '0.8rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase',
    letterSpacing: '0.05em', margin: '0 0 0.9rem',
  },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  typeOption: {
    border: '2px solid #E2E8F0', borderRadius: '12px', padding: '0.9rem 1rem',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  typeOptionSelected: { borderColor: '#00B4D8', backgroundColor: '#EFFCFF' },
  typeOptionHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' },
  checkbox: {
    width: '18px', height: '18px', borderRadius: '5px', border: '2px solid #CBD5E1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', color: '#fff', flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#00B4D8', borderColor: '#00B4D8' },
  typeOptionLabel: { fontSize: '0.9rem', fontWeight: '700', color: '#1A1A2E' },
  typeOptionDesc: { fontSize: '0.78rem', color: '#94A3B8', margin: 0, paddingLeft: '1.65rem' },
  difficultyRow: { display: 'flex', gap: '0.6rem' },
  difficultyBtn: {
    flex: 1, padding: '0.65rem', borderRadius: '10px', border: '2px solid #E2E8F0',
    backgroundColor: '#fff', color: '#64748B', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
  },
  difficultyBtnActive: { borderColor: '#00B4D8', backgroundColor: '#EFFCFF', color: '#00838F' },
  configHint: { color: '#EF4444', fontSize: '0.8rem', marginBottom: '1rem' },
  generateBtn: {
    width: '100%', padding: '0.95rem', backgroundColor: '#1A1A2E', color: '#00B4D8',
    border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700',
  },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1A1A2E', marginBottom: '0.3rem' },
  cardSubtitle: { color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1rem' },
  uploadLabel: { cursor: 'pointer', display: 'block' },
  fileInput: { display: 'none' },
  uploadBox: { border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '2rem', textAlign: 'center' },
  uploadIcon: { fontSize: '2rem', display: 'block', marginBottom: '0.5rem' },
  uploadText: { color: '#1A1A2E', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' },
  uploadHint: { color: '#94A3B8', fontSize: '0.8rem' },
  notesList: { marginTop: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' },
  notesTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#94A3B8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  noteItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #F8FAFC' },
  noteIcon: { fontSize: '1.2rem' },
  noteName: { fontSize: '0.9rem', fontWeight: '500', color: '#1A1A2E', margin: 0 },
  noteDate: { fontSize: '0.75rem', color: '#94A3B8', margin: 0 },
  emptyTopics: { textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.9rem' },
  emptyIcon: { fontSize: '2rem', display: 'block', marginBottom: '0.5rem' },
  topicsGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  topicTag: { backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.35rem 0.6rem 0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', border: '1px solid #BFDBFE', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap:'0.4rem'},
  topicDeleteBtn: {background:'none', border: 'none', color: '#93C55D', fontSize: '0.75rem', cursor: 'pointer', padding: '0.1rem 0.2rem', lineHeight: 1},
  reviewCard: {
    marginTop: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1.1rem',
    display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #F1F5F9',
  },
  actionIcon: { fontSize: '1.5rem', flexShrink: 0 },
  actionTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1A1A2E', marginBottom: '0.2rem' },
  actionDesc: { fontSize: '0.8rem', color: '#94A3B8' },
  actionArrow: { marginLeft: 'auto', color: '#CBD5E1', fontSize: '1.1rem', flexShrink: 0 },

  comingSoonCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: '560px',
  },
  comingSoonIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '1rem' },
  comingSoonTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#1A1A2E', marginBottom: '0.5rem' },
  comingSoonText: { color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6' },
};

export default Subject;