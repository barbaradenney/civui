import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-divider.js';

afterEach(cleanupFixtures);

describe('civ-divider', () => {
  it('renders an hr element', async () => {
    const el = await fixture('<civ-divider></civ-divider>');
    const hr = el.querySelector('hr');
    expect(hr).not.toBeNull();
  });

  it('applies default divider class', async () => {
    const el = await fixture('<civ-divider></civ-divider>');
    const hr = el.querySelector('.civ-divider');
    expect(hr).not.toBeNull();
  });

  it('applies sm rhythm class', async () => {
    const el = await fixture('<civ-divider rhythm="sm"></civ-divider>');
    const hr = el.querySelector('.civ-divider--sm');
    expect(hr).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-divider></civ-divider>');
    expect(el.shadowRoot).toBeNull();
  });

  it('applies primary variant class', async () => {
    const el = await fixture('<civ-divider emphasis="primary"></civ-divider>');
    const hr = el.querySelector('.civ-divider--primary');
    expect(hr).not.toBeNull();
  });

  it('does not apply primary class by default', async () => {
    const el = await fixture('<civ-divider></civ-divider>');
    const hr = el.querySelector('.civ-divider--primary');
    expect(hr).toBeNull();
  });

  it('combines primary variant with sm rhythm', async () => {
    const el = await fixture('<civ-divider emphasis="primary" rhythm="sm"></civ-divider>');
    const hr = el.querySelector('hr')!;
    expect(hr.className).toContain('civ-divider--primary');
    expect(hr.className).toContain('civ-divider--sm');
  });

  it('hr is a presentational separator (implicit role)', async () => {
    const el = await fixture('<civ-divider></civ-divider>');
    const hr = el.querySelector('hr');
    // hr element has implicit role="separator" — no explicit role needed
    expect(hr).not.toBeNull();
    expect(hr!.tagName).toBe('HR');
  });

  // Deprecated alias — same effect as `rhythm`, plus a one-time
  // dev-mode warning. Migration runway for consumers on old API.
  describe('deprecated `spacing` alias', () => {
    it('still produces the sm modifier class', async () => {
      const el = await fixture('<civ-divider spacing="sm"></civ-divider>');
      const hr = el.querySelector('.civ-divider--sm');
      expect(hr).not.toBeNull();
    });

    it('emits a one-time devWarn when set to non-default', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { resetDevWarnDedupe } = await import('@civui/core');
      resetDevWarnDedupe();
      await fixture('<civ-divider spacing="sm"></civ-divider>');
      const message = warn.mock.calls.map((c) => String(c[0])).join('\n');
      expect(message).toContain('civ-divider');
      expect(message).toContain('spacing');
      expect(message).toContain('rhythm');
      warn.mockRestore();
    });

    it('does not warn when set to default value', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { resetDevWarnDedupe } = await import('@civui/core');
      resetDevWarnDedupe();
      await fixture('<civ-divider spacing="default"></civ-divider>');
      // No deprecation chatter for consumers who haven't opted into sm.
      const calls = warn.mock.calls.filter((c) =>
        String(c[0]).includes('civ-divider') && String(c[0]).includes('spacing')
      );
      expect(calls.length).toBe(0);
      warn.mockRestore();
    });

    it('rhythm wins when both are set to sm (idempotent merge)', async () => {
      const el = await fixture('<civ-divider rhythm="sm" spacing="sm"></civ-divider>');
      const hr = el.querySelector('hr')!;
      expect(hr.className).toContain('civ-divider--sm');
    });
  });
});
