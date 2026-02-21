import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  prefix: 'civds-',
  content: ['./packages/*/src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        primary: {
          lightest: 'var(--civds-color-primary-lightest)',
          lighter: 'var(--civds-color-primary-lighter)',
          light: 'var(--civds-color-primary-light)',
          DEFAULT: 'var(--civds-color-primary-DEFAULT)',
          vivid: 'var(--civds-color-primary-vivid)',
          dark: 'var(--civds-color-primary-dark)',
          darker: 'var(--civds-color-primary-darker)',
        },
        error: {
          lighter: 'var(--civds-color-error-lighter)',
          light: 'var(--civds-color-error-light)',
          DEFAULT: 'var(--civds-color-error-DEFAULT)',
          dark: 'var(--civds-color-error-dark)',
        },
        warning: {
          lighter: 'var(--civds-color-warning-lighter)',
          light: 'var(--civds-color-warning-light)',
          DEFAULT: 'var(--civds-color-warning-DEFAULT)',
          dark: 'var(--civds-color-warning-dark)',
        },
        success: {
          lighter: 'var(--civds-color-success-lighter)',
          light: 'var(--civds-color-success-light)',
          DEFAULT: 'var(--civds-color-success-DEFAULT)',
          dark: 'var(--civds-color-success-dark)',
        },
        info: {
          lighter: 'var(--civds-color-info-lighter)',
          light: 'var(--civds-color-info-light)',
          DEFAULT: 'var(--civds-color-info-DEFAULT)',
          dark: 'var(--civds-color-info-dark)',
        },
        base: {
          lightest: 'var(--civds-color-base-lightest)',
          lighter: 'var(--civds-color-base-lighter)',
          light: 'var(--civds-color-base-light)',
          DEFAULT: 'var(--civds-color-base-DEFAULT)',
          dark: 'var(--civds-color-base-dark)',
          darker: 'var(--civds-color-base-darker)',
          darkest: 'var(--civds-color-base-darkest)',
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
      // when [data-civds-scale="spacious|dense"] is set on a parent element
      fontSize: {
        'xs': 'var(--civds-typography-fontSize-xs)',
        'sm': 'var(--civds-typography-fontSize-sm)',
        'base': 'var(--civds-typography-fontSize-base)',
        'lg': 'var(--civds-typography-fontSize-lg)',
        'xl': 'var(--civds-typography-fontSize-xl)',
        '2xl': 'var(--civds-typography-fontSize-2xl)',
        '3xl': 'var(--civds-typography-fontSize-3xl)',
        '4xl': 'var(--civds-typography-fontSize-4xl)',
        '5xl': 'var(--civds-typography-fontSize-5xl)',
      },
      spacing: {
        '0': 'var(--civds-spacing-0)',
        'px': 'var(--civds-spacing-px)',
        '0.5': 'var(--civds-spacing-0.5)',
        '1': 'var(--civds-spacing-1)',
        '1.5': 'var(--civds-spacing-1.5)',
        '2': 'var(--civds-spacing-2)',
        '2.5': 'var(--civds-spacing-2.5)',
        '3': 'var(--civds-spacing-3)',
        '4': 'var(--civds-spacing-4)',
        '5': 'var(--civds-spacing-5)',
        '6': 'var(--civds-spacing-6)',
        '8': 'var(--civds-spacing-8)',
        '10': 'var(--civds-spacing-10)',
        '12': 'var(--civds-spacing-12)',
        '16': 'var(--civds-spacing-16)',
        '20': 'var(--civds-spacing-20)',
      },
      lineHeight: {
        'none': 'var(--civds-typography-lineHeight-none)',
        'tight': 'var(--civds-typography-lineHeight-tight)',
        'snug': 'var(--civds-typography-lineHeight-snug)',
        'normal': 'var(--civds-typography-lineHeight-normal)',
        'relaxed': 'var(--civds-typography-lineHeight-relaxed)',
        'loose': 'var(--civds-typography-lineHeight-loose)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.civds-focus-ring': {
          outline:
            'var(--civds-focus-outline-width) solid var(--civds-focus-outline-color)',
          'outline-offset': 'var(--civds-focus-outline-offset)',
          'box-shadow':
            '0 0 0 calc(var(--civds-focus-outline-offset) + var(--civds-focus-outline-width) + var(--civds-focus-shadow-spread)) var(--civds-focus-shadow-color)',
        },
        '.civds-focus-ring-inverse': {
          outline:
            'var(--civds-focus-outline-width) solid var(--civds-focus-shadow-color)',
          'outline-offset': 'var(--civds-focus-outline-offset)',
          'box-shadow':
            '0 0 0 calc(var(--civds-focus-outline-offset) + var(--civds-focus-outline-width) + var(--civds-focus-shadow-spread)) var(--civds-focus-outline-color)',
        },
      });
    }),
  ],
};

export default config;
