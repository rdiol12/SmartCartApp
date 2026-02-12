import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyTheme } from '../theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('auto'); // 'light', 'dark', 'auto'
  const [themeKey, setThemeKey] = useState(0); // Forces full re-render on theme change

  const isDark = theme === 'auto'
    ? systemScheme === 'dark'
    : theme === 'dark';

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    applyTheme(isDark);
    setThemeKey(k => k + 1);
  }, [isDark]);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved) setTheme(saved);
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  };

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, themeKey }}>
      {children}
    </ThemeContext.Provider>
  );
};
