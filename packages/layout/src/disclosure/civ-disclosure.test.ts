import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-disclosure.js';
import type { CivDisclosure } from './civ-disclosure.js';

afterEach(cleanupFixtures);

describe('civ-disclosure', () => {
  it('renders a details/summary pair', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure>Reason text</civ-disclosure>');
    const details = el.querySelector('details');
    const summary = el.querySelector('summary');
    expect(details).not.toBeNull();
    expect(summary).not.toBeNull();
  });

  it('defaults to closed', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure>Text</civ-disclosure>');
    expect(el.open).toBe(false);
    expect(el.querySelector('details')!.open).toBe(false);
  });

  it('renders the default "Why we ask?" label when none is set', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure>Text</civ-disclosure>');
    const summary = el.querySelector('summary')!;
    expect(summary.textContent).toContain('Why we ask?');
  });

  it('renders a custom label', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure label="What is this?">Text</civ-disclosure>');
    const summary = el.querySelector('summary')!;
    expect(summary.textContent).toContain('What is this?');
  });

  it('renders the info icon by default', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure>Text</civ-disclosure>');
    const icon = el.querySelector('civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('info');
  });

  it('renders no icon when icon attribute is empty', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure icon="">Text</civ-disclosure>');
    const icon = el.querySelector('civ-icon');
    expect(icon).toBeNull();
  });

  it('opens when the open attribute is set', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure open>Text</civ-disclosure>');
    expect(el.open).toBe(true);
    expect(el.querySelector('details')!.open).toBe(true);
  });

  it('reflects the open property to the host attribute', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure>Text</civ-disclosure>');
    el.open = true;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('dispatches civ-toggle when the user toggles', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure>Text</civ-disclosure>');
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    const details = el.querySelector('details')!;
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.open).toBe(true);
    expect(el.open).toBe(true);
  });

  it('does not redispatch civ-toggle when state is already in sync', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure open>Text</civ-disclosure>');
    const handler = vi.fn();
    el.addEventListener('civ-toggle', handler as EventListener);

    const details = el.querySelector('details')!;
    details.dispatchEvent(new Event('toggle'));
    await elementUpdated(el);

    expect(handler).not.toHaveBeenCalled();
  });

  it('content slot is rendered in light DOM', async () => {
    const el = await fixture<CivDisclosure>(
      '<civ-disclosure><p>Why we collect this</p></civ-disclosure>'
    );
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('p')!.textContent).toBe('Why we collect this');
  });

  it('relies on native details/summary semantics — no manual aria-controls', async () => {
    // Native <details>/<summary> exposes the expand/collapse relationship
    // intrinsically; adding aria-controls is redundant and not announced
    // by every screen reader. Asserting the absence locks the choice.
    const el = await fixture<CivDisclosure>('<civ-disclosure>Text</civ-disclosure>');
    const summary = el.querySelector('summary')!;
    expect(summary.hasAttribute('aria-controls')).toBe(false);
  });

  it('applies sm size class', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure size="sm">Text</civ-disclosure>');
    const trigger = el.querySelector('.civ-disclosure__trigger')!;
    expect(trigger.classList.contains('civ-text-sm')).toBe(true);
  });

  it('falls back to the locale-aware default when label is cleared', async () => {
    const el = await fixture<CivDisclosure>('<civ-disclosure label="Custom prompt">Text</civ-disclosure>');
    expect(el.querySelector('summary')!.textContent).toContain('Custom prompt');

    el.label = '';
    await elementUpdated(el);
    expect(el.querySelector('summary')!.textContent).toContain('Why we ask?');
  });
});
