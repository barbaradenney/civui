import { describe, it, expect } from 'vitest';
import { generateTimeoutWarning } from './generate-timeout-warning.js';
import type { FormSchema } from '../schema/index.js';

const standaloneConfig = {
  sessionTimeoutMs: 900000,  // 15 min
  warningBeforeMs: 120000,    // 2 min
};

function schemaWithTimeout(overrides?: Record<string, unknown>): FormSchema {
  return {
    sections: [{ fields: [{ type: 'text' as const, name: 'x', label: 'X' }] }],
    timeoutWarning: {
      sessionTimeoutMs: 900000,
      warningBeforeMs: 120000,
      ...overrides,
    },
  };
}

describe('generateTimeoutWarning', () => {
  it('throws when no config is available', () => {
    const schema: FormSchema = {
      sections: [{ fields: [{ type: 'text', name: 'x', label: 'X' }] }],
    };
    expect(() => generateTimeoutWarning(schema)).toThrow(
      'Either a schema with timeoutWarning configuration or standalone config is required',
    );
  });

  it('works with standalone config (first arg)', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
  });

  it('works with schema timeoutWarning config', () => {
    const result = generateTimeoutWarning(schemaWithTimeout());
    expect(result.html).toContain('data-civ-timeout-warning');
  });

  it('HTML has dialog element', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.html).toContain('<dialog data-civ-timeout-warning');
    expect(result.html).toContain('</dialog>');
  });

  it('HTML has countdown element with aria-live="polite"', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.html).toContain('data-civ-countdown');
    expect(result.html).toContain('aria-live="polite"');
    expect(result.html).toContain('aria-atomic="true"');
  });

  it('HTML has extend button when extendable (default)', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.html).toContain('data-civ-timeout-extend');
    expect(result.html).toContain('Extend session');
  });

  it('HTML omits extend button when extendable is false', () => {
    const result = generateTimeoutWarning({
      ...standaloneConfig,
      extendable: false,
    });
    expect(result.html).not.toContain('data-civ-timeout-extend');
  });

  it('HTML has logout button', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.html).toContain('data-civ-timeout-logout');
    expect(result.html).toContain('Log out');
  });

  it('features include timeout-warning, dialog, countdown, wcag-2-2-1', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.features).toContain('timeout-warning');
    expect(result.features).toContain('dialog');
    expect(result.features).toContain('countdown');
    expect(result.features).toContain('wcag-2-2-1');
  });

  it('features include extendable when extendable is true', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.features).toContain('extendable');
  });

  it('features include redirect when redirectUrl is set', () => {
    const result = generateTimeoutWarning({
      ...standaloneConfig,
      redirectUrl: '/session-expired',
    });
    expect(result.features).toContain('redirect');
    expect(result.javascript).toContain('/session-expired');
  });

  it('JS dispatches civ-timeout-expire event', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.javascript).toContain('civ-timeout-expire');
  });

  it('JS dispatches civ-timeout-extend event', () => {
    const result = generateTimeoutWarning(standaloneConfig);
    expect(result.javascript).toContain('civ-timeout-extend');
  });

  it('JS handles maxExtensions', () => {
    const result = generateTimeoutWarning({
      ...standaloneConfig,
      maxExtensions: 3,
    });
    expect(result.javascript).toContain('maxExtensions');
    expect(result.javascript).toContain('3');
  });
});
