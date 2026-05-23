import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-accordion-item.js';
import type { CivAccordionItem } from './civ-accordion-item.js';

afterEach(cleanupFixtures);

describe('civ-accordion-item', () => {
  it('renders a details/summary pair with a chevron caret', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="Eligibility">Content</civ-accordion-item>'
    );
    expect(el.querySelector('details')).not.toBeNull();
    expect(el.querySelector('summary')).not.toBeNull();
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('chevron-right');
  });

  it('defaults to closed and renders the label in a span', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="Hello">Body</civ-accordion-item>'
    );
    expect(el.open).toBe(false);
    expect(el.querySelector('details')!.open).toBe(false);
    const label = el.querySelector('.civ-accordion-item__label')!;
    expect(label.tagName).toBe('SPAN');
    expect(label.textContent).toBe('Hello');
  });

  it('opens when the open attribute is set', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item open label="Hello">Body</civ-accordion-item>'
    );
    expect(el.open).toBe(true);
    expect(el.querySelector('details')!.open).toBe(true);
  });

  it('reflects open and disabled to host attributes', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    el.open = true;
    el.disabled = true;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  it('relocates slotted content INSIDE the <details> wrapper', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X"><p data-test="content">Hidden</p></civ-accordion-item>'
    );
    const p = el.querySelector('[data-test="content"]')!;
    const details = el.querySelector('details')!;
    const contentDiv = el.querySelector('.civ-accordion-item__content')!;
    expect(details.contains(p)).toBe(true);
    expect(contentDiv.contains(p)).toBe(true);
  });

  it('dispatches civ-toggle on user-initiated toggle, non-bubbling', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    const local = vi.fn();
    const ancestor = vi.fn();
    el.addEventListener('civ-toggle', local as EventListener);
    document.body.addEventListener('civ-toggle', ancestor as EventListener);

    const details = el.querySelector('details')!;
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(el);

    expect(local).toHaveBeenCalledTimes(1);
    const event = local.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
    expect(event.bubbles).toBe(false);
    expect(ancestor).not.toHaveBeenCalled();
    expect(el.open).toBe(true);

    document.body.removeEventListener('civ-toggle', ancestor as EventListener);
  });

  it('dispatches civ-accordion-item-toggle that bubbles to ancestors', async () => {
    // Internal coordination event — the parent <civ-accordion> uses it
    // to drive single-open mode. Must bubble so an ancestor listener
    // can pick it up.
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    const ancestor = vi.fn();
    document.body.addEventListener('civ-accordion-item-toggle', ancestor as EventListener);

    const details = el.querySelector('details')!;
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(el);

    expect(ancestor).toHaveBeenCalledTimes(1);
    const event = ancestor.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
    expect(event.bubbles).toBe(true);

    document.body.removeEventListener('civ-accordion-item-toggle', ancestor as EventListener);
  });

  it('dispatches civ-toggle when open is changed programmatically', async () => {
    // Regression: previously only the native-toggle path dispatched
    // civ-toggle. Parent-driven single-mode closes (which set
    // `item.open = false` programmatically) would silently fire a
    // native toggle, hit the equality guard, and skip dispatch —
    // consumers tracking open state via civ-toggle would miss the
    // close. The new design routes all dispatch through `updated()`
    // so user-clicks and programmatic changes both fire the event.
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    el.open = true;
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
    expect(el.open).toBe(true);
    expect(el.querySelector('details')!.open).toBe(true);
  });

  it('does not dispatch civ-toggle on initial mount when open is set via attribute', async () => {
    // The `changes.get('open') === undefined` guard in `updated()`
    // distinguishes initial attribute-driven state from later
    // transitions. Without it, every accordion item with `open` in
    // the markup would fire civ-toggle on mount, leaking state-change
    // events into analytics for un-changed state.
    const handler = vi.fn();
    document.body.addEventListener('civ-toggle', handler as EventListener);
    await fixture<CivAccordionItem>('<civ-accordion-item open label="X">Body</civ-accordion-item>');
    expect(handler).not.toHaveBeenCalled();
    document.body.removeEventListener('civ-toggle', handler as EventListener);
  });

  it('does not redispatch when state is already in sync', async () => {
    // The native <details> toggle event can fire when an attribute
    // change matches the existing open state (e.g. Lit applying the
    // initial value). The `_onToggle` early-return prevents the
    // setter from being called redundantly.
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item open label="X">Body</civ-accordion-item>'
    );
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    const details = el.querySelector('details')!;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(el);

    expect(handler).not.toHaveBeenCalled();
  });

  it('reverts user-click toggle attempts when disabled', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item disabled label="X">Body</civ-accordion-item>'
    );
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    const details = el.querySelector('details')!;
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(el);

    expect(el.open).toBe(false);
    expect(details.open).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects programmatic open changes when disabled', async () => {
    // Regression: previously `el.open = true` while disabled would
    // succeed because the disabled-revert path in `_onToggle` only
    // ran when `details.open !== this.open`, and Lit syncs them
    // before the handler fires. The new design gates in the setter.
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item disabled label="X">Body</civ-accordion-item>'
    );
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    el.open = true;
    await elementUpdated(el);

    expect(el.open).toBe(false);
    expect(el.querySelector('details')!.open).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('respects authored markup `<civ-accordion-item disabled open>` on first paint', async () => {
    // The disabled gate only kicks in AFTER firstUpdated. Initial
    // attribute-driven state must paint as authored — a consumer who
    // ships a disabled-but-open section gets exactly what they wrote.
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item disabled open label="X">Body</civ-accordion-item>'
    );
    expect(el.disabled).toBe(true);
    expect(el.open).toBe(true);
    expect(el.querySelector('details')!.open).toBe(true);
  });

  it('disabled summary has aria-disabled and tabindex="-1"', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item disabled label="X">Body</civ-accordion-item>'
    );
    const summary = el.querySelector('summary')!;
    expect(summary.getAttribute('aria-disabled')).toBe('true');
    expect(summary.getAttribute('tabindex')).toBe('-1');
  });

  it('enabled summary omits aria-disabled and tabindex', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    const summary = el.querySelector('summary')!;
    expect(summary.hasAttribute('aria-disabled')).toBe(false);
    // Native <summary> is already in the tab order; we don't add
    // a redundant tabindex="0".
    expect(summary.hasAttribute('tabindex')).toBe(false);
  });

  it.each([1, 2, 3, 4, 5, 6] as const)(
    'wraps the label in an h%i when heading-level is set',
    async (level) => {
      const el = await fixture<CivAccordionItem>(
        `<civ-accordion-item heading-level="${level}" label="X">Body</civ-accordion-item>`
      );
      const heading = el.querySelector(`h${level}.civ-accordion-item__label`);
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toBe('X');
      expect(el.querySelector('span.civ-accordion-item__label')).toBeNull();
    }
  );

  it('renders the label in a span when heading-level is unset', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    expect(el.querySelector('span.civ-accordion-item__label')).not.toBeNull();
    for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      expect(el.querySelector(tag)).toBeNull();
    }
  });

  it.each([0, 7, -1])(
    'warns and falls back to span when heading-level=%i is out of range',
    async (level) => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const el = await fixture<CivAccordionItem>(
        `<civ-accordion-item heading-level="${level}" label="X">Body</civ-accordion-item>`
      );
      expect(el.querySelector('span.civ-accordion-item__label')).not.toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      const warningMessage = warnSpy.mock.calls.map((c) => c[0]).join(' ');
      expect(warningMessage).toContain('civ-accordion-item');
      expect(warningMessage).toContain('heading-level');
      warnSpy.mockRestore();
    }
  );

  it('relies on native details/summary — no aria-controls or aria-expanded', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    const summary = el.querySelector('summary')!;
    expect(summary.hasAttribute('aria-controls')).toBe(false);
    expect(summary.hasAttribute('aria-expanded')).toBe(false);
  });
});
