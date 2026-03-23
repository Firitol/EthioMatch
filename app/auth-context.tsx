'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Database } from '@/lib/db';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: User) => Promise<void>;
  createUser: (user: User) => Promise<void>;
  refreshUser: () => Promise<void>;
  useToken: () => Promise<boolean>;
  canSendMessage: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with demo data from localStorage for now, but load from API
    Database.initializeDemoData();
    const user = Database.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`);
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(async (user: User) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        const updated = await response.json();
        setCurrentUser(updated);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, []);

  const createUser = useCallback(async (user: User) => {
    try {
      // For now, create in localStorage as backup
      const users = Database.getUsers();
      users.push(user);
      Database.saveUsers(users);
      Database.setCurrentUser(user);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (currentUser) {
      try {
        const response = await fetch(`/api/users?id=${currentUser.id}`);
        if (response.ok) {
          const updated = await response.json();
          setCurrentUser(updated);
          Database.setCurrentUser(updated);
        } else {
          // Fallback: load from local database
          const users = Database.getUsers();
          const user = users.find(u => u.id === currentUser.id);
          if (user) {
            setCurrentUser(user);
            Database.setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('[v0] Failed to refresh user:', error);
        // Fallback: load from local database
        const users = Database.getUsers();
        const user = users.find(u => u.id === currentUser.id);
        if (user) {
          setCurrentUser(user);
          Database.setCurrentUser(user);
        }
      }
    }
  }, [currentUser]);

  const useToken = useCallback(async () => {
    if (!currentUser) return false;
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          tokens: currentUser.tokens - 1,
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setCurrentUser(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to use token:', error);
      return false;
    }
  }, [currentUser]);

  const canSendMessage = useCallback(() => {
    if (!currentUser) return false;
    return currentUser.isPremium || currentUser.tokens > 0;
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login, 
      logout, 
      updateProfile, 
      createUser,
      refreshUser,
      useToken,
      canSendMessage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
