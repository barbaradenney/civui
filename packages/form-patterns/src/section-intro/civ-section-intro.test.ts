import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-section-intro.js';
import type { CivSectionIntro } from './civ-section-intro.js';

afterEach(cleanupFixtures);

describe('civ-section-intro', () => {
  it('renders a region with the heading as accessible name', async () => {
    const el = await fixture<CivSectionIntro>(`
      <civ-section-intro heading="About your deployment">
        <p>The next questions may be hard.</p>
      </civ-section-intro>
    `);

    const region = el.querySelector('[role="region"]')!;
    expect(region).not.toBeNull();
    const heading = el.querySelector('[role="heading"]')!;
    expect(heading.textContent).toBe('About your deployment');
    expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('falls back to aria-label when no heading is provided', async () => {
    const el = await fixture<CivSectionIntro>(`
      <civ-section-intro>
        <p>Just context.</p>
      </civ-section-intro>
    `);
    const region = el.querySelector('[role="region"]')!;
    expect(region.getAttribute('aria-label')).toBeTruthy();
    expect(region.getAttribute('aria-labelledby')).toBeNull();
  });

  it('applies heading level', async () => {
    const el = await fixture<CivSectionIntro>(
      '<civ-section-intro heading="Hi" heading-level="2"><p>body</p></civ-section-intro>',
    );
    const heading = el.querySelector('[role="heading"]')!;
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('applies a tone class', async () => {
    const el = await fixture<CivSectionIntro>(
      '<civ-section-intro heading="X" tone="sensitive"><p>body</p></civ-section-intro>',
    );
    expect(el.querySelector('.civ-section-intro--sensitive')).not.toBeNull();
  });

  it('preserves authored body content in Light DOM', async () => {
    const el = await fixture<CivSectionIntro>(`
      <civ-section-intro heading="X">
        <p class="custom-body">Keep this content</p>
      </civ-section-intro>
    `);
    await elementUpdated(el);
    const body = el.querySelector('.custom-body');
    expect(body).not.toBeNull();
    expect(body!.textContent).toBe('Keep this content');
  });

  it('uses Light DOM', async () => {
    const el = await fixture(
      '<civ-section-intro heading="X"><p>body</p></civ-section-intro>',
    );
    expect(el.shadowRoot).toBeNull();
  });
});
