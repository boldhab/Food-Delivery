import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'theme';

const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getPreferredTheme);

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === 'dark',
            setTheme,
            toggleTheme,
        }),
        [theme, toggleTheme]
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
