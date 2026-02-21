import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  prefix: 'civ-',
  content: ['./packages/*/src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        primary: {
          lightest: 'var(--civ-color-primary-lightest)',
          lighter: 'var(--civ-color-primary-lighter)',
          light: 'var(--civ-color-primary-light)',
          DEFAULT: 'var(--civ-color-primary-DEFAULT)',
          vivid: 'var(--civ-color-primary-vivid)',
          dark: 'var(--civ-color-primary-dark)',
          darker: 'var(--civ-color-primary-darker)',
        },
        error: {
          lighter: 'var(--civ-color-error-lighter)',
          light: 'var(--civ-color-error-light)',
          DEFAULT: 'var(--civ-color-error-DEFAULT)',
          dark: 'var(--civ-color-error-dark)',
        },
        warning: {
          lighter: 'var(--civ-color-warning-lighter)',
          light: 'var(--civ-color-warning-light)',
          DEFAULT: 'var(--civ-color-warning-DEFAULT)',
          dark: 'var(--civ-color-warning-dark)',
        },
        success: {
          lighter: 'var(--civ-color-success-lighter)',
          light: 'var(--civ-color-success-light)',
          DEFAULT: 'var(--civ-color-success-DEFAULT)',
          dark: 'var(--civ-color-success-dark)',
        },
        info: {
          lighter: 'var(--civ-color-info-lighter)',
          light: 'var(--civ-color-info-light)',
          DEFAULT: 'var(--civ-color-info-DEFAULT)',
          dark: 'var(--civ-color-info-dark)',
        },
        base: {
          lightest: 'var(--civ-color-base-lightest)',
          lighter: 'var(--civ-color-base-lighter)',
          light: 'var(--civ-color-base-light)',
          DEFAULT: 'var(--civ-color-base-DEFAULT)',
          dark: 'var(--civ-color-base-dark)',
          darker: 'var(--civ-color-base-darker)',
          darkest: 'var(--civ-color-base-darkest)',
        },
      },
      fontFamily: {
        sans: [
          'Public Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Roboto Mono',
          'Consolas',
          'Monaco',
          'Andale Mono',
          'Ubuntu Mono',
          'monospace',
        ],
      },
      // Density-responsive: these resolve to CSS variables that change
      // when [data-civ-scale="spacious|dense"] is set on a parent element
      fontSize: {
        'xs': 'var(--civ-typography-fontSize-xs)',
        'sm': 'var(--civ-typography-fontSize-sm)',
        'base': 'var(--civ-typography-fontSize-base)',
        'lg': 'var(--civ-typography-fontSize-lg)',
        'xl': 'var(--civ-typography-fontSize-xl)',
        '2xl': 'var(--civ-typography-fontSize-2xl)',
        '3xl': 'var(--civ-typography-fontSize-3xl)',
        '4xl': 'var(--civ-typography-fontSize-4xl)',
        '5xl': 'var(--civ-typography-fontSize-5xl)',
      },
      spacing: {
        '0': 'var(--civ-spacing-0)',
        'px': 'var(--civ-spacing-px)',
        '0.5': 'var(--civ-spacing-0.5)',
        '1': 'var(--civ-spacing-1)',
        '1.5': 'var(--civ-spacing-1.5)',
        '2': 'var(--civ-spacing-2)',
        '2.5': 'var(--civ-spacing-2.5)',
        '3': 'var(--civ-spacing-3)',
        '4': 'var(--civ-spacing-4)',
        '5': 'var(--civ-spacing-5)',
        '6': 'var(--civ-spacing-6)',
        '8': 'var(--civ-spacing-8)',
        '10': 'var(--civ-spacing-10)',
        '12': 'var(--civ-spacing-12)',
        '16': 'var(--civ-spacing-16)',
        '20': 'var(--civ-spacing-20)',
      },
      lineHeight: {
        'none': 'var(--civ-typography-lineHeight-none)',
        'tight': 'var(--civ-typography-lineHeight-tight)',
        'snug': 'var(--civ-typography-lineHeight-snug)',
        'normal': 'var(--civ-typography-lineHeight-normal)',
        'relaxed': 'var(--civ-typography-lineHeight-relaxed)',
        'loose': 'var(--civ-typography-lineHeight-loose)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.civ-focus-ring': {
          outline:
            'var(--civ-focus-outline-width) solid var(--civ-focus-outline-color)',
          'outline-offset': 'var(--civ-focus-outline-offset)',
          'box-shadow':
            '0 0 0 calc(var(--civ-focus-outline-offset) + var(--civ-focus-outline-width) + var(--civ-focus-shadow-spread)) var(--civ-focus-shadow-color)',
        },
        '.civ-focus-ring-inverse': {
          outline:
            'var(--civ-focus-outline-width) solid var(--civ-focus-shadow-color)',
          'outline-offset': 'var(--civ-focus-outline-offset)',
          'box-shadow':
            '0 0 0 calc(var(--civ-focus-outline-offset) + var(--civ-focus-outline-width) + var(--civ-focus-shadow-spread)) var(--civ-focus-outline-color)',
        },
      });
    }),
  ],
};

export default config;
