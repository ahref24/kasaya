export const theme = {
  colors: {
    primary: '#10b981', // Green
    primaryDark: '#059669', // Dark green
    background: '#f8fafc', // Very light neutral
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    income: '#10b981',
    expense: '#ef4444',
    savings: '#3b82f6',
    warning: '#f59e0b',
    white: '#ffffff',
    danger: '#ef4444',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  }
};
