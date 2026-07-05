import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const AppShell = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
  const showSidebar = user && !isAuthPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showSidebar && <Sidebar />}
      <div style={{ flex: 1, marginLeft: showSidebar ? '240px' : '0' }}>
        {children}
      </div>
    </div>
  );
};

export default AppShell;