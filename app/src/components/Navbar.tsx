import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onProfileClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onProfileClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-900">Social Network</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-slate-700">
              Welcome, {user?.username}
            </span>
            
            <button
              onClick={onProfileClick}
              className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              Profile
            </button>
            
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;