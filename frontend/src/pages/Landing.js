import React from 'react';
import { Link } from 'react-router-dom';

const tokens = {
  ink: '#334155',
  inkSoft: '#64748B',
  accent: '#2563EB',
  accentText: '#1D4ED8',
  accentSoft: '#DBEAFE',
  onAccent: '#FFFFFF',
  paper: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  darkSurface: '#0F172A',
  onInkMuted: '#CBD5E1',
  displayFont: "'Bricolage Grotesque', 'Segoe UI', sans-serif",
  bodyFont: "'Karla', 'Segoe UI', sans-serif",
  monoFont: "'IBM Plex Mono', 'Courier New', monospace",
};

const LogoMark = ({ size = 26, dark = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="7" fill={dark ? tokens.ink : tokens.accent} />
    <rect x="5" y="13" width="3.2" height="6" rx="1" fill={dark ? tokens.accent : tokens.ink} />
    <rect x="10.4" y="9" width="3.2" height="10" rx="1" fill={dark ? tokens.accent : tokens.ink} />
    <rect x="15.8" y="5" width="3.2" height="14" rx="1" fill={dark ? '#FFFFFF' : '#FFFFFF'} opacity="0.9" />
  </svg>
);

/* Hand-drawn marker annotations — the page's signature device */
const CircleDoodle = ({ style }) => (
  <svg viewBox="0 0 220 90" style={style} aria-hidden="true">
    <path
      d="M12 46 C10 20, 55 6, 112 7 C172 8, 210 20, 207 48 C204 74, 155 84, 100 83 C48 82, 14 70, 12 46Z"
      fill="none" stroke={tokens.accent} strokeWidth="4" strokeLinecap="round"
    />
  </svg>
);

const UnderlineDoodle = ({ style }) => (
  <svg viewBox="0 0 200 18" style={style} aria-hidden="true">
    <path d="M3 11 Q30 3, 55 10 T105 9 T155 11 T197 8" fill="none" stroke={tokens.accent} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const CheckDoodle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M4 13 L9.5 18.5 L20 6" stroke={tokens.accent} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MiniCheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDoodle = ({ style }) => (
  <svg viewBox="0 0 60 40" style={style} aria-hidden="true">
    <path d="M4 4 C20 8, 34 16, 40 34" fill="none" stroke={tokens.accent} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M30 30 L40 34 L38 23" fill="none" stroke={tokens.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const TagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2.41 12.41A2 2 0 0 1 2 11V4a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l8.18 8.18a2 2 0 0 1 0 2.83Z" />
    <circle cx="7.5" cy="7.5" r="1.3" fill={tokens.ink} stroke="none" />
  </svg>
);
const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill={tokens.ink} stroke="none" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" />
  </svg>
);
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const FEATURES = [
  { Icon: UploadIcon, title: 'Upload your notes', body: 'Drop in a PDF or plain text — lecture notes, a textbook chapter, whatever you have.' },
  { Icon: TagIcon, title: 'Topics get extracted', body: 'QuizAdapt reads your notes and pulls out the concepts they actually cover.' },
  { Icon: TargetIcon, title: 'Questions target your gaps', body: 'A short diagnostic finds what you already know, then every quiz after that leans toward what you don’t.' },
  { Icon: RefreshIcon, title: 'Weak spots resurface on schedule', body: 'Spaced repetition brings topics back right before you’d normally forget them.' },
];

const BUILT_FOR = [
  {
    eyebrow: 'BEFORE AN EXAM',
    title: 'Cramming? Start with a diagnostic.',
    body: 'Create a subject and QuizAdapt runs a short diagnostic quiz first, so it knows what to focus on before it generates a single practice question.',
    mock: 'diagnostic',
  },
  {
    eyebrow: 'OVER A SEMESTER',
    title: 'Studying for the long run? Let it resurface what fades.',
    body: 'Every topic gets a mastery score. The review queue brings weak topics back right before you’re due to forget them — not on a fixed calendar, on yours.',
    mock: 'review',
  },
  {
    eyebrow: 'ANY SUBJECT',
    title: 'Your notes, your format, your call on difficulty.',
    body: 'Multiple choice, fill-in-the-blank, long answer, or select-all. Easy, medium, or hard. Mix and match per quiz — it’s still weighted toward your weak topics underneath.',
    mock: 'config',
  },
];

