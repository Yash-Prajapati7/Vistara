import React, { createContext, useContext, useEffect, useState } from 'react';
import { UI_STRINGS } from '../constants/uiStrings';

export type ThemeMode = typeof UI_STRINGS.THEME_LIGHT | typeof UI_STRINGS.THEME_DARK;

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === UI_STRINGS.TYPEOF_UNDEFINED) return UI_STRINGS.THEME_LIGHT;
    const saved = localStorage.getItem(UI_STRINGS.THEME_STORAGE_KEY);
    if (saved === UI_STRINGS.THEME_DARK || saved === UI_STRINGS.THEME_LIGHT) {
      return saved;
    }
    // Check system preference
    return window.matchMedia && window.matchMedia(UI_STRINGS.MEDIA_QUERY_DARK).matches
      ? UI_STRINGS.THEME_DARK
      : UI_STRINGS.THEME_LIGHT;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === UI_STRINGS.THEME_DARK) {
      root.classList.add(UI_STRINGS.DARK_CLASS);
    } else {
      root.classList.remove(UI_STRINGS.DARK_CLASS);
    }
    localStorage.setItem(UI_STRINGS.THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) =>
      prev === UI_STRINGS.THEME_DARK ? UI_STRINGS.THEME_LIGHT : UI_STRINGS.THEME_DARK
    );
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === UI_STRINGS.THEME_DARK,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(UI_STRINGS.THEME_CONTEXT_ERROR);
  }
  return context;
};
