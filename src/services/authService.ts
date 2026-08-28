// ============================================================
// src/services/authService.ts — Real Backend Auth Service
// ============================================================

import { apiRequest, setStoredToken, removeStoredToken, getStoredToken } from './api';
import type { UserProfile, UserRole } from '../types/property';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  lookingFor?: string;
  budget?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserProfile;
}

export const authService = {
  /**
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<UserProfile> {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      setStoredToken(data.token);
    }
    return data.user;
  },

  /**
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<UserProfile> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.token) {
      setStoredToken(res.token);
    }
    return res.user;
  },

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const data = await apiRequest<{ user: UserProfile }>('/auth/me');
      return data.user;
    } catch {
      removeStoredToken();
      return null;
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeStoredToken();
    }
  },

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiRequest<{ user: UserProfile; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.user;
  },

  isLoggedIn(): boolean {
    return !!getStoredToken();
  },
};
