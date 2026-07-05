import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fillBar {
          from { width: 0%; }
        }
        .mastery-bar-fill {
          animation: fillBar 1.2s ease-out forwards;
        }
        .cta-primary:hover {
          background-color: #009BB8 !important;
        }
        .cta-ghost:hover {
          background-color: rgba(255,255,255,0.08) !important;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          AdaptIQ
        </div>
        <div style={styles.headerLinks}>
          <Link to="/login" style={styles.loginLink}>Log in</Link>
          <Link to="/register" style={styles.headerCta} className="cta-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <h1 style={styles.headline}>
            Learn what you<br />don't know yet.
          </h1>
          <p style={styles.subheadline}>
            AdaptIQ turns your own notes into quizzes that target your weak
            spots — not just whatever page you happened to study last.
          </p>
          <div style={styles.heroCtas}>
            <Link to="/register" style={styles.primaryBtn} className="cta-primary">
              Get Started →
            </Link>
            <Link to="/login" style={styles.ghostBtn} className="cta-ghost">
              Log in
            </Link>
          </div>
        </div>

        <div style={styles.masteryCard}>
          <p style={styles.masteryLabel}>Your topic mastery, live</p>
          {[
            { label: 'Weak', pct: 50, color: '#EF4444' },
            { label: 'Moderate', pct: 30, color: '#F59E0B' },
            { label: 'Strong', pct: 20, color: '#10B981' },
          ].map((row) => (
            <div key={row.label} style={styles.masteryRow}>
              <div style={styles.masteryRowHead}>
                <span style={styles.masteryRowLabel}>{row.label}</span>
                <span style={styles.masteryRowPct}>{row.pct}%</span>
              </div>
              <div style={styles.masteryTrack}>
                <div
                  className="mastery-bar-fill"
                  style={{
                    ...styles.masteryFill,
                    width: `${row.pct}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
            </div>
          ))}
          <p style={styles.masteryCaption}>
            Every quiz leans harder on what you're weakest at.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={styles.stepsGrid}>
          {[
            { n: '01', title: 'Upload your notes', body: 'PDFs or text — whatever you already have.' },
            { n: '02', title: 'We map the topics', body: 'AdaptIQ pulls out the concepts your notes actually cover.' },
            { n: '03', title: 'Take an adaptive quiz', body: 'Questions lean toward what you\u2019re shakiest on.' },
            { n: '04', title: 'Track your mastery', body: 'Watch weak topics shift to strong, over time.' },
          ].map((step) => (
            <div key={step.n} style={styles.stepCard} className="step-card">
              <span style={styles.stepNumber}>{step.n}</span>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>What's inside</h2>
        <div style={styles.featuresGrid}>
          {[
            { title: 'Adaptive Quizzes', body: 'Weighted toward your weak topics using an online mastery model.' },
            { title: 'Custom Quiz Generator', body: 'Pick MCQ, fill-in-the-blank, match, or long-answer — at your difficulty.' },
            { title: 'Spaced Repetition', body: 'A review queue that resurfaces topics right before you\u2019d forget them.' },
            { title: 'Performance Dashboard', body: 'See exactly where you stand, topic by topic.' },
          ].map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.brandIcon}>⚡</span> AdaptIQ
      </footer>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#fff',
    color: '#1A1A2E',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 3rem',
    backgroundColor: '#1A1A2E',
  },
  brand: {
    color: '#00B4D8',
    fontSize: '1.3rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    letterSpacing: '-0.5px',
  },
  brandIcon: {
    fontSize: '1.1rem',
  },
  headerLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  loginLink: {
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  headerCta: {
    backgroundColor: '#00B4D8',
    color: '#1A1A2E',
    textDecoration: 'none',
    padding: '0.55rem 1.1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    transition: 'background-color 0.15s',
  },
  hero: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3rem',
    padding: '5rem 3rem',
    backgroundColor: '#1A1A2E',
  },
  heroText: {
    maxWidth: '480px',
  },
  headline: {
    color: '#fff',
    fontSize: '2.75rem',
    fontWeight: '800',
    lineHeight: '1.15',
    margin: '0 0 1.25rem',
    letterSpacing: '-1px',
  },
  subheadline: {
    color: '#94A3B8',
    fontSize: '1.05rem',
    lineHeight: '1.6',
    margin: '0 0 2rem',
  },
  heroCtas: {
    display: 'flex',
    gap: '1rem',
  },
  primaryBtn: {
    backgroundColor: '#00B4D8',
    color: '#1A1A2E',
    textDecoration: 'none',
    padding: '0.85rem 1.6rem',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.15s',
  },
  ghostBtn: {
    color: '#E2E8F0',
    textDecoration: 'none',
    padding: '0.85rem 1.6rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '1rem',
    border: '1px solid #374151',
    transition: 'background-color 0.15s',
  },
  masteryCard: {
    backgroundColor: '#16213E',
    borderRadius: '16px',
    padding: '1.75rem',
    width: '340px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  },
  masteryLabel: {
    color: '#94A3B8',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 1.25rem',
  },
  masteryRow: {
    marginBottom: '1rem',
  },
  masteryRowHead: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.35rem',
  },
  masteryRowLabel: {
    color: '#E2E8F0',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  masteryRowPct: {
    color: '#94A3B8',
    fontSize: '0.85rem',
  },
  masteryTrack: {
    height: '8px',
    backgroundColor: '#0F1729',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    borderRadius: '4px',
  },
  masteryCaption: {
    color: '#64748B',
    fontSize: '0.78rem',
    margin: '1.25rem 0 0',
    lineHeight: '1.5',
  },
  howSection: {
    padding: '5rem 3rem',
    backgroundColor: '#F0F4F8',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    textAlign: 'center',
    margin: '0 0 2.5rem',
    color: '#1A1A2E',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '1.75rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  stepNumber: {
    color: '#00B4D8',
    fontSize: '0.85rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
  },
  stepTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    margin: '0.6rem 0 0.5rem',
    color: '#1A1A2E',
  },
  stepBody: {
    fontSize: '0.9rem',
    color: '#64748B',
    lineHeight: '1.5',
    margin: 0,
  },
  featuresSection: {
    padding: '5rem 3rem',
    backgroundColor: '#fff',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featureCard: {
    padding: '1.75rem',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
  },
  featureTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    margin: '0 0 0.5rem',
    color: '#1A1A2E',
  },
  featureBody: {
    fontSize: '0.9rem',
    color: '#64748B',
    lineHeight: '1.5',
    margin: 0,
  },
  footer: {
    padding: '2rem 3rem',
    backgroundColor: '#1A1A2E',
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.4rem',
  },
};

export default Landing;