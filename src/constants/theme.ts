import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const CustomColors = {
  blue: {
    primary: '#0D5C75',
    primaryContainer: '#D0E8F2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#001E2A',
  },
  green: {
    success: '#2E7D32',
    successContainer: '#C8E6C9',
    onSuccess: '#FFFFFF',
    onSuccessContainer: '#1B5E20',
  },
  orange: {
    warning: '#EF6C00',
    warningContainer: '#FFE0B2',
    onWarning: '#FFFFFF',
    onWarningContainer: '#E65100',
  },
  red: {
    error: '#C62828',
    errorContainer: '#FFCDD2',
    onError: '#FFFFFF',
    onErrorContainer: '#B71C1C',
  }
};

// Light Theme - Blue & White & Soft Green
export const LightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: CustomColors.blue.primary,
    primaryContainer: CustomColors.blue.primaryContainer,
    onPrimary: CustomColors.blue.onPrimary,
    onPrimaryContainer: CustomColors.blue.onPrimaryContainer,
    secondary: CustomColors.green.success,
    secondaryContainer: CustomColors.green.successContainer,
    onSecondary: CustomColors.green.onSuccess,
    onSecondaryContainer: CustomColors.green.onSuccessContainer,
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#E2E8F0',
    error: CustomColors.red.error,
    errorContainer: CustomColors.red.errorContainer,
    onError: CustomColors.red.onError,
    onErrorContainer: CustomColors.red.onErrorContainer,
  },
};

// Dark Theme - Slate-Blue and dark slate backgrounds
export const DarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5AC8FA',
    primaryContainer: '#004C68',
    onPrimary: '#00354B',
    onPrimaryContainer: '#BCE8FF',
    secondary: '#81C784',
    secondaryContainer: '#1B5E20',
    onSecondary: '#003300',
    onSecondaryContainer: '#C8E6C9',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    error: '#FF8A80',
    errorContainer: '#C62828',
    onError: '#B71C1C',
    onErrorContainer: '#FFCDD2',
  },
};

// High Contrast Theme - High contrast black & yellow for low-vision users
export const HighContrastTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFFF00', // Pure Yellow
    primaryContainer: '#000000',
    onPrimary: '#000000',
    onPrimaryContainer: '#FFFF00',
    secondary: '#00FF00', // Neon Green
    secondaryContainer: '#000000',
    onSecondary: '#000000',
    onSecondaryContainer: '#00FF00',
    background: '#000000',
    surface: '#000000',
    surfaceVariant: '#222222',
    outline: '#FFFF00',
    error: '#FF3333',
    errorContainer: '#000000',
    onError: '#FFFFFF',
    onErrorContainer: '#FF3333',
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Fonts = {
  ...Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: 'var(--font-display)',
      serif: 'var(--font-serif)',
      rounded: 'var(--font-rounded)',
      mono: 'var(--font-mono)',
    },
  }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
};

export const MaxContentWidth = 800;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
