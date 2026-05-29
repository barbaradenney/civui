import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import { cleanupLiveRegions } from '@civui/core';
import './civ-progress-steps.js';

afterEach(() => {
  cleanupFixtures();
  cleanupLiveRegions();
});

describe('civ-progress-steps', () => {
  const threeSteps = '["Personal Info","Address","Review"]';
  // The announce queue waits QUEUE_DELAY (150ms) + a frame before writing
  // the live-region text.
  const flushAnnounce = () => new Promise<void>((r) => setTimeout(r, 250));

  it('renders segments for each step', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments.length).toBe(3);
  });

  it('announces step changes by default', async () => {
    const el = await fixture<HTMLElement & { current: number }>(
      `<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`,
    );
    await elementUpdated(el);
    el.current = 1;
    await elementUpdated(el);
    await flushAnnounce();
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain('Step 2 of 3');
  });

  it('suppresses the announcement when silent is set', async () => {
    const el = await fixture<HTMLElement & { current: number }>(
      `<civ-progress-steps steps='${threeSteps}' current="0" silent></civ-progress-steps>`,
    );
    await elementUpdated(el);
    el.current = 1;
    await elementUpdated(el);
    await flushAnnounce();
    // No announcement fired, so no step text reaches the live region.
    expect(document.querySelector('[aria-live="polite"]')?.textContent ?? '').not.toContain('Step 2 of 3');
  });

  it('renders a labelled list of steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    // role="list" (matches the schema's a11y.role) so the role="listitem"
    // segments are validly contained.
    const list = el.querySelector('[role="list"]');
    expect(list).not.toBeNull();
    expect(list!.getAttribute('aria-label')).toBeTruthy();
    const items = el.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(3);
  });

  it('marks completed segments', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="2"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[0].classList.contains('civ-progress-segment--completed')).toBe(true);
    expect(segments[1].classList.contains('civ-progress-segment--completed')).toBe(true);
    expect(segments[2].classList.contains('civ-progress-segment--current')).toBe(true);
  });

  it('marks current segment', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="1"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[1].classList.contains('civ-progress-segment--current')).toBe(true);
    expect(segments[1].getAttribute('aria-current')).toBe('step');
  });

  it('leaves upcoming segments unstyled', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[1].classList.contains('civ-progress-segment--completed')).toBe(false);
    expect(segments[1].classList.contains('civ-progress-segment--current')).toBe(false);
    expect(segments[2].classList.contains('civ-progress-segment--completed')).toBe(false);
  });

  it('sets aria-label with step label on each segment', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[0].getAttribute('aria-label')).toContain('Personal Info');
    expect(segments[1].getAttribute('aria-label')).toContain('Address');
    expect(segments[2].getAttribute('aria-label')).toContain('Review');
  });

  it('shows error state on specified steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="2" error-steps="[1]"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[1].classList.contains('civ-progress-segment--error')).toBe(true);
    // Error overrides completed
    expect(segments[1].classList.contains('civ-progress-segment--completed')).toBe(false);
  });


  it('updates when current step changes', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`) as any;

    el.current = 2;
    await elementUpdated(el);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[0].classList.contains('civ-progress-segment--completed')).toBe(true);
    expect(segments[1].classList.contains('civ-progress-segment--completed')).toBe(true);
    expect(segments[2].classList.contains('civ-progress-segment--current')).toBe(true);
  });

  it('renders nothing for empty steps', async () => {
    const el = await fixture('<civ-progress-steps steps="[]" current="0"></civ-progress-steps>');
    await elementUpdated(el);

    expect(el.querySelector('.civ-progress-segments')).toBeNull();
  });

  it('renders completed segments as buttons when clickable', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="2" clickable></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[0].tagName).toBe('BUTTON');
    expect(segments[1].tagName).toBe('BUTTON');
    // Current step is not a button
    expect(segments[2].tagName).toBe('DIV');
  });

  it('fires civ-step-click when a clickable segment is clicked', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="2" clickable></civ-progress-steps>`);

    const handler = vi.fn();
    el.addEventListener('civ-step-click', handler as EventListener);

    const btn = el.querySelector('button.civ-progress-segment') as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.step).toBe(0);
  });

  it('uses Light DOM', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('.civ-progress-segments')).not.toBeNull();
  });

  it('supports string step labels', async () => {
    const el = await fixture('<civ-progress-steps steps=\'["A","B"]\' current="0"></civ-progress-steps>');

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments.length).toBe(2);
    expect(segments[0].getAttribute('aria-label')).toContain('A');
  });

  it('supports object step labels', async () => {
    const el = await fixture('<civ-progress-steps steps=\'[{"label":"Step A"},{"label":"Step B"}]\' current="0"></civ-progress-steps>');

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments[0].getAttribute('aria-label')).toContain('Step A');
  });

});
