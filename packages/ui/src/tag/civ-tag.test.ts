import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-tag.js';

afterEach(cleanupFixtures);

describe('civ-tag', () => {
  it('renders label text', async () => {
    const el = await fixture('<civ-tag label="Active"></civ-tag>');
    expect(el.textContent).toContain('Active');
  });

  it('applies variant class', async () => {
    const el = await fixture('<civ-tag label="Status" variant="blue"></civ-tag>');
    const span = el.querySelector('.civ-tag--blue');
    expect(span).not.toBeNull();
  });

  it('defaults to gray variant', async () => {
    const el = await fixture('<civ-tag label="Default"></civ-tag>');
    const span = el.querySelector('.civ-tag--gray');
    expect(span).not.toBeNull();
  });

  it('renders all semantic variants', async () => {
    const variants = ['blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'];
    for (const v of variants) {
      const el = await fixture(`<civ-tag label="${v}" variant="${v}"></civ-tag>`);
      expect(el.querySelector(`.civ-tag--${v}`)).not.toBeNull();
    }
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-tag label="Test"></civ-tag>');
    expect(el.shadowRoot).toBeNull();
  });
});
