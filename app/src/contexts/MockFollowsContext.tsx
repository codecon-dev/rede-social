import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const mockFollowsKey = 'mockFollows';

interface MockFollowsContextType {
  mockFollows: Set<number>;
  addMockFollow: (userId: number) => void;
  removeMockFollow: (userId: number) => void;
  isMockFollowing: (userId: number) => boolean;
  getMockFollowsCount: () => number;
  clearMockFollows: () => void;
}

const MockFollowsContext = createContext<MockFollowsContextType | undefined>(undefined);

export const useMockFollows = () => {
  const context = useContext(MockFollowsContext);
  if (context === undefined) {
    throw new Error('useMockFollows must be used within a MockFollowsProvider');
  }
  return context;
};

interface MockFollowsProviderProps {
  children: React.ReactNode;
}

export const MockFollowsProvider: React.FC<MockFollowsProviderProps> = ({ children }) => {
  const [mockFollows, setMockFollows] = useState<Set<number>>(new Set());

  const getMockFollows = useCallback((): Set<number> => {
    try {
      const stored = localStorage.getItem(mockFollowsKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  }, []);

  const setMockFollowsWithStorage = useCallback((follows: Set<number>) => {
    try {
      localStorage.setItem(mockFollowsKey, JSON.stringify(Array.from(follows)));
      setMockFollows(follows);
    } catch (error) {
      console.error('Error saving mock follows:', error);
    }
  }, []);

  const addMockFollow = useCallback((userId: number) => {
    const newFollows = new Set(mockFollows);
    newFollows.add(userId);
    setMockFollowsWithStorage(newFollows);
  }, [mockFollows, setMockFollowsWithStorage]);

  const removeMockFollow = useCallback((userId: number) => {
    const newFollows = new Set(mockFollows);
    newFollows.delete(userId);
    setMockFollowsWithStorage(newFollows);
  }, [mockFollows, setMockFollowsWithStorage]);

  const clearMockFollows = useCallback(() => {
    localStorage.removeItem(mockFollowsKey);
    setMockFollows(new Set());
  }, []);

  const isMockFollowing = useCallback((userId: number): boolean => {
    return mockFollows.has(userId);
  }, [mockFollows]);

  const getMockFollowsCount = useCallback((): number => {
    return mockFollows.size;
  }, [mockFollows]);

  useEffect(() => {
    const follows = getMockFollows();
    setMockFollows(follows);
  }, [getMockFollows]);

  const value = {
    mockFollows,
    addMockFollow,
    removeMockFollow,
    isMockFollowing,
    getMockFollowsCount,
    clearMockFollows
  };

  return (
    <MockFollowsContext.Provider value={value}>
      {children}
    </MockFollowsContext.Provider>
  );
}; 