const Landing = () => {
  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@500;600&display=swap');

        a, button { cursor: pointer; }
        a:focus-visible, button:focus-visible {
          outline: 2px solid ${tokens.ink}; outline-offset: 3px;
        }
        .ld-cta-accent:hover { background-color: ${tokens.accentText} !important; }
        .ld-cta-ghost:hover { border-color: ${tokens.ink} !important; }
        .ld-nav-link:hover { opacity: 0.75; }
        .ld-bento-card, .ld-step-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        @media (prefers-reduced-motion: no-preference) {
          .ld-bento-card:hover, .ld-step-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 28px rgba(51,65,85,0.12);
          }
        }
        .ld-bento-card:hover, .ld-step-card:hover { border-color: ${tokens.ink}; }

        @media (max-width: 900px) {
          .ld-hero { flex-direction: column !important; padding: 3.5rem 1.5rem !important; gap: 2.5rem !important; }
          .ld-built-row { flex-direction: column !important; }
          .ld-built-row.reverse { flex-direction: column !important; }
          .ld-mech-strip { flex-wrap: wrap !important; justify-content: flex-start !important; }
        }
        @media (max-width: 640px) {
          .ld-header { padding: 1rem 1.25rem !important; }
          .ld-section-pad { padding: 3.5rem 1.25rem !important; }
          .ld-headline { font-size: 2.1rem !important; }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header} className="ld-header">
        <div style={styles.brand}>
          <LogoMark />
          QuizAdapt
        </div>
        <nav style={styles.headerLinks}>
          <Link to="/login" style={styles.loginLink} className="ld-nav-link">Log in</Link>
          <Link to="/register" style={styles.headerCta} className="ld-cta-accent">Get Started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero} className="ld-hero">
        <div style={styles.heroText}>
          <span style={styles.eyebrow}>ADAPTIVE STUDY, FROM YOUR OWN NOTES</span>
          <h1 style={styles.headline} className="ld-headline">
            Learn what you<br />
            <span style={styles.headlineDoodleWrap}>
              don&rsquo;t know yet.
              <CircleDoodle style={styles.circleDoodle} />
            </span>
          </h1>
          <p style={styles.subheadline}>
            QuizAdapt turns your own notes into quizzes that target your weak spots -
            not just the topics you already know.
          </p>
          <div style={styles.heroCtas}>
            <Link to="/register" style={styles.primaryBtn} className="ld-cta-accent">Get Started →</Link>
            <Link to="/login" style={styles.ghostBtn} className="ld-cta-ghost">Log in</Link>
          </div>
        </div>

        <div style={styles.heroDemo}>
          <div style={styles.demoStack}>
            <div style={styles.demoCard}>
              <span style={styles.demoCardLabel}>Your notes</span>
              <p style={styles.demoNoteText}>
                The goal of machine learning is to develop methods that can automatically detect
                patterns in data, and then use the uncovered patterns to predict future data or
                other outcomes of interest.
              </p>
            </div>

            <div style={styles.demoArrowRow} aria-hidden="true">
              <ArrowDoodle style={styles.demoArrowDoodle} />
            </div>

            <div style={{ ...styles.demoCard, ...styles.demoCardAccent }}>
              <span style={styles.demoBadge}>Generated by QuizAdapt</span>
              <p style={styles.demoQuestion}>What is the primary goal of Machine Learning?</p>
              <div style={styles.demoOptions}>
                <div style={styles.demoOption}>A. Manually label data for computers to memorize known outcomes</div>
                <div style={{ ...styles.demoOption, ...styles.demoOptionCorrect }}>
                  B. Develop methods that detect patterns and predict future data
                </div>
                <div style={styles.demoOption}>C. Replace human decision-making with fixed rules</div>
              </div>
            </div>
          </div>

          <div style={styles.floatBadge}>
            <TagIcon />
            <div>
              <span style={styles.floatBadgeNum}>6</span>
              <span style={styles.floatBadgeLabel}>topics extracted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism strip */}
      <div style={styles.mechStrip} className="ld-mech-strip">
        {[
          'T5 question generation',
          'Adaptive difficulty',
          'Spaced repetition',
          'Multiple question formats',
        ].map((label) => (
          <div key={label} style={styles.mechPill}>
            <CheckDoodle />
            {label}
          </div>
        ))}
      </div>

      {/* Feature list + mock dashboard */}
      <section style={styles.featureSection} className="ld-section-pad">
        <div style={styles.featureRow}>
          <div style={styles.featureListCol}>
            <span style={styles.eyebrow}>HOW IT WORKS</span>
            <h2 style={styles.sectionTitle}>Everything after &ldquo;upload&rdquo; happens on its own.</h2>
            <div style={styles.featureList}>
              {FEATURES.map((f) => (
                <div key={f.title} style={styles.featureItem}>
                  <span style={styles.featureIconWrap}><f.Icon /></span>
                  <div>
                    <h3 style={styles.featureItemTitle}>{f.title}</h3>
                    <p style={styles.featureItemBody}>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.mockDashCol}>
            <div style={styles.mockDashCard}>
              <div style={styles.mockDashHeader}>
                <span style={styles.mockDashDot} /><span style={styles.mockDashDot} /><span style={styles.mockDashDot} />
              </div>
              <img
                src="/screenshots/dashboard.png"
                alt="The QuizAdapt dashboard, showing a subject list and a knowledge-score summary"
                style={styles.mockDashImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bento — pipeline artifacts */}
      <section style={styles.bentoSection} className="ld-section-pad">
        <span style={{ ...styles.eyebrow, textAlign: 'center', display: 'block' }}>THE STUDY LOOP</span>
        <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>
          Every step, made visible.
          <UnderlineDoodle style={styles.sectionUnderline} />
        </h2>
        <div style={styles.bentoGrid}>
          <div style={styles.bentoCard} className="ld-bento-card">
            <span style={styles.bentoLabel}>01 — YOUR NOTES</span>
            <p style={styles.bentoNote}>&ldquo;...the goal of machine learning is to develop methods that can automatically detect patterns in data...&rdquo;</p>
          </div>
          <div style={styles.bentoCard} className="ld-bento-card">
            <span style={styles.bentoLabel}>02 — TOPICS FOUND</span>
            <div style={styles.bentoTags}>
              {['Machine Learning', 'Pattern Detection', 'Predictive Modeling', 'Data Patterns'].map((t) => (
                <span key={t} style={styles.bentoTag}>{t}</span>
              ))}
            </div>
          </div>
          <div style={styles.bentoCard} className="ld-bento-card">
            <span style={styles.bentoLabel}>03 — DIFFICULTY</span>
            <div style={styles.bentoDiffRow}>
              {['Easy', 'Medium', 'Hard'].map((d, i) => (
                <span key={d} style={{ ...styles.bentoDiffPill, ...(i === 1 ? styles.bentoDiffPillActive : {}) }}>{d}</span>
              ))}
            </div>
            <p style={styles.bentoSmallNote}>Weighted toward weak topics either way.</p>
          </div>
          <div style={styles.bentoCard} className="ld-bento-card">
            <span style={styles.bentoLabel}>04 — QUESTION</span>
            <p style={styles.bentoQuestion}>What is the primary goal of Machine Learning?</p>
            <div style={styles.bentoMiniOption}>Develop methods that detect patterns and predict future data</div>
          </div>
          <div style={styles.bentoCard} className="ld-bento-card">
            <span style={styles.bentoLabel}>05 — MASTERY</span>
            <div style={styles.bentoMasteryRow}>
              <span style={styles.bentoMasteryChip}>Machine Learning · 30%</span>
              <ChartIcon />
            </div>
            <div style={styles.mockBarTrack}><div style={{ ...styles.mockBarFill, width: '30%' }} /></div>
          </div>
          <div style={styles.bentoCard} className="ld-bento-card">
            <span style={styles.bentoLabel}>06 — REVIEW QUEUE</span>
            <p style={styles.bentoSmallNote}>Machine Learning is due for review in 2 days, before it fades.</p>
          </div>
        </div>
      </section>

      {/* Built for how you study */}
      <section style={styles.builtSection} className="ld-section-pad">
        {BUILT_FOR.map((item, i) => (
          <div key={item.title} style={styles.builtRow} className={`ld-built-row${i % 2 ? ' reverse' : ''}`}>
            <div style={{ ...styles.builtVisual, order: i % 2 ? 2 : 1 }}>
              <BuiltMock kind={item.mock} />
            </div>
            <div style={{ ...styles.builtText, order: i % 2 ? 1 : 2 }}>
              <span style={styles.eyebrow}>{item.eyebrow}</span>
              <h3 style={styles.builtTitle}>{item.title}</h3>
              <p style={styles.builtBody}>{item.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Stats + CTA */}
      <section style={styles.statsCta}>
        <div style={styles.statsRow}>
          {[
            { num: '4', label: 'question formats' },
            { num: '3', label: 'difficulty levels' },
            { num: 'T5', label: 'generation model' },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <span style={styles.statNum}>{s.num}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
        <h2 style={styles.ctaHeadline}>Upload your first set of notes and see what it finds.</h2>
        <Link to="/register" style={styles.ctaBtn} className="ld-cta-accent">Get Started for Free →</Link>
      </section>
    </div>
  );
};

const BuiltMock = ({ kind }) => {
  if (kind === 'diagnostic') {
    return (
      <div style={styles.builtMockCard}>
        <span style={styles.mockDashLabel}>Diagnostic Quiz</span>
        <p style={styles.builtMockTitle}>Machine Learning — starting point</p>
        <div style={styles.mockBarTrack}><div style={{ ...styles.mockBarFill, width: '20%' }} /></div>
        <p style={styles.bentoSmallNote}>Question 2 of 10</p>
      </div>
    );
  }
  if (kind === 'review') {
    return (
      <div style={styles.builtMockCard}>
        <span style={styles.mockDashLabel}>Review Queue</span>
        {['Machine Learning', 'Pattern Detection', 'Predictive Modeling'].map((t) => (
          <div key={t} style={styles.builtReviewRow}>
            <RefreshIcon />
            <span>{t}</span>
            <span style={styles.builtReviewDue}>due today</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={styles.builtMockCard}>
      <span style={styles.mockDashLabel}>Configure your quiz</span>
      <div style={styles.builtTypeGrid}>
        {[
          { label: 'Multiple Choice', selected: true },
          { label: 'Fill in the Blank', selected: false },
          { label: 'Long Answer', selected: false },
          { label: 'Choose', selected: true },
        ].map((opt) => (
          <div key={opt.label} style={{ ...styles.builtTypeOption, ...(opt.selected ? styles.builtTypeOptionSelected : {}) }}>
            <span style={{ ...styles.builtCheckbox, ...(opt.selected ? styles.builtCheckboxChecked : {}) }}>
              {opt.selected && <MiniCheckIcon />}
            </span>
            <span style={styles.builtTypeLabel}>{opt.label}</span>
          </div>
        ))}
      </div>
      <div style={styles.bentoDiffRow}>
        {['Easy', 'Medium', 'Hard'].map((d, i) => (
          <span key={d} style={{ ...styles.bentoDiffPill, ...(i === 2 ? styles.bentoDiffPillActive : {}) }}>{d}</span>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: tokens.paper, color: tokens.ink, fontFamily: tokens.bodyFont },

  eyebrow: {
    fontFamily: tokens.monoFont, fontSize: '0.72rem', fontWeight: '600', letterSpacing: '0.08em',
    color: tokens.accent, textTransform: 'uppercase', marginBottom: '0.9rem', display: 'inline-block',
  },

  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 3rem', backgroundColor: 'transparent',
  },
  brand: {
    color: tokens.ink, fontFamily: tokens.displayFont, fontSize: '1.2rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '-0.2px',
  },
  headerLinks: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  loginLink: { color: tokens.inkSoft, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'opacity 0.15s' },
  headerCta: {
    backgroundColor: tokens.accent, color: tokens.onAccent, textDecoration: 'none',
    padding: '0.55rem 1.15rem', borderRadius: '999px', fontSize: '0.88rem', fontWeight: '700',
    transition: 'background-color 0.15s',
  },

  hero: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4.5rem',
    padding: '5.5rem 3rem', maxWidth: '1240px', margin: '0 auto',
  },
  heroText: { flex: '1 1 440px', minWidth: 0, maxWidth: '500px' },
  headline: {
    fontFamily: tokens.displayFont, fontSize: '2.9rem', fontWeight: '700', lineHeight: '1.15',
    margin: '0 0 1.4rem', letterSpacing: '-1px', color: tokens.ink,
  },
  headlineDoodleWrap: { position: 'relative', display: 'inline-block' },
  circleDoodle: { position: 'absolute', left: '-14px', top: '-20px', width: 'calc(100% + 28px)', height: 'calc(100% + 34px)', pointerEvents: 'none' },
  subheadline: { color: tokens.inkSoft, fontSize: '1.05rem', lineHeight: '1.65', margin: '0 0 2rem' },
  heroCtas: { display: 'flex', flexWrap: 'wrap', gap: '1rem' },
  primaryBtn: {
    backgroundColor: tokens.accent, color: tokens.onAccent, textDecoration: 'none',
    padding: '0.85rem 1.7rem', borderRadius: '999px', fontWeight: '700', fontSize: '1rem',
    transition: 'background-color 0.15s',
  },
  ghostBtn: {
    color: tokens.ink, textDecoration: 'none', padding: '0.85rem 1.7rem', borderRadius: '999px',
    fontWeight: '600', fontSize: '1rem', border: `1.5px solid ${tokens.border}`, transition: 'border-color 0.15s',
  },

  heroDemo: { flex: '1 1 360px', minWidth: 0, maxWidth: '420px', position: 'relative' },
  demoStack: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' },
  demoCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '1.5rem',
    border: `1px solid ${tokens.border}`, boxShadow: '0 10px 28px rgba(51,65,85,0.08)',
  },
  demoCardAccent: { borderColor: tokens.ink },
  demoCardLabel: {
    display: 'block', fontFamily: tokens.monoFont, fontSize: '0.68rem', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.inkSoft, marginBottom: '0.7rem',
  },
  demoNoteText: { fontSize: '0.88rem', lineHeight: '1.6', color: tokens.ink, margin: 0 },
  demoArrowRow: { display: 'flex', justifyContent: 'center' },
  demoArrowDoodle: { width: '44px', height: '30px' },
  demoBadge: {
    display: 'inline-block', backgroundColor: tokens.accentSoft, color: tokens.accentText,
    fontSize: '0.68rem', fontWeight: '700', padding: '0.28rem 0.6rem', borderRadius: '999px', marginBottom: '0.8rem',
  },
  demoQuestion: { fontFamily: tokens.displayFont, fontSize: '0.98rem', fontWeight: '700', margin: '0 0 0.9rem', color: tokens.ink },
  demoOptions: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
  demoOption: { fontSize: '0.85rem', padding: '0.55rem 0.75rem', borderRadius: '10px', border: `1px solid ${tokens.border}`, color: tokens.inkSoft },
  demoOptionCorrect: { borderColor: tokens.accent, backgroundColor: tokens.accentSoft, color: tokens.ink, fontWeight: '600' },
  floatBadge: {
    position: 'absolute', top: '-18px', right: '-14px', backgroundColor: tokens.darkSurface, color: '#fff',
    borderRadius: '14px', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
    boxShadow: '0 10px 24px rgba(15,23,42,0.3)',
  },
  floatBadgeNum: { fontFamily: tokens.monoFont, fontSize: '1.1rem', fontWeight: '700', display: 'block', color: '#93C5FD' },
  floatBadgeLabel: { fontSize: '0.68rem', color: tokens.onInkMuted, display: 'block', whiteSpace: 'nowrap' },

  mechStrip: {
    display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap',
    padding: '1.5rem 2rem', backgroundColor: tokens.card, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}`,
  },
  mechPill: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: tokens.inkSoft },

  featureSection: { padding: '5.5rem 3rem', maxWidth: '1240px', margin: '0 auto' },
  featureRow: { display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' },
  featureListCol: { flex: '1 1 420px', minWidth: 0 },
  sectionTitle: { fontFamily: tokens.displayFont, fontSize: '1.9rem', fontWeight: '700', margin: '0 0 1.5rem', color: tokens.ink, lineHeight: '1.25' },
  sectionUnderline: { display: 'block', width: '140px', height: '14px', margin: '0.5rem auto 0' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  featureItem: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  featureIconWrap: {
    flexShrink: 0, width: '38px', height: '38px', borderRadius: '10px', backgroundColor: tokens.accentSoft,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  featureItemTitle: { fontSize: '1rem', fontWeight: '700', margin: '0 0 0.3rem', color: tokens.ink },
  featureItemBody: { fontSize: '0.9rem', color: tokens.inkSoft, lineHeight: '1.55', margin: 0 },

  mockDashCol: { flex: '1 1 380px', minWidth: 0, display: 'flex', justifyContent: 'center' },
  mockDashCard: {
    backgroundColor: tokens.card, borderRadius: '18px', border: `1px solid ${tokens.border}`,
    boxShadow: '0 16px 40px rgba(51,65,85,0.1)', width: '100%', maxWidth: '420px', overflow: 'hidden',
  },
  mockDashHeader: { display: 'flex', gap: '0.4rem', padding: '0.9rem 1.1rem', borderBottom: `1px solid ${tokens.border}` },
  mockDashDot: { width: '9px', height: '9px', borderRadius: '50%', backgroundColor: tokens.border },
  mockDashImg: { width: '100%', display: 'block' },
  mockDashLabel: { fontFamily: tokens.monoFont, fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.inkSoft, display: 'block', marginBottom: '0.9rem' },
  mockBarTrack: { flex: 1, height: '7px', backgroundColor: tokens.paper, borderRadius: '4px', overflow: 'hidden', minWidth: 0 },
  mockBarFill: { height: '100%', backgroundColor: tokens.accent, borderRadius: '4px' },

  bentoSection: { padding: '5.5rem 3rem', backgroundColor: tokens.card, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}` },
  bentoGrid: { display: 'flex', flexWrap: 'wrap', gap: '1.25rem', maxWidth: '1240px', margin: '2.5rem auto 0', justifyContent: 'center' },
  bentoCard: {
    flex: '1 1 320px', minWidth: 0, maxWidth: '380px', backgroundColor: tokens.paper, borderRadius: '16px',
    padding: '1.5rem', border: `1px solid ${tokens.border}`,
  },
  bentoLabel: { fontFamily: tokens.monoFont, fontSize: '0.68rem', fontWeight: '600', letterSpacing: '0.06em', color: tokens.inkSoft, display: 'block', marginBottom: '0.9rem' },
  bentoNote: { fontSize: '0.88rem', lineHeight: '1.6', color: tokens.ink, margin: 0, fontStyle: 'italic' },
  bentoTags: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  bentoTag: { backgroundColor: tokens.accentSoft, color: tokens.accentText, padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  bentoDiffRow: { display: 'flex', gap: '0.5rem', marginBottom: '0.9rem' },
  bentoDiffPill: { flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: '8px', border: `1.5px solid ${tokens.border}`, fontSize: '0.8rem', fontWeight: '700', color: tokens.inkSoft },
  bentoDiffPillActive: { borderColor: tokens.darkSurface, backgroundColor: tokens.darkSurface, color: '#fff' },
  bentoSmallNote: { fontSize: '0.82rem', color: tokens.inkSoft, margin: 0, lineHeight: '1.5' },
  bentoQuestion: { fontWeight: '700', fontSize: '0.92rem', margin: '0 0 0.7rem', color: tokens.ink },
  bentoMiniOption: { fontSize: '0.82rem', padding: '0.5rem 0.7rem', borderRadius: '8px', border: `1.5px solid ${tokens.accent}`, backgroundColor: tokens.accentSoft, color: tokens.ink, fontWeight: '600' },
  bentoMasteryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' },
  bentoMasteryChip: { fontSize: '0.85rem', fontWeight: '700', color: tokens.ink },

  builtSection: { padding: '5.5rem 3rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '5rem' },
  builtRow: { display: 'flex', gap: '3.5rem', alignItems: 'center', flexWrap: 'wrap' },
  builtVisual: { flex: '1 1 380px', minWidth: 0, display: 'flex', justifyContent: 'center' },
  builtText: { flex: '1 1 380px', minWidth: 0 },
  builtTitle: { fontFamily: tokens.displayFont, fontSize: '1.55rem', fontWeight: '700', margin: '0 0 0.9rem', color: tokens.ink, lineHeight: '1.3' },
  builtBody: { fontSize: '0.98rem', color: tokens.inkSoft, lineHeight: '1.65', margin: 0 },
  builtMockCard: {
    backgroundColor: tokens.card, borderRadius: '16px', padding: '1.75rem', border: `1px solid ${tokens.border}`,
    boxShadow: '0 12px 32px rgba(51,65,85,0.08)', width: '100%', maxWidth: '360px',
  },
  builtMockTitle: { fontWeight: '700', fontSize: '0.95rem', margin: '0 0 0.9rem', color: tokens.ink },
  builtReviewRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0', borderBottom: `1px solid ${tokens.paper}`, fontSize: '0.88rem', color: tokens.ink, fontWeight: '600' },
  builtReviewDue: { marginLeft: 'auto', fontSize: '0.72rem', color: tokens.accent, fontWeight: '700' },
  builtTypeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' },
  builtTypeOption: { display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1.5px solid ${tokens.border}`, borderRadius: '10px', padding: '0.6rem 0.65rem' },
  builtTypeOptionSelected: { borderColor: tokens.accent, backgroundColor: tokens.accentSoft },
  builtCheckbox: { width: '15px', height: '15px', borderRadius: '4px', border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  builtCheckboxChecked: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  builtTypeLabel: { fontSize: '0.78rem', fontWeight: '600', color: tokens.ink },

  statsCta: { backgroundColor: tokens.darkSurface, padding: '5.5rem 3rem', textAlign: 'center' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: '3.5rem', flexWrap: 'wrap', marginBottom: '3rem' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontFamily: tokens.displayFont, fontSize: '2.4rem', fontWeight: '800', color: '#93C5FD', lineHeight: 1 },
  statLabel: { fontSize: '0.8rem', color: tokens.onInkMuted, marginTop: '0.5rem' },
  ctaHeadline: { fontFamily: tokens.displayFont, fontSize: '1.8rem', fontWeight: '700', color: '#FFFFFF', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.3' },
  ctaBtn: {
    display: 'inline-block', backgroundColor: tokens.accent, color: tokens.onAccent, textDecoration: 'none',
    padding: '0.95rem 2rem', borderRadius: '999px', fontWeight: '700', fontSize: '1rem', transition: 'background-color 0.15s',
  },
};

export default Landing;
