import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures } from '@civui/test-utils';
import './civ-tag.js';

afterEach(cleanupFixtures);

// Tailwind content-scanner protection (`pnpm lint:purged-variants`).
// civ-tag builds variant classes via template literal — list any that
// aren't already asserted by full name elsewhere in this file:
//   civ-tag--gray-primary  civ-tag--orange  civ-tag--orange-primary  civ-tag--purple

describe('civ-tag', () => {
  it('renders label text', async () => {
    const el = await fixture('<civ-tag label="Healthcare"></civ-tag>');
    expect(el.textContent).toContain('Healthcare');
  });

  it('applies variant class', async () => {
    const el = await fixture('<civ-tag label="Healthcare" variant="blue"></civ-tag>');
    const span = el.querySelector('.civ-tag--blue');
    expect(span).not.toBeNull();
  });

  it('defaults to gray variant', async () => {
    const el = await fixture('<civ-tag label="Default"></civ-tag>');
    const span = el.querySelector('.civ-tag--gray');
    expect(span).not.toBeNull();
  });

  it('renders all category variants', async () => {
    const variants = ['blue', 'orange', 'purple', 'gray'];
    for (const v of variants) {
      const el = await fixture(`<civ-tag label="${v}" variant="${v}"></civ-tag>`);
      expect(el.querySelector(`.civ-tag--${v}`)).not.toBeNull();
    }
  });

  it('defaults to secondary style', async () => {
    const el = await fixture('<civ-tag label="Healthcare" variant="blue"></civ-tag>');
    expect(el.querySelector('.civ-tag--blue')).not.toBeNull();
    expect(el.querySelector('.civ-tag--blue-primary')).toBeNull();
  });

  it('applies primary style class', async () => {
    const el = await fixture('<civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>');
    expect(el.querySelector('.civ-tag--purple-primary')).not.toBeNull();
  });

  it('renders all variants in primary style', async () => {
    const variants = ['blue', 'orange', 'purple', 'gray'];
    for (const v of variants) {
      const el = await fixture(`<civ-tag label="${v}" variant="${v}" tag-style="primary"></civ-tag>`);
      expect(el.querySelector(`.civ-tag--${v}-primary`)).not.toBeNull();
    }
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-tag label="Test"></civ-tag>');
    expect(el.shadowRoot).toBeNull();
  });

  it('does not render role="status" (categorization, not status)', async () => {
    const el = await fixture('<civ-tag label="Healthcare"></civ-tag>');
    expect(el.querySelector('[role="status"]')).toBeNull();
  });

  it('applies sm spacing class', async () => {
    const el = await fixture('<civ-tag label="Small" spacing="sm"></civ-tag>');
    const span = el.querySelector('.civ-tag--sm');
    expect(span).not.toBeNull();
  });

  describe('icon-start', () => {
    it('renders no icon by default', async () => {
      const el = await fixture('<civ-tag label="Healthcare"></civ-tag>');
      expect(el.querySelector('.civ-tag__icon')).toBeNull();
      expect(el.querySelector('.civ-tag--with-icon')).toBeNull();
    });

    it('renders icon and adds with-icon class when icon-start is set', async () => {
      const el = await fixture('<civ-tag label="Healthcare" icon-start="medical"></civ-tag>');
      expect(el.querySelector('.civ-tag__icon')).not.toBeNull();
      expect(el.querySelector('.civ-tag--with-icon')).not.toBeNull();
    });

    it('passes icon name to civ-icon', async () => {
      const el = await fixture('<civ-tag label="Healthcare" icon-start="medical"></civ-tag>');
      const icon = el.querySelector('civ-icon');
      expect(icon?.getAttribute('name')).toBe('medical');
    });

    it('marks icon aria-hidden so the label remains the accessible name', async () => {
      const el = await fixture('<civ-tag label="Healthcare" icon-start="medical"></civ-tag>');
      expect(el.querySelector('civ-icon')?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
