import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const COLLAPSE_KEY = 'quizadapt.sidebarCollapsed';

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const AppShell = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
  const showSidebar = user && !isAuthPage;

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  const sidebarWidth = collapsed ? '68px' : '240px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{`
        .app-mobile-topbar { display: none; }
        .app-content { margin-left: ${showSidebar ? sidebarWidth : '0'}; transition: margin-left 0.2s ease; }
        @media (max-width: 768px) {
          .app-content { margin-left: 0 !important; padding-top: ${showSidebar ? '56px' : '0'} !important; }
          .app-mobile-topbar { display: flex !important; }
        }
      `}</style>

      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      )}

      {showSidebar && (
        <div className="app-mobile-topbar" style={styles.mobileTopbar}>
          <button
            style={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        </div>
      )}

      <div className="app-content" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  mobileTopbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '56px',
    alignItems: 'center',
    padding: '0 1rem',
    backgroundColor: '#0F172A',
    zIndex: 80,
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    padding: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
};

export default AppShell;
