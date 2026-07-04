import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subject from './pages/Subject';
import Subjects from './pages/Subjects';
import CreateSubject from './pages/CreateSubject';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import DiagnosticQuiz from './pages/DiagnosticQuiz';
import Performance from './pages/Performance';
import ReviewQueue from './pages/ReviewQueue';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/subjects" element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            } />
            <Route path="/subjects/new" element={
              <ProtectedRoute>
                <CreateSubject />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/subject/:id" element={
              <ProtectedRoute>
                <Subject />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:quizId" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />
            <Route path="/diagnostic/:subjectId" element={
              <ProtectedRoute>
                <DiagnosticQuiz />
              </ProtectedRoute>
            } />
            <Route path="/performance/:subjectId" element={
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            } />
            <Route path="/review/:subjectId" element={
              <ProtectedRoute>
                <ReviewQueue />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AppShell>
      </Router>
    </AuthProvider>
  );
}

export default App;