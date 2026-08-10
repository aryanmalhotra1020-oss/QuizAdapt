import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subject from './pages/Subject';
import CreateSubject from './pages/CreateSubject';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import DiagnosticQuiz from './pages/DiagnosticQuiz';
import Performance from './pages/Performance';
import ReviewQueue from './pages/ReviewQueue';
import Landing from './pages/Landing';
import QuizHistoryDetail from './pages/QuizHistoryDetail';
import SamplePaperReady from './pages/SamplePaperReady';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
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
            <Route path="/quiz-history/:quizId" element={
              <ProtectedRoute>
                <QuizHistoryDetail />
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
            <Route path="/sample-paper/:quizId" element={
              <ProtectedRoute>
                <SamplePaperReady />
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