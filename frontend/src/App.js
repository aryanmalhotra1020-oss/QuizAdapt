import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subject from './pages/Subject';
import Navbar from './components/Navbar';
import Quiz from './pages/Quiz';
import DiagnosticQuiz from './pages/DiagnosticQuiz';
import Performance from './pages/Performance';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;