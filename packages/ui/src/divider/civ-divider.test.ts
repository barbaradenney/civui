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
    const el = await fixture('<civ-divider variant="primary"></civ-divider>');
    const hr = el.querySelector('.civ-divider--primary');
    expect(hr).not.toBeNull();
  });

  it('does not apply primary class by default', async () => {
    const el = await fixture('<civ-divider></civ-divider>');
    const hr = el.querySelector('.civ-divider--primary');
    expect(hr).toBeNull();
  });

  it('combines primary variant with sm spacing', async () => {
    const el = await fixture('<civ-divider variant="primary" spacing="sm"></civ-divider>');
    const hr = el.querySelector('hr')!;
    expect(hr.className).toContain('civ-divider--primary');
    expect(hr.className).toContain('civ-divider--sm');
  });
});
