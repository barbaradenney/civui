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
    expect(el.expanded).toBe(false);
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

    expect(el.expanded).toBe(true);
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

    el.expanded = true;
    await elementUpdated(el);
    expect(button.textContent).toContain('Read less');
  });

  it('honors custom moreLabel / lessLabel overrides', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more more-label="Show details" less-label="Hide details">
        <p>Teaser</p>
      </civ-read-more>
    `);
    const button = el.querySelector('button')!;
    expect(button.textContent).toContain('Show details');

    el.expanded = true;
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

  it('dispatches civ-toggle with { expanded } on user toggle', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    el.querySelector('button')!.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.expanded).toBe(true);
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

  it('renders with expanded=true from the attribute', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more expanded>
        <p>Teaser</p>
        <div data-rest><p>Rest</p></div>
      </civ-read-more>
    `);
    expect(el.expanded).toBe(true);
    const rest = el.querySelector('.civ-read-more__rest') as HTMLElement;
    expect(rest.hasAttribute('hidden')).toBe(false);
    expect(el.querySelector('button')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('reflects the expanded property back to the host attribute', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    el.expanded = true;
    await elementUpdated(el);
    expect(el.hasAttribute('expanded')).toBe(true);
  });

  it('applies the shared toggle-button sm size class', async () => {
    const el = await fixture<CivReadMore>(`
      <civ-read-more size="sm"><p>Teaser</p></civ-read-more>
    `);
    const trigger = el.querySelector('.civ-read-more__trigger')!;
    expect(trigger.classList.contains('civ-toggle-btn--sm')).toBe(true);
  });

  it('composes the shared civ-toggle-btn class on the trigger', async () => {
    // The disclosure family (civ-disclosure, civ-read-more, future
    // siblings) all share the same secondary-button palette via the
    // `civ-toggle-btn` utility. Asserting the class is present locks
    // the composition — a refactor that removed it would silently
    // strip the palette.
    const el = await fixture<CivReadMore>(`
      <civ-read-more><p>Teaser</p></civ-read-more>
    `);
    const trigger = el.querySelector('.civ-read-more__trigger')!;
    expect(trigger.classList.contains('civ-toggle-btn')).toBe(true);
  });

  it('chevron icon matches the expanded-state rotation selector', async () => {
    // Locks the CSS contract: the rule
    // `civ-read-more[expanded] > .civ-read-more__trigger > civ-icon[name='chevron-down']`
    // depends on (1) the host carrying the `expanded` attribute via
    // reflection, (2) the trigger being a direct child of the host,
    // and (3) the icon being a direct child of the trigger with the
    // exact name. If any of those drift, the selector silently stops
    // matching and the chevron freezes. (The host is selected by
    // tag, not class — unlike civ-disclosure, the host itself is
    // the structural wrapper, so there's no nested element to carry
    // a `.civ-read-more` class.)
    const el = await fixture<CivReadMore>(`
      <civ-read-more icon="chevron-down" expanded><p>Teaser</p></civ-read-more>
    `);
    const icon = el.querySelector('civ-icon')!;
    expect(icon.matches(
      'civ-read-more[expanded] > .civ-read-more__trigger > civ-icon[name="chevron-down"]'
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

    it('swaps the button chrome for the inline trigger class', async () => {
      // Inline drops the `civ-toggle-btn` palette and adds the
      // `--inline` modifier so CSS can collapse padding/background
      // and turn the trigger into underlined inline emphasis.
      const el = await fixture<CivReadMore>(`
        <civ-read-more inline>Teaser text.</civ-read-more>
      `);
      const trigger = el.querySelector('.civ-read-more__trigger')!;
      expect(trigger.classList.contains('civ-toggle-btn')).toBe(false);
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
