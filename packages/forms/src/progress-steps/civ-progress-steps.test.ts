import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-progress-steps.js';

afterEach(cleanupFixtures);

describe('civ-progress-steps', () => {
  const threeSteps = '["Personal Info","Address","Review"]';

  it('renders an ordered list with role="list"', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const ol = el.querySelector('ol[role="list"]');
    expect(ol).not.toBeNull();
    expect(ol!.getAttribute('aria-label')).toBe('Progress');
  });

  it('renders correct number of steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const items = el.querySelectorAll('li');
    expect(items.length).toBe(3);
  });

  it('marks the current step with aria-current="step"', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="1"></civ-progress-steps>`);

    const items = el.querySelectorAll('li');
    expect(items[0].getAttribute('aria-current')).toBeNull();
    expect(items[1].getAttribute('aria-current')).toBe('step');
    expect(items[2].getAttribute('aria-current')).toBeNull();
  });

  it('applies correct CSS classes for step states', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="1"></civ-progress-steps>`);

    const items = el.querySelectorAll('li');
    expect(items[0].classList.contains('civ-step--completed')).toBe(true);
    expect(items[1].classList.contains('civ-step--current')).toBe(true);
    expect(items[2].classList.contains('civ-step--upcoming')).toBe(true);
  });

  it('renders step labels as aria-label on each li', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const items = el.querySelectorAll('li');
    expect(items[0].getAttribute('aria-label')).toBe('Step 1 of 3: Personal Info');
    expect(items[1].getAttribute('aria-label')).toBe('Step 2 of 3: Address');
    expect(items[2].getAttribute('aria-label')).toBe('Step 3 of 3: Review');
  });

  it('shows checkmark icon for completed steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="2"></civ-progress-steps>`);

    const completedSteps = el.querySelectorAll('.civ-step--completed');
    expect(completedSteps.length).toBe(2);
    for (const step of completedSteps) {
      expect(step.querySelector('.civ-icon--check')).not.toBeNull();
    }
  });

  it('shows step number for current and upcoming steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const circles = el.querySelectorAll('.civ-step-circle');
    expect(circles[0].textContent?.trim()).toBe('1');
    expect(circles[1].textContent?.trim()).toBe('2');
    expect(circles[2].textContent?.trim()).toBe('3');
  });

  it('renders connectors between steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const connectors = el.querySelectorAll('.civ-step-connector');
    // 2 connectors for 3 steps
    expect(connectors.length).toBe(2);
  });

  it('updates when current step changes dynamically', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`) as any;

    el.current = 2;
    await elementUpdated(el);

    const items = el.querySelectorAll('li');
    expect(items[0].classList.contains('civ-step--completed')).toBe(true);
    expect(items[1].classList.contains('civ-step--completed')).toBe(true);
    expect(items[2].classList.contains('civ-step--current')).toBe(true);
  });

  it('uses Light DOM (no shadowRoot)', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('ol')).not.toBeNull();
  });

  it('renders nothing for empty steps', async () => {
    const el = await fixture('<civ-progress-steps steps="[]" current="0"></civ-progress-steps>');
    await elementUpdated(el);

    const ol = el.querySelector('ol');
    expect(ol).toBeNull();
  });

  it('supports vertical orientation', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="1" orientation="vertical"></civ-progress-steps>`);

    const ol = el.querySelector('ol');
    expect(ol!.className).toContain('civ-flex-col');
  });
});
