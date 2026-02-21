import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { colors, spacing, typography, border } from './tokens.js';

export interface CivTheme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  border: typeof border;
}

const defaultTheme: CivTheme = {
  colors,
  spacing,
  typography,
  border,
};

const ThemeContext = createContext<CivTheme>(defaultTheme);

export interface ThemeProviderProps {
  theme?: Partial<CivTheme>;
  children: ReactNode;
}

/**
 * CivUI Theme Provider.
 *
 * Wraps your app to provide design tokens to all CivUI components.
 * Pass a partial theme to override specific token values.
 */
export function CivThemeProvider({ theme, children }: ThemeProviderProps) {
  const merged = useMemo<CivTheme>(
    () => ({
      ...defaultTheme,
      ...theme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
}

/**
 * Access the current CivUI theme.
 */
export function useTheme(): CivTheme {
  return useContext(ThemeContext);
}

export { defaultTheme };
