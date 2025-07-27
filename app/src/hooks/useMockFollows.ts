import { useState, useEffect } from 'react';

const mockFollowsKey = 'mockFollows';

export const useMockFollows = () => {
  const [mockFollows, setMockFollowsState] = useState<Set<number>>(new Set());

  const getMockFollows = (): Set<number> => {
    try {
      const stored = localStorage.getItem(mockFollowsKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const setMockFollows = (follows: Set<number>) => {
    try {
      localStorage.setItem(mockFollowsKey, JSON.stringify(Array.from(follows)));
      setMockFollowsState(follows);
    } catch (error) {
      console.error('Error saving mock follows:', error);
    }
  };

  const addMockFollow = (userId: number) => {
    const follows = getMockFollows();
    follows.add(userId);
    setMockFollows(follows);
  };

  const removeMockFollow = (userId: number) => {
    const follows = getMockFollows();
    follows.delete(userId);
    setMockFollows(follows);
  };

  const isMockFollowing = (userId: number): boolean => {
    return mockFollows.has(userId);
  };

  const getMockFollowsCount = (): number => {
    return mockFollows.size;
  };

  useEffect(() => {
    const follows = getMockFollows();
    setMockFollowsState(follows);
  }, []);

  return {
    mockFollows,
    addMockFollow,
    removeMockFollow,
    isMockFollowing,
    getMockFollowsCount,
    getMockFollows,
    setMockFollows
  };
}; 