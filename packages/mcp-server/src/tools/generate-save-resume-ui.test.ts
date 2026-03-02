import { describe, it, expect } from 'vitest';
import { generateSaveResumeUi } from './generate-save-resume-ui.js';
import type { FormSchema } from '../schema/index.js';

const schema: FormSchema = {
  title: 'Benefits Application',
  sections: [{
    fields: [{ type: 'text', name: 'name', label: 'Name' }],
  }],
};

describe('generateSaveResumeUi', () => {
  it('returns html, javascript, and features', () => {
    const result = generateSaveResumeUi(schema);
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('javascript');
    expect(result).toHaveProperty('features');
    expect(typeof result.html).toBe('string');
    expect(typeof result.javascript).toBe('string');
    expect(Array.isArray(result.features)).toBe(true);
  });

  it('HTML has data-civ-save-status with aria-live', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.html).toContain('data-civ-save-status');
    expect(result.html).toContain('aria-live="polite"');
  });

  it('HTML has manual save button (data-civ-save-manual)', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.html).toContain('data-civ-save-manual');
    expect(result.html).toContain('Save progress');
  });

  it('HTML has resume banner (data-civ-resume-banner) with hidden', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.html).toContain('data-civ-resume-banner');
    expect(result.html).toMatch(/data-civ-resume-banner[^>]*hidden/);
  });

  it('HTML has timeout dialog (data-civ-timeout-dialog)', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.html).toContain('data-civ-timeout-dialog');
    expect(result.html).toContain('<dialog');
    expect(result.html).toContain('Session expiring');
  });

  it('resume banner has resume and start-over buttons', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.html).toContain('data-civ-resume');
    expect(result.html).toContain('data-civ-start-over');
    expect(result.html).toContain('Resume where you left off');
    expect(result.html).toContain('Start over');
  });

  it('default features include save-resume, auto-save, manual-save, session-timeout, resume-detection, localStorage', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.features).toContain('save-resume');
    expect(result.features).toContain('auto-save');
    expect(result.features).toContain('manual-save');
    expect(result.features).toContain('session-timeout');
    expect(result.features).toContain('resume-detection');
    expect(result.features).toContain('localStorage');
  });

  it('showLastSaved: true adds show-last-saved feature and data-civ-last-saved element', () => {
    const result = generateSaveResumeUi(schema, { showLastSaved: true });
    expect(result.features).toContain('show-last-saved');
    expect(result.html).toContain('data-civ-last-saved');
  });

  it('showLastSaved: false omits show-last-saved feature', () => {
    const result = generateSaveResumeUi(schema, { showLastSaved: false });
    expect(result.features).not.toContain('show-last-saved');
    expect(result.html).not.toContain('data-civ-last-saved');
  });

  it('JavaScript contains storageKey derived from schema title', () => {
    const result = generateSaveResumeUi(schema);
    expect(result.javascript).toContain("STORAGE_KEY = 'benefits-application'");
  });

  it('custom storageKey from options overrides title-derived key', () => {
    const result = generateSaveResumeUi(schema, { storageKey: 'my-custom-key' });
    expect(result.javascript).toContain("STORAGE_KEY = 'my-custom-key'");
    expect(result.javascript).not.toContain('benefits-application');
  });

  it('schema saveResume config is used as defaults', () => {
    const schemaWithConfig: FormSchema = {
      ...schema,
      saveResume: {
        autoSaveIntervalMs: 5000,
        sessionTimeoutMs: 600000,
        storageKey: 'schema-key',
      },
    };
    const result = generateSaveResumeUi(schemaWithConfig);
    expect(result.javascript).toContain('AUTO_SAVE_INTERVAL = 5000');
    expect(result.javascript).toContain('SESSION_TIMEOUT = 600000');
    expect(result.javascript).toContain("STORAGE_KEY = 'schema-key'");
  });

  it('options override schema saveResume config', () => {
    const schemaWithConfig: FormSchema = {
      ...schema,
      saveResume: {
        autoSaveIntervalMs: 5000,
        sessionTimeoutMs: 600000,
        storageKey: 'schema-key',
      },
    };
    const result = generateSaveResumeUi(schemaWithConfig, {
      autoSaveIntervalMs: 10000,
      storageKey: 'options-key',
    });
    expect(result.javascript).toContain('AUTO_SAVE_INTERVAL = 10000');
    expect(result.javascript).toContain("STORAGE_KEY = 'options-key'");
    // sessionTimeoutMs falls through to schema config
    expect(result.javascript).toContain('SESSION_TIMEOUT = 600000');
  });

  it('JavaScript contains auto-save interval and session timeout values', () => {
    const result = generateSaveResumeUi(schema, {
      autoSaveIntervalMs: 15000,
      sessionTimeoutMs: 1800000,
      warningBeforeTimeoutMs: 60000,
    });
    expect(result.javascript).toContain('AUTO_SAVE_INTERVAL = 15000');
    expect(result.javascript).toContain('SESSION_TIMEOUT = 1800000');
    expect(result.javascript).toContain('WARNING_BEFORE_TIMEOUT = 60000');
  });
});
