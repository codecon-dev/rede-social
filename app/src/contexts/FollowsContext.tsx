import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/api';

interface FollowsContextType {
  dbFollowsCount: number;
  refreshDbFollowsCount: () => Promise<void>;
  isLoading: boolean;
}

const FollowsContext = createContext<FollowsContextType | undefined>(undefined);

export const useFollows = () => {
  const context = useContext(FollowsContext);
  if (context === undefined) {
    throw new Error('useFollows must be used within a FollowsProvider');
  }
  return context;
};

interface FollowsProviderProps {
  children: ReactNode;
}

export const FollowsProvider: React.FC<FollowsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [dbFollowsCount, setDbFollowsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadDbFollowsCount = async () => {
    if (!user) {
      setDbFollowsCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.getPanelinhaMembersCount();
      setDbFollowsCount(response.count);
    } catch (error) {
      console.error('Error loading DB follows count:', error);
      setDbFollowsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDbFollowsCount = async () => {
    await loadDbFollowsCount();
  };

  useEffect(() => {
    loadDbFollowsCount();
  }, [user]);

  const value = {
    dbFollowsCount,
    refreshDbFollowsCount,
    isLoading
  };

  return (
    <FollowsContext.Provider value={value}>
      {children}
    </FollowsContext.Provider>
  );
}; 