import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { colors, spacing, typography, border } from './tokens.js';

export interface CivdsTheme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  border: typeof border;
}

const defaultTheme: CivdsTheme = {
  colors,
  spacing,
  typography,
  border,
};

const ThemeContext = createContext<CivdsTheme>(defaultTheme);

export interface ThemeProviderProps {
  theme?: Partial<CivdsTheme>;
  children: ReactNode;
}

/**
 * CivDS Theme Provider.
 *
 * Wraps your app to provide design tokens to all CivDS components.
 * Pass a partial theme to override specific token values.
 */
export function CivdsThemeProvider({ theme, children }: ThemeProviderProps) {
  const merged = useMemo<CivdsTheme>(
    () => ({
      ...defaultTheme,
      ...theme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
}

/**
 * Access the current CivDS theme.
 */
export function useTheme(): CivdsTheme {
  return useContext(ThemeContext);
}

export { defaultTheme };
