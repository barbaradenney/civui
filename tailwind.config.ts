/**
 * Root Tailwind config — drives Storybook and the component-package
 * compile of `packages/core/src/styles/components.css`.
 *
 * The docs site at `apps/civ-site/tailwind.config.ts` imports this
 * config and overrides `content` + `plugins`. Theme changes (colors,
 * spacing, typography, etc.) made HERE automatically reach the docs
 * site too. Don't duplicate theme keys into the app config — that's
 * the duplication the 2026-05-28 dedupe deliberately removed.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  prefix: 'civ-',
  darkMode: 'media',
  content: ['./packages/*/src/**/*.ts'],

  // Tailwind's content scanner reads source files to decide which
  // classes survive PostCSS processing. Even classes declared as plain
  // CSS rules in components.css can be dropped if their selectors are
  // never referenced as literal strings in scanned content. This bit
  // CivUI once: civ-action-button constructs variant classes via
  // template literal (`civ-action-btn--${variant}-danger`) and its
  // tests only asserted toContain('danger'), so the resolved
  // `civ-action-btn--primary-danger` strings were never visible to
  // the scanner — the danger CSS rules silently disappeared from the
  // build output. Fix: tests/stories must reference the resolved
  // class names as literal strings (see civ-action-button.test.ts).
  // When adding a new component with dynamic variant classes, make
  // sure each resolved class name appears somewhere in a *.ts file.
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
          darkest: 'var(--civ-color-primary-darkest)',
        },
        error: {
          lightest: 'var(--civ-color-error-lightest)',
          lighter: 'var(--civ-color-error-lighter)',
          light: 'var(--civ-color-error-light)',
          DEFAULT: 'var(--civ-color-error-DEFAULT)',
          dark: 'var(--civ-color-error-dark)',
          darker: 'var(--civ-color-error-darker)',
          darkest: 'var(--civ-color-error-darkest)',
        },
        warning: {
          lightest: 'var(--civ-color-warning-lightest)',
          lighter: 'var(--civ-color-warning-lighter)',
          light: 'var(--civ-color-warning-light)',
          DEFAULT: 'var(--civ-color-warning-DEFAULT)',
          dark: 'var(--civ-color-warning-dark)',
          darker: 'var(--civ-color-warning-darker)',
          darkest: 'var(--civ-color-warning-darkest)',
        },
        success: {
          lightest: 'var(--civ-color-success-lightest)',
          lighter: 'var(--civ-color-success-lighter)',
          light: 'var(--civ-color-success-light)',
          DEFAULT: 'var(--civ-color-success-DEFAULT)',
          dark: 'var(--civ-color-success-dark)',
          darker: 'var(--civ-color-success-darker)',
          darkest: 'var(--civ-color-success-darkest)',
        },
        info: {
          lightest: 'var(--civ-color-info-lightest)',
          lighter: 'var(--civ-color-info-lighter)',
          light: 'var(--civ-color-info-light)',
          DEFAULT: 'var(--civ-color-info-DEFAULT)',
          dark: 'var(--civ-color-info-dark)',
          darker: 'var(--civ-color-info-darker)',
          darkest: 'var(--civ-color-info-darkest)',
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
        white: {
          DEFAULT: 'var(--civ-color-white-DEFAULT)',
        },
        black: {
          DEFAULT: 'var(--civ-color-black-DEFAULT)',
        },
        // Semantic surface tokens — neutral card / panel / input
        // backgrounds (and their hover / active states). Source of
        // truth is the `--civ-color-surface*` CSS vars in civ.css;
        // changing those single lines re-themes every surface
        // across CivUI. Tailwind aliases: `civ-bg-surface`,
        // `civ-bg-surface-hover`, `civ-bg-surface-active`.
        surface: {
          DEFAULT: 'var(--civ-color-surface)',
          hover: 'var(--civ-color-surface-hover)',
          active: 'var(--civ-color-surface-active)',
        },
        accent: {
          cool: {
            lightest: 'var(--civ-color-accent-cool-lightest)',
            light: 'var(--civ-color-accent-cool-light)',
            DEFAULT: 'var(--civ-color-accent-cool-DEFAULT)',
            dark: 'var(--civ-color-accent-cool-dark)',
          },
          warm: {
            lightest: 'var(--civ-color-accent-warm-lightest)',
            light: 'var(--civ-color-accent-warm-light)',
            DEFAULT: 'var(--civ-color-accent-warm-DEFAULT)',
            dark: 'var(--civ-color-accent-warm-dark)',
          },
        },
      },
      fontFamily: {
        sans: ['var(--civ-typography-fontFamily-sans)'],
        mono: ['var(--civ-typography-fontFamily-mono)'],
      },
      fontWeight: {
        light: 'var(--civ-typography-fontWeight-light)',
        normal: 'var(--civ-typography-fontWeight-regular)',
        semibold: 'var(--civ-typography-fontWeight-semibold)',
        bold: 'var(--civ-typography-fontWeight-bold)',
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
        '0.5': 'var(--civ-spacing-0_5)',
        '1': 'var(--civ-spacing-1)',
        '1.5': 'var(--civ-spacing-1_5)',
        '2': 'var(--civ-spacing-2)',
        '2.5': 'var(--civ-spacing-2_5)',
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
      // Dedicated `width` scale for the fixed input-width ladder
      // (form-templates.ts INPUT_WIDTH_CLASSES). Tailwind's `width`
      // utilities normally inherit the `spacing` scale above — but CivUI's
      // spacing is 5px-based, so `civ-w-12` would resolve to 60px and
      // `civ-w-16` to 80px. The input-width ladder's declared native sizes
      // (civ-text-input.schema.ts `widths`: iosPoints / androidDp) assume
      // the conventional 4px-based step (w-12 = 48px, w-16 = 64px, …), so
      // the spacing collision made `2xs`/`xs` inputs render ~25% wider on
      // web than on iOS/Android. Re-assert these seven keys at their
      // intended 4px-based px so `civ-w-N` matches the native points and
      // the spacing-based `civ-p-N` / `civ-gap-N` (60px/80px) stay as-is.
      // See audit-debt "Input-width ladder web/native px mismatch".
      width: {
        '12': '48px',
        '16': '64px',
        '24': '96px',
        '40': '160px',
        '60': '240px',
        '72': '288px',
        '96': '384px',
      },
      lineHeight: {
        'none': 'var(--civ-typography-lineHeight-none)',
        'tight': 'var(--civ-typography-lineHeight-tight)',
        'snug': 'var(--civ-typography-lineHeight-snug)',
        'normal': 'var(--civ-typography-lineHeight-normal)',
        'relaxed': 'var(--civ-typography-lineHeight-relaxed)',
        'loose': 'var(--civ-typography-lineHeight-loose)',
      },
      borderRadius: {
        'none': 'var(--civ-border-radius-none)',
        'sm': 'var(--civ-border-radius-sm)',
        'DEFAULT': 'var(--civ-border-radius-DEFAULT)',
        'md': 'var(--civ-border-radius-md)',
        'lg': 'var(--civ-border-radius-lg)',
        'full': 'var(--civ-border-radius-full)',
      },
      // Semantic default border color — Tailwind's `civ-border`
      // utility picks this up as its border-color when no
      // `civ-border-{family}-{shade}` modifier is supplied. Single
      // source of truth lives in `--civ-color-border` (defined in
      // civ.css); change that one variable to update every
      // chrome line CivUI-wide.
      borderColor: {
        DEFAULT: 'var(--civ-color-border)',
      },
    },
  },
  // Logical-property utilities (border-s-*, rounded-s, ms-*, me-*, etc.)
  // are native to Tailwind 3.3+, so we don't need a custom plugin to
  // emit them. Tailwind generates them with the configured `civ-` prefix
  // automatically.
};

export default config;
