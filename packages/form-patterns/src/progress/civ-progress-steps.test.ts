import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-progress-steps.js';

afterEach(cleanupFixtures);

describe('civ-progress-steps', () => {
  const threeSteps = '["Personal Info","Address","Review"]';

  it('renders segments for each step', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const segments = el.querySelectorAll('.civ-progress-segment');
    expect(segments.length).toBe(3);
  });

  it('renders a group with accessible label', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const group = el.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group!.getAttribute('aria-label')).toBeTruthy();
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

  it('shows counter when show-counter is set', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="1" show-counter></civ-progress-steps>`);

    const counter = el.querySelector('.civ-progress-steps__counter');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('2');
    expect(counter!.textContent).toContain('3');
  });

  it('hides counter by default', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    expect(el.querySelector('.civ-progress-steps__counter')).toBeNull();
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
