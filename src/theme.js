export const lightColors = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  gradient1: '#6366f1',
  gradient2: '#ec4899',
};

export const darkColors = {
  primary: '#818cf8',
  primaryLight: '#a5b4fc',
  primaryDark: '#6366f1',
  success: '#34d399',
  danger: '#f87171',
  warning: '#fbbf24',
  bg: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
  gradient1: '#818cf8',
  gradient2: '#f472b6',
};

// Mutable colors object — ThemeContext updates this on theme change
export const colors = { ...lightColors };

export function applyTheme(isDark) {
  const source = isDark ? darkColors : lightColors;
  Object.assign(colors, source);
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const fonts = {
  regular: { fontSize: 14, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '600', color: colors.text },
};
