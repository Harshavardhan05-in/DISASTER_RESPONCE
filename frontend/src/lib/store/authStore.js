import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('dr360_user') || 'null'),
  accessToken: localStorage.getItem('dr360_access_token') || null,
  refreshToken: localStorage.getItem('dr360_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('dr360_access_token'),

  setAuth: (tokens, user) => {
    localStorage.setItem('dr360_access_token', tokens.access_token);
    localStorage.setItem('dr360_refresh_token', tokens.refresh_token);
    if (user) {
      localStorage.setItem('dr360_user', JSON.stringify(user));
    }
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: user || null,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    localStorage.setItem('dr360_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('dr360_access_token');
    localStorage.removeItem('dr360_refresh_token');
    localStorage.removeItem('dr360_user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
