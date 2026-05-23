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

  it('dispatches civ-toggle on toggle, non-bubbling', async () => {
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

  it('does not redispatch when state is already in sync', async () => {
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

  it('reverts toggle attempts when disabled', async () => {
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

  it('relies on native details/summary — no aria-controls or aria-expanded', async () => {
    const el = await fixture<CivAccordionItem>(
      '<civ-accordion-item label="X">Body</civ-accordion-item>'
    );
    const summary = el.querySelector('summary')!;
    expect(summary.hasAttribute('aria-controls')).toBe(false);
    expect(summary.hasAttribute('aria-expanded')).toBe(false);
  });
});
