import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RiskRegister from './pages/RiskRegister';
import RiskForm from './pages/RiskForm';
import RiskDetail from './pages/RiskDetail';
import Analytics from './pages/Analytics';                   // ← replaces RiskGuide
import NotificationsHistory from './pages/NotificationsHistory'; // ← replaces UserManagement
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '40px' }}>🛡️</div>
      <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading RiskGuard...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#f8fafc' }}>
      {children}
    </div>
  </>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={
        <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
      } />
      <Route path="/risks" element={
        <PrivateRoute><AppLayout><RiskRegister /></AppLayout></PrivateRoute>
      } />
      <Route path="/risks/new" element={
        <PrivateRoute><AppLayout><RiskForm /></AppLayout></PrivateRoute>
      } />
      <Route path="/risks/:id" element={
        <PrivateRoute><AppLayout><RiskDetail /></AppLayout></PrivateRoute>
      } />
      <Route path="/risks/:id/edit" element={
        <PrivateRoute><AppLayout><RiskForm /></AppLayout></PrivateRoute>
      } />

      {/* New pages */}
      <Route path="/analytics" element={
        <PrivateRoute><AppLayout><Analytics /></AppLayout></PrivateRoute>
      } />
      <Route path="/notifications" element={
        <PrivateRoute><AppLayout><NotificationsHistory /></AppLayout></PrivateRoute>
      } />

      {/* Old routes redirected so no broken links */}
      <Route path="/guide" element={<Navigate to="/analytics" />} />
      <Route path="/users" element={<Navigate to="/notifications" />} />

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: '13px', borderRadius: '10px' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;