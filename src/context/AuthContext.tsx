// ============================================================
// src/context/AuthContext.tsx — Authentication State Context
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type LoginCredentials, type RegisterData } from '../services/authService';
import { getStoredToken } from '../services/api';
import type { UserProfile, UserRole } from '../types/property';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  register: (data: RegisterData) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(getStoredToken());

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    setToken(currentToken);

    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials): Promise<UserProfile> => {
    const loggedUser = await authService.login(credentials);
    setUser(loggedUser);
    setToken(getStoredToken());
    return loggedUser;
  };

  const register = async (data: RegisterData): Promise<UserProfile> => {
    const registeredUser = await authService.register(data);
    setUser(registeredUser);
    setToken(getStoredToken());
    return registeredUser;
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
