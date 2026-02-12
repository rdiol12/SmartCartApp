import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

const lightColors = {
  primary: '#4F46E5',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  bg: '#F3F4F6',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
};

const darkColors = {
  primary: '#818CF8',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  bg: '#111827',
  surface: '#1F2937',
  border: '#374151',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('auto'); // 'light', 'dark', 'auto'
  const [colors, setColors] = useState(systemScheme === 'dark' ? darkColors : lightColors);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    updateColors();
  }, [theme, systemScheme]);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved) setTheme(saved);
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  };

  const updateColors = () => {
    if (theme === 'auto') {
      setColors(systemScheme === 'dark' ? darkColors : lightColors);
    } else {
      setColors(theme === 'dark' ? darkColors : lightColors);
    }
  };

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const isDark = theme === 'auto' 
    ? systemScheme === 'dark' 
    : theme === 'dark';

  return (
    <ThemeContext.Provider value={{ colors, theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
