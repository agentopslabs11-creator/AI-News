import { apiClient } from './api';
import { AdminUser } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  csrf_token: string;
  admin: AdminUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', payload);
    if (res.data.access_token) {
      localStorage.setItem('risenshine_token', res.data.access_token);
      localStorage.setItem('risenshine_admin', JSON.stringify(res.data.admin));
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('risenshine_token');
      localStorage.removeItem('risenshine_admin');
    }
  },

  async getMe(): Promise<AdminUser> {
    const res = await apiClient.get<AdminUser>('/auth/me');
    localStorage.setItem('risenshine_admin', JSON.stringify(res.data));
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  getStoredAdmin(): AdminUser | null {
    const data = localStorage.getItem('risenshine_admin');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('risenshine_token');
  }
};
