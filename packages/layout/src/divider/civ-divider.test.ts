import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
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

  it('applies sm spacing class', async () => {
    const el = await fixture('<civ-divider spacing="sm"></civ-divider>');
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

  it('combines primary variant with sm spacing', async () => {
    const el = await fixture('<civ-divider emphasis="primary" spacing="sm"></civ-divider>');
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
});
