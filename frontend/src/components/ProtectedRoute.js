import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../theme';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: tokens.paper, color: tokens.inkSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: tokens.bodyFont, fontSize: '0.95rem',
      }}>
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;