import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { warnInvalidProp } from './dev-warn.js';

describe('warnInvalidProp', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    delete (globalThis as { CIV_DEV?: unknown }).CIV_DEV;
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('emits a structured console.warn with tag, prop, expectation, and received', () => {
    warnInvalidProp('civ-form', 'support-resources', 'a JSON array', 'plain string');
    expect(warn).toHaveBeenCalledOnce();
    const msg = warn.mock.calls[0][0] as string;
    expect(msg).toContain('[civ-form]');
    expect(msg).toContain('support-resources');
    expect(msg).toContain('a JSON array');
    expect(msg).toContain('"plain string"');
    expect(msg).toMatch(/Falling back/);
  });

  it('shortens long received strings to keep the warning readable', () => {
    const long = 'a'.repeat(200);
    warnInvalidProp('civ-form', 'support-resources', 'JSON array', long);
    const msg = warn.mock.calls[0][0] as string;
    expect(msg.length).toBeLessThan(300);
    expect(msg).toContain('…');
  });

  it('JSON-stringifies non-string received values', () => {
    warnInvalidProp('civ-progress', 'steps', 'an array', { not: 'an array' });
    const msg = warn.mock.calls[0][0] as string;
    expect(msg).toContain('"not"');
  });

  it('suppresses output when globalThis.CIV_DEV === false (prod opt-out)', () => {
    (globalThis as { CIV_DEV?: unknown }).CIV_DEV = false;
    warnInvalidProp('civ-form', 'x', 'anything', 'whatever');
    expect(warn).not.toHaveBeenCalled();
  });
});
