import { createContext, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, isThemeName, themes, type Theme, type ThemeName } from '../../theme';

export const THEME_STORAGE_KEY = 'jungle.marketplace.theme';
export interface ThemeContextValue {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  theme: Theme;
  tokens: Theme['tokens'];
  semanticTokens: Theme['semanticTokens'];
}
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readThemePreference(): ThemeName {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function useStyleguide(): ThemeContextValue {
  const [themeName, setThemeName] = useState<ThemeName>(readThemePreference);
  const setTheme = useCallback((name: ThemeName) => {
    if (isThemeName(name)) setThemeName(name);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = themeName;
    document.documentElement.style.colorScheme = 'dark';
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch {
      // The current tab remains fully usable when storage is unavailable.
    }
  }, [themeName]);

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setThemeName(isThemeName(event.newValue) ? event.newValue : DEFAULT_THEME);
      }
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, []);

  return useMemo(() => {
    const theme = themes[themeName];
    return {
      themeName,
      setTheme,
      theme,
      tokens: theme.tokens,
      semanticTokens: theme.semanticTokens,
    };
  }, [themeName, setTheme]);
}
