export const tokens = {
  ink: '#334155',
  inkSoft: '#64748B',
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentSoft: '#DBEAFE',
  accentText: '#1D4ED8',
  onAccent: '#FFFFFF',
  paper: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  darkSurface: '#0F172A',
  darkSurfaceAlt: '#1E293B',
  onInkMuted: '#CBD5E1',
  onInkBorder: 'rgba(255,255,255,0.14)',
  danger: '#EF4444',
  dangerText: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',
  success: '#10B981',
  successText: '#047857',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning: '#F59E0B',
  warningText: '#B45309',
  warningSoft: '#FEF3C7',
  good: '#10B981',
  moderate: '#F59E0B',
  critical: '#EF4444',
  displayFont: "'Bricolage Grotesque', 'Segoe UI', sans-serif",
  bodyFont: "'Karla', 'Segoe UI', sans-serif",
  monoFont: "'IBM Plex Mono', 'Courier New', monospace",
};

export const fontImport =
  "@import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@500;600&display=swap');";

export const LogoMark = ({ size = 22, dark = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill={tokens.accent} />
    <rect x="5" y="13" width="3.2" height="6" rx="1" fill="#FFFFFF" />
    <rect x="10.4" y="9" width="3.2" height="10" rx="1" fill="#FFFFFF" />
    <rect x="15.8" y="5" width="3.2" height="14" rx="1" fill="#93C5FD" />
  </svg>
);
