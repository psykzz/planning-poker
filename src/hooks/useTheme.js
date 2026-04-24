import React from 'react';

const STORAGE_KEY = 'prefers-dark-mode';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    try {
      return JSON.parse(stored) ? 'dark' : 'light';
    } catch {
      // fall through to media query
    }
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const useTheme = () => {
  const [themeMode, setThemeMode] = React.useState(getInitialTheme);

  React.useEffect(() => {
    const prefersDark = themeMode === 'dark';
    document.documentElement.setAttribute(
      'data-theme',
      prefersDark ? 'dark' : 'light',
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefersDark));
  }, [themeMode]);

  return [themeMode, setThemeMode];
};
