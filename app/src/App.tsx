import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import PanelinhaPage from './pages/PanelinhaPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/index.scss';
import Navbar from './components/Navbar';

const AppContent: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <Navbar user={user} logout={logout} />
      <div className='wrapper'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:username" element={<UserPage />} />
          <Route path="/panelinha" element={<PanelinhaPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
