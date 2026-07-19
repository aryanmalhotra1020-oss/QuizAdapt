import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tokens = {
  primary: '#2563EB',
  darkSurface: '#0F172A',
  darkSurfaceAlt: '#16213E',
  onDarkMuted: '#F1F5F9',
  onDarkFaint: 'rgba(255,255,255,0.62)',
  border: '#374151',
  warning: '#F59E0B',
  headingFont: "'Space Grotesk', 'Segoe UI', sans-serif",
  bodyFont: "'DM Sans', 'Segoe UI', sans-serif",
};

const LogoMark = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill={tokens.primary} />
    <rect x="5" y="13" width="3.2" height="6" rx="1" fill="#FFFFFF" />
    <rect x="10.4" y="9" width="3.2" height="10" rx="1" fill="#FFFFFF" />
    <rect x="15.8" y="5" width="3.2" height="14" rx="1" fill="#93C5FD" />
  </svg>
);

const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tokens.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HomeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronIcon = ({ direction = 'left' }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ transform: direction === 'right' ? 'rotate(180deg)' : 'none' }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const Sidebar = ({ isOpen = false, onClose = () => {}, collapsed = false, onToggleCollapse = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/subjects/')
      .then((res) => setSubjects(res.data))
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/dashboard', Icon: HomeIcon },
    { label: 'Create Subject', path: '/subjects/new', Icon: PlusCircleIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .sidebar-nav-link:hover { background-color: ${tokens.darkSurfaceAlt}; }
        .sidebar-user-link:hover { background-color: ${tokens.darkSurfaceAlt}; }
        .sidebar-toggle-btn:hover, .sidebar-close-btn:hover { background-color: ${tokens.darkSurfaceAlt}; }
        .sidebar-close-btn { display: none; }
        .sidebar-backdrop { display: none; }
        button, a { cursor: pointer; }
        a:focus-visible, button:focus-visible { outline: 2px solid ${tokens.primary}; outline-offset: 2px; }

        @media (max-width: 768px) {
          .app-sidebar {
            width: 240px !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 2px 0 24px rgba(0,0,0,0.4);
          }
          .app-sidebar.is-open {
            transform: translateX(0);
          }
          .sidebar-close-btn {
            display: inline-flex !important;
          }
          .sidebar-toggle-btn {
            display: none !important;
          }
          .sidebar-backdrop.is-open {
            display: block !important;
          }
        }
      `}</style>

      <div
        className={`sidebar-backdrop${isOpen ? ' is-open' : ''}`}
        style={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav
        className={`app-sidebar${isOpen ? ' is-open' : ''}`}
        style={{ ...styles.sidebar, width: collapsed ? '68px' : '240px' }}
        aria-label="Main navigation"
      >
        <div style={{ ...styles.topRow, ...(collapsed ? styles.topRowCollapsed : {}) }}>
          <Link to="/dashboard" style={styles.brand} title="QuizAdapt">
            <LogoMark />
            {!collapsed && 'QuizAdapt'}
          </Link>
          <button
            className="sidebar-close-btn"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
          <button
            className="sidebar-toggle-btn"
            style={styles.toggleBtn}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronIcon direction={collapsed ? 'right' : 'left'} />
          </button>
        </div>

        <div style={styles.navSection}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="sidebar-nav-link"
              title={collapsed ? item.label : undefined}
              style={{
                ...styles.navLink,
                ...(collapsed ? styles.navLinkCollapsed : {}),
                ...(isActive(item.path) ? styles.navLinkActive : {}),
              }}
            >
              <item.Icon />
              {!collapsed && item.label}
            </Link>
          ))}

          {!collapsed && (
            <>
              <div style={styles.subjectsHeading}>Subjects</div>
              {subjects.map((s) => {
                const isPending = s.status === 'pending_diagnostic';
                const linkPath = isPending ? `/diagnostic/${s.id}` : `/subject/${s.id}`;
                return (
                  <Link
                    key={s.id}
                    to={linkPath}
                    className="sidebar-nav-link"
                    style={{
                      ...styles.subjectLink,
                      ...(isActive(linkPath) ? styles.navLinkActive : {}),
                    }}
                    title={isPending ? 'Pending Diagnostic Quiz' : undefined}
                  >
                    <span style={styles.subjectName}>{s.name}</span>
                    {isPending && (
                      <span style={styles.pendingIcon} aria-label="Pending diagnostic quiz">
                        <AlertIcon />
                      </span>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </div>

        <div style={styles.bottomSection}>
          <Link
            to="/profile"
            className="sidebar-user-link"
            style={{ ...styles.userInfo, ...(collapsed ? styles.userInfoCollapsed : {}) }}
            title={collapsed ? `${user.name} — Profile` : undefined}
          >
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && <span style={styles.userName}>{user.name}</span>}
          </Link>
          <button
            onClick={handleLogout}
            style={{ ...styles.logoutBtn, ...(collapsed ? styles.logoutBtnCollapsed : {}) }}
            title={collapsed ? 'Sign out' : undefined}
            aria-label="Sign out"
          >
            <LogoutIcon />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </nav>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.5)',
    zIndex: 90,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    backgroundColor: tokens.darkSurface,
    color: '#fff',
    fontFamily: tokens.bodyFont,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
    zIndex: 100,
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    transition: 'width 0.2s ease',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2.5rem',
    padding: '0 0.5rem',
  },
  topRowCollapsed: {
    flexDirection: 'column',
    gap: '1rem',
    padding: 0,
  },
  brand: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontFamily: tokens.headingFont,
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: tokens.onDarkMuted,
    padding: '0.35rem',
    borderRadius: '6px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtn: {
    background: 'none',
    border: `1px solid ${tokens.border}`,
    color: tokens.onDarkMuted,
    padding: '0.35rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },
  navLink: {
    color: tokens.onDarkMuted,
    textDecoration: 'none',
    fontSize: '0.95rem',
    padding: '0.65rem 0.75rem',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    whiteSpace: 'nowrap',
  },
  navLinkCollapsed: {
    justifyContent: 'center',
    padding: '0.65rem',
  },
  navLinkActive: {
    backgroundColor: tokens.darkSurfaceAlt,
    color: tokens.primary,
    fontWeight: '600',
  },
  subjectsHeading: {
    color: tokens.onDarkFaint,
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '1rem 0.75rem 0.4rem',
  },
  subjectLink: {
    color: tokens.onDarkMuted,
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pendingIcon: {
    marginLeft: '0.5rem',
    flexShrink: 0,
    display: 'inline-flex',
  },
  bottomSection: {
    borderTop: `1px solid ${tokens.border}`,
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.4rem 0.5rem',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'background-color 0.15s',
  },
  userInfoCollapsed: {
    justifyContent: 'center',
    padding: '0.4rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: tokens.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userName: {
    color: tokens.onDarkMuted,
    fontSize: '0.9rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.border}`,
    color: tokens.onDarkMuted,
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  logoutBtnCollapsed: {
    padding: '0.5rem',
  },
};

export default Sidebar;
