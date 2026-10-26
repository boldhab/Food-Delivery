import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const THEME_STORAGE_KEY = 'theme';
export const VALID_THEMES = ['light', 'dark', 'system'];

export const ThemeContext = createContext(null);

/**
 * Read the current theme preference from localStorage.
 * Defaults to 'system' if not set or unrecognized.
 */
export const getStoredThemePreference = (storageKey = THEME_STORAGE_KEY) => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && VALID_THEMES.includes(stored)) {
      return stored;
    }
  } catch (e) {
    // localStorage may be disabled or restricted
  }
  return 'system';
};

/**
 * Determine the OS level preference.
 */
export const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
};

/**
 * Resolve the effective visual theme ('light' | 'dark') from preference.
 */
export const resolveEffectiveTheme = (preference) => {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference === 'dark' ? 'dark' : 'light';
};

/**
 * Apply the theme to documentElement, colorScheme, and body.
 */
export const applyThemeToDocument = (resolvedTheme, preference) => {
  if (typeof document === 'undefined') return;
  const isDark = resolvedTheme === 'dark';
  const root = document.documentElement;

  root.classList.toggle('dark', isDark);
  root.style.colorScheme = resolvedTheme;
  root.setAttribute('data-theme', resolvedTheme);
  if (preference) {
    root.setAttribute('data-theme-preference', preference);
  }
  if (document.body) {
    document.body.classList.toggle('dark', isDark);
  }
};

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}) => {
  const existingContext = useContext(ThemeContext);
  if (existingContext) {
    return <>{children}</>;
  }

  return (
    <ThemeRootProvider defaultTheme={defaultTheme} storageKey={storageKey}>
      {children}
    </ThemeRootProvider>
  );
};

const ThemeRootProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}) => {
  const [theme, setThemeState] = useState(() => {
    const initial = getStoredThemePreference(storageKey);
    return VALID_THEMES.includes(initial) ? initial : defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => resolveEffectiveTheme(theme));

  // Sync theme changes to DOM and localStorage
  const setTheme = useCallback(
    (newTheme) => {
      const targetTheme = VALID_THEMES.includes(newTheme) ? newTheme : 'system';
      const effective = resolveEffectiveTheme(targetTheme);

      setThemeState(targetTheme);
      setResolvedTheme(effective);
      applyThemeToDocument(effective, targetTheme);

      try {
        localStorage.setItem(storageKey, targetTheme);
      } catch (e) {
        // quiet fallback
      }
    },
    [storageKey]
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // Cycle through Light -> Dark -> System
  const cycleTheme = useCallback(() => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  }, [theme, setTheme]);

  // Apply on mount and when theme changes
  useEffect(() => {
    const effective = resolveEffectiveTheme(theme);
    setResolvedTheme(effective);
    applyThemeToDocument(effective, theme);
  }, [theme]);

  // Listen to OS system color scheme changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const currentPref = getStoredThemePreference(storageKey);
      if (currentPref === 'system') {
        const nextEffective = e.matches ? 'dark' : 'light';
        setResolvedTheme(nextEffective);
        applyThemeToDocument(nextEffective, 'system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [storageKey]);

  // Synchronize theme across multiple browser tabs / windows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e) => {
      if (e.key === storageKey && e.newValue && VALID_THEMES.includes(e.newValue)) {
        const newPref = e.newValue;
        const effective = resolveEffectiveTheme(newPref);
        setThemeState(newPref);
        setResolvedTheme(effective);
        applyThemeToDocument(effective, newPref);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === 'dark',
      setTheme,
      toggleTheme,
      cycleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, cycleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
