/**
 * CivUI React Native token values.
 *
 * Inline token definitions matching @civui/tokens react-native output.
 * Numeric values for use with React Native StyleSheet.
 */

export const colors = {
  primary: {
    lightest: '#d9e8f6',
    lighter: '#73b3e7',
    light: '#2378c3',
    DEFAULT: '#005ea2',
    vivid: '#0050d8',
    dark: '#1a4480',
    darker: '#162e51',
  },
  error: {
    lighter: '#f4e3db',
    light: '#d63e04',
    DEFAULT: '#b50909',
    dark: '#8b0a03',
  },
  warning: {
    lighter: '#faf3d1',
    light: '#fee685',
    DEFAULT: '#e5a000',
    dark: '#936f38',
  },
  success: {
    lighter: '#ecf3ec',
    light: '#70e17b',
    DEFAULT: '#00a91c',
    dark: '#4d8055',
  },
  info: {
    lighter: '#e7f6f8',
    light: '#99deea',
    DEFAULT: '#00bde3',
    dark: '#2e6276',
  },
  base: {
    lightest: '#f0f0f0',
    lighter: '#dfe1e2',
    light: '#a9aeb1',
    DEFAULT: '#71767a',
    dark: '#565c65',
    darker: '#3d4551',
    darkest: '#1b1b1b',
  },
  white: '#ffffff',
  black: '#000000',
} as const;

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const typography = {
  fontFamily: {
    sans: 'Public Sans',
    mono: 'Roboto Mono',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

export const border = {
  radius: {
    none: 0,
    sm: 2,
    DEFAULT: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },
  width: {
    0: 0,
    1: 1,
    2: 2,
    4: 4,
  },
} as const;
