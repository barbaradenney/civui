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

  it('maps sensitive tone to the warning callout variant', async () => {
    const el = await fixture<CivSectionIntro>(
      '<civ-section-intro heading="X" tone="sensitive"><p>body</p></civ-section-intro>',
    );
    await elementUpdated(el);
    const callout = el.querySelector('civ-callout');
    expect(callout).not.toBeNull();
    expect(callout!.getAttribute('variant')).toBe('warning');
  });

  it('maps info and neutral tones to the default callout variant', async () => {
    for (const tone of ['info', 'neutral'] as const) {
      const el = await fixture<CivSectionIntro>(
        `<civ-section-intro heading="X" tone="${tone}"><p>body</p></civ-section-intro>`,
      );
      await elementUpdated(el);
      const callout = el.querySelector('civ-callout')!;
      // useDefault: true on civ-callout suppresses the initial-value
      // reflection — the attribute is absent so the base CSS rule applies.
      expect(callout.getAttribute('variant')).toBeNull();
      expect((callout as HTMLElement & { variant: string }).variant).toBe('default');
    }
  });

  it('reflects tone to the host attribute so consumers can theme via attribute selectors', async () => {
    const el = await fixture<CivSectionIntro>(
      '<civ-section-intro heading="X" tone="sensitive"><p>body</p></civ-section-intro>',
    );
    await elementUpdated(el);
    expect(el.getAttribute('tone')).toBe('sensitive');
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
