'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Database } from '@/lib/db';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  updateProfile: (user: User) => void;
  createUser: (user: User) => void;
  refreshUser: () => void;
  useToken: () => boolean;
  canSendMessage: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Database.initializeDemoData();
    const user = Database.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const login = useCallback((userId: string) => {
    const users = Database.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      Database.setCurrentUser(user);
      setCurrentUser(user);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    Database.setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((user: User) => {
    const users = Database.getUsers();
    const updated = users.map((u) => (u.id === user.id ? user : u));
    Database.saveUsers(updated);
    Database.setCurrentUser(user);
    setCurrentUser(user);
  }, []);

  const createUser = useCallback((user: User) => {
    const users = Database.getUsers();
    users.push(user);
    Database.saveUsers(users);
    Database.setCurrentUser(user);
    setCurrentUser(user);
  }, []);

  const refreshUser = useCallback(() => {
    if (currentUser) {
      const users = Database.getUsers();
      const updated = users.find((u) => u.id === currentUser.id);
      if (updated) {
        setCurrentUser(updated);
      }
    }
  }, [currentUser]);

  const useToken = useCallback(() => {
    if (!currentUser) return false;
    const success = Database.useToken(currentUser.id);
    if (success) {
      refreshUser();
    }
    return success;
  }, [currentUser, refreshUser]);

  const canSendMessage = useCallback(() => {
    if (!currentUser) return false;
    return Database.canSendMessage(currentUser.id);
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
