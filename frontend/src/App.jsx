import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import MapPage from './pages/MapPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route — requires authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin-only route
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace state={{ error: 'Administrator access required.' }} />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-space-md">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-high border-t-secondary animate-spin mx-auto"></div>
        <p className="font-body-md text-body-md text-on-surface-variant">Loading CivicPulse…</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/map" element={<MapPage />} />

      <Route path="/submit" element={
        <ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>
      } />
      <Route path="/complaints" element={
        <ProtectedRoute><MyComplaintsPage /></ProtectedRoute>
      } />
      <Route path="/complaints/:id" element={
        <ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>
      } />
      {/* Legacy route alias from approved architecture */}
      <Route path="/analysis/:id" element={
        <ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute><AdminDashboardPage /></AdminRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
