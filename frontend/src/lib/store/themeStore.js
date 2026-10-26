import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('dr360_theme') || 'dark',

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dr360_theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
      }
      return { theme: nextTheme };
    });
  },

  initTheme: () => {
    const saved = localStorage.getItem('dr360_theme') || 'dark';
    if (saved === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    set({ theme: saved });
  },
}));
