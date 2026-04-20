import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-progress-steps.js';

afterEach(cleanupFixtures);

describe('civ-progress-steps', () => {
  const threeSteps = '["Personal Info","Address","Review"]';

  it('renders an ordered list with role="list" inside a nav', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const nav = el.querySelector('nav');
    expect(nav).not.toBeNull();
    const ol = el.querySelector('ol[role="list"]');
    expect(ol).not.toBeNull();
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

  it('renders step labels in aria-label', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const items = el.querySelectorAll('li');
    expect(items[0].getAttribute('aria-label')).toContain('Personal Info');
    expect(items[1].getAttribute('aria-label')).toContain('Address');
    expect(items[2].getAttribute('aria-label')).toContain('Review');
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

  it('renders horizontal connectors between steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="0"></civ-progress-steps>`);

    const connectors = el.querySelectorAll('.civ-step-connector--horizontal');
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
    expect(ol!.className).toContain('civ-steps-vertical');
  });

  it('supports rich step objects with descriptions', async () => {
    const richSteps = '[{"label":"Info","description":"Basic details"},{"label":"Review"}]';
    const el = await fixture(`<civ-progress-steps steps='${richSteps}' current="0"></civ-progress-steps>`);

    expect(el.textContent).toContain('Basic details');
  });

  it('shows error state on specified steps', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="2" error-steps="[1]"></civ-progress-steps>`);

    const items = el.querySelectorAll('li');
    expect(items[1].classList.contains('civ-step--error')).toBe(true);
    expect(items[1].querySelector('.civ-icon--close')).not.toBeNull();
  });

  it('shows step counter when show-counter is set', async () => {
    const el = await fixture(`<civ-progress-steps steps='${threeSteps}' current="1" show-counter></civ-progress-steps>`);

    expect(el.textContent).toContain('2');
    expect(el.textContent).toContain('3');
    const counter = el.querySelector('.civ-wizard-nav__counter');
    expect(counter).not.toBeNull();
  });
});
