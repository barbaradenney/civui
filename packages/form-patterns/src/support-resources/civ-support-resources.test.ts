import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-support-resources.js';

afterEach(cleanupFixtures);

describe('civ-support-resources', () => {
  it('renders as an aside landmark', async () => {
    const el = await fixture('<civ-support-resources heading="Support"></civ-support-resources>');
    await elementUpdated(el);
    const aside = el.querySelector('aside');
    expect(aside).not.toBeNull();
    expect(aside!.getAttribute('role')).toBe('complementary');
  });

  it('renders heading with aria-labelledby', async () => {
    const el = await fixture('<civ-support-resources heading="Need help?"></civ-support-resources>');
    await elementUpdated(el);
    const aside = el.querySelector('aside');
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.textContent).toContain('Need help?');
    expect(heading!.id).toBeTruthy();
    expect(aside!.getAttribute('aria-labelledby')).toBe(heading!.id);
  });

  it('uses default heading from i18n when heading is empty', async () => {
    const el = await fixture('<civ-support-resources></civ-support-resources>');
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.textContent).toBeTruthy();
  });

  it('applies crisis tone class', async () => {
    const el = await fixture('<civ-support-resources heading="Crisis" tone="crisis"></civ-support-resources>');
    await elementUpdated(el);
    const aside = el.querySelector('aside');
    expect(aside!.classList.contains('civ-callout--error')).toBe(true);
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-support-resources heading="Test"></civ-support-resources>');
    expect(el.shadowRoot).toBeNull();
  });

  it('sets heading level via heading-level prop', async () => {
    const el = await fixture('<civ-support-resources heading="Help" heading-level="4"></civ-support-resources>');
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.getAttribute('aria-level')).toBe('4');
  });
});
