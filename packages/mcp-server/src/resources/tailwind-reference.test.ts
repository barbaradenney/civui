import { describe, it, expect } from 'vitest';
import { TAILWIND_REFERENCE } from './tailwind-reference.js';

describe('TAILWIND_REFERENCE', () => {
  it('is a non-empty string', () => {
    expect(typeof TAILWIND_REFERENCE).toBe('string');
    expect(TAILWIND_REFERENCE.length).toBeGreaterThan(0);
  });

  describe('prefix rule', () => {
    it('documents the civ- prefix requirement', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-');
      expect(TAILWIND_REFERENCE).toContain('Prefix Rule');
    });

    it('shows correct vs wrong examples', () => {
      expect(TAILWIND_REFERENCE).toContain('Correct');
      expect(TAILWIND_REFERENCE).toContain('Wrong');
      expect(TAILWIND_REFERENCE).toContain('`civ-p-4`');
    });
  });

  describe('semantic colors', () => {
    const colorFamilies = [
      'primary',
      'error',
      'warning',
      'success',
      'info',
      'base',
      'white',
      'black',
      'accent-cool',
      'accent-warm',
    ] as const;

    for (const family of colorFamilies) {
      it(`includes ${family} color family`, () => {
        expect(TAILWIND_REFERENCE).toContain(family);
      });
    }

    it('includes light mode hex values', () => {
      // Spot-check known hex values from color.tokens.json
      expect(TAILWIND_REFERENCE).toContain('#005ea2'); // primary DEFAULT
      expect(TAILWIND_REFERENCE).toContain('#b50909'); // error DEFAULT
      expect(TAILWIND_REFERENCE).toContain('#e5a000'); // warning DEFAULT
      expect(TAILWIND_REFERENCE).toContain('#00a91c'); // success DEFAULT
      expect(TAILWIND_REFERENCE).toContain('#00bde3'); // info DEFAULT
      expect(TAILWIND_REFERENCE).toContain('#1b1b1b'); // base darkest
    });

    it('includes dark mode hex values', () => {
      // Spot-check known hex values from color-dark.tokens.json
      expect(TAILWIND_REFERENCE).toContain('#73b3e7'); // primary DEFAULT dark
      expect(TAILWIND_REFERENCE).toContain('#f28b82'); // error DEFAULT dark
      expect(TAILWIND_REFERENCE).toContain('#f5c542'); // warning DEFAULT dark
      expect(TAILWIND_REFERENCE).toContain('#5cb85c'); // success DEFAULT dark
      expect(TAILWIND_REFERENCE).toContain('#4dd0e1'); // info DEFAULT dark
    });
  });

  describe('typography', () => {
    it('includes font families', () => {
      expect(TAILWIND_REFERENCE).toContain('system-ui');
      expect(TAILWIND_REFERENCE).toContain('Roboto Mono');
      expect(TAILWIND_REFERENCE).toContain('civ-font-sans');
      expect(TAILWIND_REFERENCE).toContain('civ-font-mono');
    });

    it('includes all 9 font sizes', () => {
      const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
      for (const size of sizes) {
        expect(TAILWIND_REFERENCE).toContain(`civ-text-${size}`);
      }
    });

    it('includes all 4 font weights', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-font-light');
      expect(TAILWIND_REFERENCE).toContain('civ-font-normal');
      expect(TAILWIND_REFERENCE).toContain('civ-font-semibold');
      expect(TAILWIND_REFERENCE).toContain('civ-font-bold');
    });

    it('includes all 6 line heights', () => {
      const heights = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'];
      for (const h of heights) {
        expect(TAILWIND_REFERENCE).toContain(`civ-leading-${h}`);
      }
    });
  });

  describe('spacing scale', () => {
    it('includes spacing values', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-p-0');
      expect(TAILWIND_REFERENCE).toContain('civ-p-4');
      expect(TAILWIND_REFERENCE).toContain('civ-m-8');
      expect(TAILWIND_REFERENCE).toContain('civ-gap-2');
      expect(TAILWIND_REFERENCE).toContain('civ-p-20');
    });

    it('includes directional variant examples', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-pt-');
      expect(TAILWIND_REFERENCE).toContain('civ-px-');
      expect(TAILWIND_REFERENCE).toContain('civ-my-');
    });
  });

  describe('component CSS classes', () => {
    const componentClasses = [
      '.civ-label',
      '.civ-legend',
      '.civ-required-mark',
      '.civ-hint',
      '.civ-hint--group',
      '.civ-error-text',
      '.civ-error-text--group',
      '.civ-input',
      '.civ-fieldset',
      '.civ-group-layout--vertical',
      '.civ-group-layout--horizontal',
      '.civ-check-input',
      '.civ-check-label',
      '.civ-check-description',
      '.civ-check-tile',
      '.civ-toggle-track',
      '.civ-toggle-thumb',
      '.civ-segment-btn',
      '.civ-dropzone',
      '.civ-file-item',
      '.civ-file-remove-btn',
      '.civ-combobox-listbox',
      '.civ-combobox-option',
      '.civ-datepicker-dialog',
      '.civ-datepicker-day',
      '.civ-datepicker-nav-btn',
      '.civ-datepicker-cal-btn',
      '.civ-form-error-summary',
      '.civ-form-error-heading',
      '.civ-sr-only',
    ] as const;

    for (const cls of componentClasses) {
      it(`documents ${cls}`, () => {
        expect(TAILWIND_REFERENCE).toContain(cls);
      });
    }
  });

  describe('focus ring', () => {
    it('documents focus-visible:civ-focus-ring', () => {
      expect(TAILWIND_REFERENCE).toContain('focus-visible:civ-focus-ring');
    });

    it('documents the inverse variant', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-focus-ring-inverse');
    });

    it('warns against deprecated focus:civ-outline-* classes', () => {
      expect(TAILWIND_REFERENCE).toContain('DEPRECATED');
      expect(TAILWIND_REFERENCE).toContain('focus:civ-outline-');
    });
  });

  describe('density system', () => {
    it('documents all three density scales', () => {
      expect(TAILWIND_REFERENCE).toContain('data-civ-scale="dense"');
      expect(TAILWIND_REFERENCE).toContain('data-civ-scale="spacious"');
    });
  });

  describe('dark mode', () => {
    it('documents automatic dark mode via prefers-color-scheme', () => {
      expect(TAILWIND_REFERENCE).toContain('prefers-color-scheme');
      expect(TAILWIND_REFERENCE).toContain('automatic');
    });
  });

  describe('logical / RTL properties', () => {
    it('documents logical property replacements', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-border-s-4');
      expect(TAILWIND_REFERENCE).toContain('civ-rounded-s');
      expect(TAILWIND_REFERENCE).toContain('civ-rounded-e');
      expect(TAILWIND_REFERENCE).toContain('civ-me-2');
      expect(TAILWIND_REFERENCE).toContain('civ-ms-2');
    });
  });

  describe('borders and shadows', () => {
    it('documents border radius values', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-rounded-none');
      expect(TAILWIND_REFERENCE).toContain('civ-rounded-full');
    });

    it('documents shadow levels', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-shadow-sm');
      expect(TAILWIND_REFERENCE).toContain('civ-shadow-md');
      expect(TAILWIND_REFERENCE).toContain('civ-shadow-lg');
    });

    it('documents border widths', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-border-2');
      expect(TAILWIND_REFERENCE).toContain('civ-border-4');
    });
  });

  describe('motion', () => {
    it('documents transition durations', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-duration-150');
      expect(TAILWIND_REFERENCE).toContain('civ-duration-300');
    });

    it('documents easing functions', () => {
      expect(TAILWIND_REFERENCE).toContain('civ-ease-in');
      expect(TAILWIND_REFERENCE).toContain('civ-ease-out');
    });

    it('mentions prefers-reduced-motion', () => {
      expect(TAILWIND_REFERENCE).toContain('prefers-reduced-motion');
    });
  });

  describe('anti-patterns', () => {
    it('documents common anti-patterns with fixes', () => {
      expect(TAILWIND_REFERENCE).toContain('Anti-Pattern');
      expect(TAILWIND_REFERENCE).toContain('missing prefix');
      expect(TAILWIND_REFERENCE).toContain('raw hex');
    });
  });
});
