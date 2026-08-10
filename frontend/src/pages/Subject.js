import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PerformanceOverview from '../components/PerformanceOverview';
import { tokens, fontImport } from '../theme';
import NotesSummary from '../components/NotesSummary';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'summary', label: 'Summary of Notes' },
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

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CloudUploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={tokens.inkSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
  </svg>
);

const DocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.accentText} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="subj-spinner" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke={tokens.border} strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={tokens.accent} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const TagIcon = ({ size = 18, color = tokens.inkSoft }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2.41 12.41A2 2 0 0 1 2 11V4a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l8.18 8.18a2 2 0 0 1 0 2.83Z" />
    <circle cx="7.5" cy="7.5" r="1.5" fill={color} stroke="none" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Subject = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [subjectName, setSubjectName] = useState('');
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['mcq']);
  const [difficulty, setDifficulty] = useState('medium');
  const [sampleTypes, setSampleTypes] = useState(['mcq']);
  const [sampleDifficulty, setSampleDifficulty] = useState('medium');
  const [sampleCount, setSampleCount] = useState(10);
  const [generatingSample, setGeneratingSample] = useState(false);

  useEffect(() => {
    fetchSubjectName();
    fetchNotes();
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${files[i].name}`);
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        await api.post(`/notes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }
    setUploadProgress('');
    setUploading(false);

    if (successCount > 0) {
      setSuccess(`${successCount} file${successCount > 1 ? 's' : ''} uploaded and topics extracted successfully!`);
    }
    if (failCount > 0) {
      setError(`${failCount} file${failCount > 1 ? 's' : ''} failed to upload.`);
    }

    fetchNotes();
    fetchTopics();

    e.target.value = '';
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

  const toggleSampleType = (typeKey) => {
    setSampleTypes(prev =>
      prev.includes(typeKey) ? prev.filter(t => t !== typeKey) : [...prev, typeKey]
    );
  };

  const handleGenerateSamplePaper = async () => {
    if (sampleTypes.length === 0) return;
    setGeneratingSample(true);
    setError('');
    try {
      const response = await api.post(`/quiz/sample-paper/${id}`, {
        question_types: sampleTypes,
        difficulty: sampleDifficulty,
        num_questions: sampleCount,
      });
      navigate(`/sample-paper/${response.data.quiz_id}`);
    } catch (err) {
      setError('Failed to generate sample paper. Make sure you have uploaded notes first.');
      setGeneratingSample(false);
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

  const goToReview = () => navigate(`/review/${id}`);
  const handleReviewKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToReview();
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        ${fontImport}

        .subj-back-link:hover { color: ${tokens.ink} !important; }
        .subj-tab-btn { cursor: pointer; transition: color 0.15s, border-color 0.15s; }
        .subj-tab-btn:hover { color: ${tokens.ink}; }
        a, button { cursor: pointer; }
        a:focus-visible, button:focus-visible, [role="button"]:focus-visible {
          outline: 2px solid ${tokens.accent}; outline-offset: 2px;
        }
        .subj-type-option:hover { border-color: #CBD5E1; }
        .subj-diff-btn:hover { border-color: #CBD5E1; }
        .subj-generate-btn:hover:not(:disabled) { background-color: ${tokens.accentHover} !important; }
        .subj-dropzone-label:hover .subj-dropzone { border-color: ${tokens.accent}; background-color: ${tokens.paper}; }
        .subj-topic-delete:hover { color: ${tokens.dangerText} !important; }
        .subj-review-card:hover { border-color: ${tokens.accent}; background-color: ${tokens.card}; box-shadow: 0 2px 12px rgba(33,29,28,0.06); }

        @media (prefers-reduced-motion: no-preference) {
          .subj-spinner { animation: subj-spin 0.8s linear infinite; }
        }
        @keyframes subj-spin { to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          .subj-files-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .subj-type-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/dashboard" className="subj-back-link" style={styles.backLink}>← Dashboard</Link>
          <h1 style={styles.title}>{subjectName || 'Subject'}</h1>
        </div>

        <div style={styles.tabBar} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className="subj-tab-btn"
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

        {error && <div style={styles.errorBanner} role="alert" aria-live="polite">{error}</div>}
        {success && <div style={styles.successBanner} role="status" aria-live="polite">{success}</div>}

        {activeTab === 'overview' && (
          <PerformanceOverview subjectId={id} onContinueLearning={() => setActiveTab('adaptive')} />
        )}

        {activeTab === 'summary' && (
          <NotesSummary subjectId={id} />
        )}

        {activeTab === 'adaptive' && (
          <>
          <div style={styles.configCard}>
            <h2 style={styles.configTitle}>Configure your quiz</h2>
            <p style={styles.configSubtitle}>
              Still adaptive under the hood — weighted toward your weak topics. Pick how you want to be tested.
            </p>

            <div style={styles.configSection}>
              <h3 style={styles.configSectionLabel}>Question Types</h3>
              <div style={styles.typeGrid} className="subj-type-grid">
                {QUESTION_TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedTypes.includes(opt.key);
                  return (
                    <div
                      key={opt.key}
                      className="subj-type-option"
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      style={{
                        ...styles.typeOption,
                        ...(isSelected ? styles.typeOptionSelected : {}),
                      }}
                      onClick={() => toggleType(opt.key)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleType(opt.key); } }}
                    >
                      <div style={styles.typeOptionHeader}>
                        <div style={{
                          ...styles.checkbox,
                          ...(isSelected ? styles.checkboxChecked : {}),
                        }}>
                          {isSelected && <CheckIcon />}
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
                    className="subj-diff-btn"
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
              <p style={styles.configHint} role="alert">Select at least one question type to continue</p>
            )}

            <button
              className="subj-generate-btn"
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
          <div
              className="subj-review-card"
              style={styles.reviewCard}
              onClick={goToReview}
              role="button"
              tabIndex={0}
              onKeyDown={handleReviewKeyDown}
            >
              <span style={styles.actionIconWrap}><RefreshIcon /></span>
              <div style={{ minWidth: 0 }}>
                <h3 style={styles.actionTitle}>Review Due Topics</h3>
                <p style={styles.actionDesc}>Spaced repetition for topics you're due to revisit</p>
              </div>
              <span style={styles.actionArrow}>→</span>
            </div>
          </>
        )}

        {activeTab === 'files' && (
          <div style={styles.filesGrid} className="subj-files-grid">
            <div style={styles.card}>
              <h2 style={styles.cardTitle}><UploadIcon /> Upload Notes</h2>
              <p style={styles.cardSubtitle}>Supported: .txt and .pdf files</p>
              <label style={styles.uploadLabel} className="subj-dropzone-label">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  multiple
                  onChange={handleUpload}
                  style={styles.fileInput}
                  disabled={uploading}
                />
                <div style={styles.uploadBox} className="subj-dropzone">
                  {uploading ? (
                    <>
                      <span style={styles.uploadIconWrap}><SpinnerIcon /></span>
                      <p style={styles.uploadText}>{uploadProgress || 'Uploading and extracting topics...'}</p>
                      <p style={styles.uploadHint}>This may take a moment per file</p>
                    </>
                  ) : (
                    <>
                      <span style={styles.uploadIconWrap}><CloudUploadIcon /></span>
                      <p style={styles.uploadText}>Click to upload files</p>
                      <p style={styles.uploadHint}>.txt or .pdf — select multiple, max 10MB each</p>
                    </>
                  )}
                </div>
              </label>

              {notes.length > 0 && (
                <div style={styles.notesList}>
                  <h3 style={styles.notesTitle}>Uploaded Files</h3>
                  {notes.map(note => (
                    <div key={note.id} style={styles.noteItem}>
                      <span style={styles.noteIconWrap}><DocIcon /></span>
                      <div style={{ minWidth: 0 }}>
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
              <h2 style={styles.cardTitle}><TagIcon /> Extracted Topics</h2>
              <p style={styles.cardSubtitle}>
                {topics.length > 0
                  ? `${topics.length} topics identified from your notes`
                  : 'Upload notes to see extracted topics'}
              </p>
              {topics.length === 0 ? (
                <div style={styles.emptyTopics}>
                  <span style={styles.emptyIconWrap}><TagIcon size={30} color={tokens.border} /></span>
                  <p style={{ margin: 0 }}>No topics yet — upload your notes to get started</p>
                </div>
              ) : (
                <div style={styles.topicsGrid}>
                  {topics.map(topic => (
                    <div key={topic.id} style={styles.topicTag}>
                      <span>{topic.topic_name}</span>
                      {user?.is_admin && (
                        <button
                          className="subj-topic-delete"
                          style={styles.topicDeleteBtn}
                          onClick={() => handleDeleteTopic(topic.id)}
                          aria-label={`Delete topic ${topic.topic_name}`}
                        >
                          <XIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'samples' && (
          <div style={styles.configCard}>
            <h2 style={styles.configTitle}>Generate a sample paper</h2>
            <p style={styles.configSubtitle}>
              A comprehensive practice paper covering topics across the whole subject — not just your weak areas.
            </p>

            <div style={styles.configSection}>
              <h3 style={styles.configSectionLabel}>Number of Questions</h3>
              <input
                type="number"
                min={1}
                max={25}
                value={sampleCount}
                onChange={(e) => setSampleCount(e.target.value)}
                style={styles.countInput}
              />
              <p style={styles.countHint}>Up to 25. Actual count may be lower if the subject has fewer topics.</p>
            </div>

            <div style={styles.configSection}>
              <h3 style={styles.configSectionLabel}>Question Types</h3>
              <div style={styles.typeGrid} className="subj-type-grid">
                {QUESTION_TYPE_OPTIONS.map((opt) => {
                  const isSelected = sampleTypes.includes(opt.key);
                  return (
                    <div
                      key={opt.key}
                      className="subj-type-option"
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      style={{
                        ...styles.typeOption,
                        ...(isSelected ? styles.typeOptionSelected : {}),
                      }}
                      onClick={() => toggleSampleType(opt.key)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSampleType(opt.key); } }}
                    >
                      <div style={styles.typeOptionHeader}>
                        <div style={{ ...styles.checkbox, ...(isSelected ? styles.checkboxChecked : {}) }}>
                          {isSelected && <CheckIcon />}
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
                    className="subj-diff-btn"
                    onClick={() => setSampleDifficulty(opt.key)}
                    style={{
                      ...styles.difficultyBtn,
                      ...(sampleDifficulty === opt.key ? styles.difficultyBtnActive : {}),
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {sampleTypes.length === 0 && (
              <p style={styles.configHint} role="alert">Select at least one question type to continue</p>
            )}

            <button
              className="subj-generate-btn"
              style={{
                ...styles.generateBtn,
                opacity: (sampleTypes.length === 0 || generatingSample) ? 0.5 : 1,
                cursor: (sampleTypes.length === 0 || generatingSample) ? 'not-allowed' : 'pointer',
              }}
              onClick={handleGenerateSamplePaper}
              disabled={sampleTypes.length === 0 || generatingSample}
            >
              {generatingSample ? 'Generating Sample Paper...' : 'Generate Sample Paper →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: tokens.paper, minHeight: '100vh', fontFamily: tokens.bodyFont },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { marginBottom: '1.5rem' },
  backLink: {
    display: 'inline-block', color: tokens.inkSoft, fontSize: '0.9rem', fontWeight: '600',
    textDecoration: 'none', marginBottom: '0.9rem', transition: 'color 0.15s',
  },
  title: { fontFamily: tokens.displayFont, fontSize: '1.9rem', fontWeight: '700', color: tokens.ink, margin: 0 },
  tabBar: { display: 'flex', gap: '0.5rem', borderBottom: `2px solid ${tokens.border}`, marginBottom: '1.75rem', flexWrap: 'wrap' },
  tabBtn: {
    background: 'none', border: 'none', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: '600',
    color: tokens.inkSoft, borderBottom: '3px solid transparent', marginBottom: '-2px', fontFamily: 'inherit',
  },
  tabBtnActive: { color: tokens.accentText, borderBottom: `3px solid ${tokens.accent}` },
  errorBanner: { backgroundColor: tokens.dangerSoft, border: `1px solid ${tokens.dangerBorder}`, color: tokens.dangerText, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' },
  successBanner: { backgroundColor: tokens.successSoft, border: `1px solid ${tokens.successBorder}`, color: tokens.successText, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' },

  configCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '2rem',
    boxShadow: '0 2px 12px rgba(33,29,28,0.06)', maxWidth: '680px', border: `1px solid ${tokens.border}`,
  },
  configTitle: { fontFamily: tokens.displayFont, fontSize: '1.3rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.4rem' },
  configSubtitle: { color: tokens.inkSoft, fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: '1.5' },
  configSection: { marginBottom: '1.75rem' },
  configSectionLabel: {
    fontSize: '0.75rem', fontFamily: tokens.monoFont, fontWeight: '600', color: tokens.inkSoft, textTransform: 'uppercase',
    letterSpacing: '0.05em', margin: '0 0 0.9rem',
  },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  typeOption: {
    border: `2px solid ${tokens.border}`, borderRadius: '12px', borderColor: tokens.border, padding: '0.9rem 1rem',
    cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s',
  },
  typeOptionSelected: { borderColor: tokens.accent, backgroundColor: tokens.accentSoft },
  typeOptionHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' },
  checkbox: {
    width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${tokens.border}`, borderColor: tokens.border,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  typeOptionLabel: { fontSize: '0.9rem', fontWeight: '700', color: tokens.ink },
  typeOptionDesc: { fontSize: '0.78rem', color: tokens.inkSoft, margin: 0, paddingLeft: '1.65rem' },
  difficultyRow: { display: 'flex', gap: '0.6rem' },
  difficultyBtn: {
    flex: 1, padding: '0.65rem', borderRadius: '10px', border: `2px solid ${tokens.border}`, borderColor: tokens.border,
    backgroundColor: tokens.card, color: tokens.inkSoft, fontWeight: '700', fontSize: '0.85rem', fontFamily: 'inherit',
  }, 
  difficultyBtnActive: { borderColor: tokens.accent, backgroundColor: tokens.accentSoft, color: tokens.accentText },
  configHint: { color: tokens.dangerText, fontSize: '0.8rem', marginBottom: '1rem' },
  generateBtn: {
    width: '100%', padding: '0.95rem', backgroundColor: tokens.accent, color: tokens.onAccent,
    border: 'none', borderRadius: '999px', fontSize: '1rem', fontWeight: '700', transition: 'background-color 0.15s',
  },

  filesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' },
  card: { backgroundColor: tokens.card, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(33,29,28,0.06)', border: `1px solid ${tokens.border}`, minWidth: 0 },
  cardTitle: { fontFamily: tokens.displayFont, fontSize: '1.1rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  cardSubtitle: { color: tokens.inkSoft, fontSize: '0.85rem', marginBottom: '1.25rem' },
  uploadLabel: { cursor: 'pointer', display: 'block' },
  fileInput: { display: 'none' },
  uploadBox: { border: `2px dashed ${tokens.border}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', transition: 'border-color 0.15s, background-color 0.15s' },
  uploadIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' },
  uploadText: { color: tokens.ink, fontWeight: '600', fontSize: '0.95rem', margin: '0 0 0.25rem' },
  uploadHint: { color: tokens.inkSoft, fontSize: '0.8rem', margin: 0 },
  notesList: { marginTop: '1.25rem', borderTop: `1px solid ${tokens.border}`, paddingTop: '1rem' },
  notesTitle: { fontSize: '0.75rem', fontFamily: tokens.monoFont, fontWeight: '600', color: tokens.inkSoft, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  noteItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: `1px solid ${tokens.paper}` },
  noteIconWrap: { flexShrink: 0, display: 'flex' },
  noteName: { fontSize: '0.9rem', fontWeight: '600', color: tokens.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  noteDate: { fontSize: '0.75rem', color: tokens.inkSoft, margin: 0 },
  emptyTopics: { textAlign: 'center', padding: '2rem 1rem', color: tokens.inkSoft, fontSize: '0.9rem' },
  emptyIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' },
  topicsGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  topicTag: { backgroundColor: tokens.accentSoft, color: tokens.accentText, padding: '0.35rem 0.6rem 0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', border: '1px solid #BFDBFE', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  topicDeleteBtn: { background: 'none', border: 'none', color: tokens.inkSoft, cursor: 'pointer', padding: '0.2rem', lineHeight: 1, display: 'flex', transition: 'color 0.15s' },
  reviewCard: {
    marginTop: '1.25rem', backgroundColor: tokens.paper, borderRadius: '12px', padding: '1.1rem',
    display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: `1px solid ${tokens.border}`,
    transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
  },
  actionIconWrap: { flexShrink: 0, color: tokens.accentText, display: 'flex' },
  actionTitle: { fontSize: '0.95rem', fontWeight: '700', color: tokens.ink, margin: '0 0 0.2rem' },
  actionDesc: { fontSize: '0.8rem', color: tokens.inkSoft, margin: 0 },
  actionArrow: { marginLeft: 'auto', color: tokens.inkSoft, fontSize: '1.1rem', flexShrink: 0 },
  countInput: {
  width: '100px', padding: '0.6rem 0.75rem', borderRadius: '10px',
  borderWidth: '2px', borderStyle: 'solid', borderColor: tokens.border,
  fontSize: '0.95rem', color: tokens.ink, fontFamily: 'inherit',
  },
  countHint: { color: tokens.inkSoft, fontSize: '0.78rem', margin: '0.5rem 0 0' },
};

export default Subject;
