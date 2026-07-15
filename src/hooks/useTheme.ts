import { useEffect, useState } from 'react';
import { getThemePreference, setThemePreference } from '../services/localStorageService';

export const useTheme = () => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('dark');

  // Load initial theme on mount
  useEffect(() => {
    const activeTheme = getThemePreference();
    setThemeState(activeTheme);
    applyTheme(activeTheme);
  }, []);

  const applyTheme = (targetTheme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return;

    let themeToApply = targetTheme;
    if (targetTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', themeToApply);
    
    // Support standard CSS class toggles if libraries look for .dark
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    setThemePreference(nextTheme);
    applyTheme(nextTheme);
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
};
