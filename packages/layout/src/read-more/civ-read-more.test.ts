import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-read-more.js';
import type { CivReadMore } from './civ-read-more.js';

afterEach(cleanupFixtures);

describe('civ-read-more', () => {
  it('renders teaser, hidden rest, and a trigger button', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more>
        <p data-test="teaser">Teaser</p>
        <div data-rest>
          <p data-test="rest">Hidden rest</p>
        </div>
      </civ-read-more>
    `);
    expect(el.querySelector('.civ-read-more__teaser')).not.toBeNull();
    expect(el.querySelector('.civ-read-more__rest')).not.toBeNull();
    expect(el.querySelector('button')).not.toBeNull();
  });

  it('places teaser into the teaser container and rest into the rest container', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more>
        <p data-test="teaser">Teaser</p>
        <div data-rest>
          <p data-test="rest">Rest</p>
        </div>
      </civ-read-more>
    `);
    const teaserContainer = el.querySelector('.civ-read-more__teaser')!;
    const restContainer = el.querySelector('.civ-read-more__rest')!;
    expect(teaserContainer.contains(el.querySelector('[data-test="teaser"]'))).toBe(true);
    expect(restContainer.contains(el.querySelector('[data-test="rest"]'))).toBe(true);
  });

  it('defaults to collapsed (rest is hidden)', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more>
        <p>Teaser</p>
        <div data-rest><p>Rest</p></div>
      </civ-read-more>
    `);
    expect(el.open).toBe(false);
    const rest = el.querySelector('.civ-read-more__rest') as HTMLElement;
    expect(rest.hasAttribute('hidden')).toBe(true);
  });

  it('expands when the button is clicked and unhides the rest region', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more>
        <p>Teaser</p>
        <div data-rest><p>Rest</p></div>
      </civ-read-more>
    `);
    const button = el.querySelector('button')!;
    button.click();
    await elementUpdated(el);

    expect(el.open).toBe(true);
    const rest = el.querySelector('.civ-read-more__rest') as HTMLElement;
    expect(rest.hasAttribute('hidden')).toBe(false);
  });

  it('flips aria-expanded on the button when toggled', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more>
        <p>Teaser</p>
        <div data-rest><p>Rest</p></div>
      </civ-read-more>
    `);
    const button = el.querySelector('button')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    await elementUpdated(el);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('points aria-controls at the rest region id', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more>
        <p>Teaser</p>
        <div data-rest><p>Rest</p></div>
      </civ-read-more>
    `);
    const button = el.querySelector('button')!;
    const rest = el.querySelector('.civ-read-more__rest')!;
    const controls = button.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(rest.id).toBe(controls);
  });

  it('uses an explicit type="button" so it does not submit ancestor forms', async () => {
    // Regression: a `<button>` with no type defaults to `submit` inside
    // a form. A read-more toggle accidentally submitting the form
    // would be a nasty surprise.
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    expect(el.querySelector('button')!.getAttribute('type')).toBe('button');
  });

  it('toggles button label between Read more / Read less', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Read more');

    el.open = true;
    await elementUpdated(el);
    expect(button.textContent).toContain('Read less');
  });

  it('default "Read more" label carries a U+2026 ellipsis (continuation hint)', async () => {
    // Typographic ellipsis (single character `…`, not three dots)
    // signals "more content follows" — a recognized convention. The
    // "Read less" label gets none, because collapsing reveals nothing
    // further. Consumers override either via `more-label` /
    // `less-label`.
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Read more…');
    expect(button.textContent).not.toContain('Read more...');

    el.open = true;
    await elementUpdated(el);
    expect(button.textContent).not.toContain('…');
  });

  it('honors custom moreLabel / lessLabel overrides', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more more-label="Show details" less-label="Hide details">
        <p>Teaser</p>
      </civ-read-more>
    `);
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Show details');

    el.open = true;
    await elementUpdated(el);
    expect(button.textContent).toContain('Hide details');
  });

  it('renders no icon by default; renders one when the icon prop is set', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    expect(el.querySelector('civ-icon')).toBeNull();

    el.icon = 'chevron-down';
    await elementUpdated(el);
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-down');
  });

  it('dispatches civ-toggle with { open } on user toggle', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    el.querySelector('button')!.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
  });

  it('civ-toggle does NOT bubble or compose (does not pollute form listeners)', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const outerHandler = vi.fn();
    document.body.addEventListener('civ-toggle', outerHandler as EventListener);

    el.querySelector('button')!.click();
    await elementUpdated(el);

    expect(outerHandler).not.toHaveBeenCalled();
    document.body.removeEventListener('civ-toggle', outerHandler as EventListener);
  });

  it('renders with open=true from the attribute', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more open>
        <p>Teaser</p>
        <div data-rest><p>Rest</p></div>
      </civ-read-more>
    `);
    expect(el.open).toBe(true);
    const rest = el.querySelector('.civ-read-more__rest') as HTMLElement;
    expect(rest.hasAttribute('hidden')).toBe(false);
    expect(el.querySelector('button')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('reflects the open property back to the host attribute', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    el.open = true;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('applies the shared toggle-button sm class via spacing="sm"', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more spacing="sm"><p>Teaser</p></civ-read-more>
    `);
    const trigger = el.querySelector('.civ-read-more__trigger')!;
    expect(trigger.classList.contains('civ-text-btn--sm')).toBe(true);
  });

  it('applies the same sm class via the legacy size="sm" alias', async () => {
    // Backward compat: size="sm" still produces the sm class until the
    // deprecated prop is removed. A separate test asserts the dev-mode
    // warning fires.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await fixture<CivReadMore>(`
      <civ-read-more size="sm"><p>Teaser</p></civ-read-more>
    `);
    const trigger = el.querySelector('.civ-read-more__trigger')!;
    expect(trigger.classList.contains('civ-text-btn--sm')).toBe(true);
    warn.mockRestore();
  });

  it('emits a one-time deprecation warning when `size` is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { resetDevWarnDedupe } = await import('@civui/core');
    resetDevWarnDedupe();
    await fixture<CivReadMore>(`
      <civ-read-more size="sm"><p>Teaser</p></civ-read-more>
    `);
    expect(warn).toHaveBeenCalled();
    const message = warn.mock.calls[0]?.[0] as string;
    expect(message).toContain('civ-read-more');
    expect(message).toContain('size');
    expect(message).toContain('deprecated');
    expect(message).toContain('spacing');
    warn.mockRestore();
  });

  it('does NOT warn when only `spacing` is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { resetDevWarnDedupe } = await import('@civui/core');
    resetDevWarnDedupe();
    await fixture<CivReadMore>(`
      <civ-read-more spacing="sm"><p>Teaser</p></civ-read-more>
    `);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('composes the shared civ-text-btn chip palette on the trigger', async () => {
    // The disclosure family (civ-disclosure, civ-read-more, future
    // siblings) all share the same chip-button palette via
    // `civ-text-btn` + `civ-text-btn--chip`. Asserting both classes
    // locks the composition — a refactor that removed either would
    // silently strip the palette.
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const trigger = el.querySelector('.civ-read-more__trigger')!;
    expect(trigger.classList.contains('civ-text-btn')).toBe(true);
    expect(trigger.classList.contains('civ-text-btn--chip')).toBe(true);
  });

  it('chevron icon matches the open-state rotation selector', async () => {
    // Locks the CSS contract: the rule
    // `civ-read-more[open] > .civ-read-more__trigger > civ-icon[name='chevron-down']`
    // depends on (1) the host carrying the `expanded` attribute via
    // reflection, (2) the trigger being a direct child of the host,
    // and (3) the icon being a direct child of the trigger with the
    // exact name. If any of those drift, the selector silently stops
    // matching and the chevron freezes. (The host is selected by
    // tag, not class — unlike civ-disclosure, the host itself is
    // the structural wrapper, so there's no nested element to carry
    // a `.civ-read-more` class.)
    const el = await fixture<CivReadMore>(`
      <civ-read-more icon="chevron-down" open><p>Teaser</p></civ-read-more>
    `);
    const icon = el.querySelector('civ-icon')!;
    expect(icon.matches(
      'civ-read-more[open] > .civ-read-more__trigger > civ-icon[name="chevron-down"]'
    )).toBe(true);
  });

  describe('inline mode', () => {
    it('reflects the inline property to the host attribute', async () => {
      const el = await fixture<CivReadMore>(`
        <civ-read-more inline>Teaser text.</civ-read-more>
      `);
      expect(el.inline).toBe(true);
      expect(el.hasAttribute('inline')).toBe(true);
    });

    it('composes the chip palette and adds the --inline modifier', async () => {
      // Inline mode keeps the chip palette (filled background,
      // semibold, rounded — the affordance reads as a button, not an
      // underlined link) and adds the component-specific `--inline`
      // modifier so CSS can trim padding and zero out the top margin
      // that otherwise pushes the inline-block button off the text
      // baseline.
      const el = await fixture<CivReadMore>(`
        <civ-read-more inline>Teaser text.</civ-read-more>
      `);
      const trigger = el.querySelector('.civ-read-more__trigger')!;
      expect(trigger.classList.contains('civ-text-btn')).toBe(true);
      expect(trigger.classList.contains('civ-text-btn--chip')).toBe(true);
      expect(trigger.classList.contains('civ-read-more__trigger--inline')).toBe(true);
    });

    it('suppresses the chevron icon in inline mode', async () => {
      // The chevron is awkward inline — it breaks the text flow.
      // Setting `icon` while `inline` is active should be a no-op
      // rather than rendering a stray glyph between words.
      const el = await fixture<CivReadMore>(`
        <civ-read-more inline icon="chevron-down">Teaser text.</civ-read-more>
      `);
      expect(el.querySelector('civ-icon')).toBeNull();
    });

    it('keeps the same aria wiring in inline mode', async () => {
      // Inline only changes presentation. The button still carries
      // type="button", aria-expanded, and aria-controls; the rest
      // region still uses `hidden`. Locks that the swap stays a
      // CSS-only concern. Authors should use a `<span data-rest>`
      // wrapper in inline mode so the HTML stays valid inside a
      // `<p>`; the test mirrors that convention.
      const el = await fixture<CivReadMore>(`
        <civ-read-more inline>
          Teaser text.
          <span data-rest>Rest content.</span>
        </civ-read-more>
      `);
      const button = el.querySelector('button')!;
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-controls')).toBeTruthy();
      const rest = el.querySelector('.civ-read-more__rest') as HTMLElement;
      expect(rest.hasAttribute('hidden')).toBe(true);
    });
  });

  describe('fade-and-overlay trigger (block-mode default)', () => {
    it('does NOT carry the no-fade-trigger attribute by default', async () => {
      // The block-mode default is fade + overlay button; the CSS rule
      // is gated by `:not([no-fade-trigger])`. Locks that the
      // attribute stays absent without an explicit opt-out.
      const el = await fixture<CivReadMore>(`
        <civ-read-more>
          <p>Teaser</p>
          <div data-rest><p>Rest</p></div>
        </civ-read-more>
      `);
      expect(el.noFadeTrigger).toBe(false);
      expect(el.hasAttribute('no-fade-trigger')).toBe(false);
    });

    it('reflects no-fade-trigger to the host attribute when set', async () => {
      // The CSS selector that drives the fade is
      // `civ-read-more:not([open]):not([inline]):not([no-fade-trigger])`
      // — that's a host-attribute selector, so the property MUST
      // reflect or the CSS won't pick up the opt-out.
      const el = await fixture<CivReadMore>(`
        <civ-read-more no-fade-trigger>
          <p>Teaser</p>
          <div data-rest><p>Rest</p></div>
        </civ-read-more>
      `);
      expect(el.noFadeTrigger).toBe(true);
      expect(el.hasAttribute('no-fade-trigger')).toBe(true);

      el.noFadeTrigger = false;
      await elementUpdated(el);
      expect(el.hasAttribute('no-fade-trigger')).toBe(false);
    });

    it('default rendering still matches the existing structural contract', async () => {
      // The fade visual is pure CSS — the rendered DOM is identical
      // whether or not the fade-and-overlay treatment is active.
      // Asserting that locks in: the new default doesn't add stray
      // elements or change slot-routing.
      const el = await fixture<CivReadMore>(`
        <civ-read-more>
          <p>Teaser</p>
          <div data-rest><p>Rest</p></div>
        </civ-read-more>
      `);
      expect(el.querySelector('.civ-read-more__teaser')).not.toBeNull();
      expect(el.querySelector('.civ-read-more__rest')).not.toBeNull();
      expect(el.querySelector('.civ-read-more__trigger')).not.toBeNull();
      // No extra wrapper elements introduced by the fade default
      expect(el.querySelectorAll('.civ-read-more__teaser').length).toBe(1);
      expect(el.querySelectorAll('.civ-read-more__trigger').length).toBe(1);
    });
  });

  it('renders in light DOM (no shadow root)', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    expect(el.shadowRoot).toBeNull();
  });

  it('works when there is no rest content (graceful single-slot use)', async () => {
    // The component is useful even with no rest content (e.g. a hint
    // gets added dynamically later); the trigger should still render
    // and clicking it shouldn't error.
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Just a teaser</p></civ-read-more>
    `);
    const button = el.querySelector('button')!;
    expect(() => button.click()).not.toThrow();
  });
});
