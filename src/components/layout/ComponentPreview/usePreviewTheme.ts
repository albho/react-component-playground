import { useEffect, useState } from 'react';

export type ResolvedTheme = 'light' | 'dark';
export type ThemePreference = ResolvedTheme;

const THEME_STORAGE_KEY = 'component-preview-theme';

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isThemePreference(storedPreference)
    ? storedPreference
    : getSystemTheme();
};

export function usePreviewTheme() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    getStoredThemePreference,
  );
  const resolvedTheme = themePreference;

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [themePreference]);

  return {
    themePreference,
    resolvedTheme,
    setThemePreference,
  };
}
