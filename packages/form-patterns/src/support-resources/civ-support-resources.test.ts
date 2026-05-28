import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-support-resources.js';

afterEach(cleanupFixtures);

describe('civ-support-resources', () => {
  it('renders as a complementary landmark', async () => {
    const el = await fixture('<civ-support-resources heading="Support"></civ-support-resources>');
    await elementUpdated(el);
    const landmark = el.querySelector('[role="complementary"]');
    expect(landmark).not.toBeNull();
    expect(landmark!.tagName.toLowerCase()).toBe('civ-callout');
  });

  it('renders heading with aria-labelledby', async () => {
    const el = await fixture('<civ-support-resources heading="Need help?"></civ-support-resources>');
    await elementUpdated(el);
    const landmark = el.querySelector('[role="complementary"]');
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.textContent).toContain('Need help?');
    expect(heading!.id).toBeTruthy();
    expect(landmark!.getAttribute('aria-labelledby')).toBe(heading!.id);
  });

  it('uses default heading from i18n when heading is empty', async () => {
    const el = await fixture('<civ-support-resources></civ-support-resources>');
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.textContent).toBeTruthy();
  });

  it('maps crisis tone to the error callout variant', async () => {
    const el = await fixture('<civ-support-resources heading="Crisis" tone="crisis"></civ-support-resources>');
    await elementUpdated(el);
    const callout = el.querySelector('civ-callout');
    expect(callout).not.toBeNull();
    expect(callout!.getAttribute('intent')).toBe('error');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-support-resources heading="Test"></civ-support-resources>');
    expect(el.shadowRoot).toBeNull();
  });

  it('keeps a stable heading id across re-renders', async () => {
    const el = await fixture('<civ-support-resources heading="Help"></civ-support-resources>') as any;
    await elementUpdated(el);
    const firstId = el.querySelector('[role="heading"]')!.id;

    // Force a re-render via a prop change.
    el.headingLevel = 4;
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]')!;

    expect(heading.id).toBe(firstId);
    expect(el.querySelector('[role="complementary"]')!.getAttribute('aria-labelledby')).toBe(firstId);
  });

  it('sets heading level via heading-level prop', async () => {
    const el = await fixture('<civ-support-resources heading="Help" heading-level="4"></civ-support-resources>');
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]');
    expect(heading!.getAttribute('aria-level')).toBe('4');
  });
});
