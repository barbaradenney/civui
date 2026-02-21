import type { Config } from 'tailwindcss';

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
    },
  },
  plugins: [],
};

export default config;
