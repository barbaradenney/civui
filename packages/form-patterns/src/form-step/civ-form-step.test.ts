import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-form-step.js';
import type { CivFormStep } from './civ-form-step.js';

afterEach(cleanupFixtures);

describe('civ-form-step', () => {
  const threeSteps = `
    <civ-form-step>
      <div data-step-label="Step 1"><p>Content 1</p></div>
      <div data-step-label="Step 2"><p>Content 2</p></div>
      <div data-step-label="Step 3"><p>Content 3</p></div>
    </civ-form-step>
  `;

  it('renders with first step visible', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    expect(el.current).toBe(0);
    expect(el.total).toBe(3);
  });

  it('shows step counter', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    const counter = el.querySelector('.civ-wizard-nav__counter');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('1');
    expect(counter!.textContent).toContain('3');
  });

  it('hides nav bar for single step', async () => {
    const el = await fixture(`
      <civ-form-step>
        <div data-step-label="Only"><p>Only step</p></div>
      </civ-form-step>
    `);
    expect(el.querySelector('civ-progress-steps')).toBeNull();
  });

  it('fires civ-step-continue on continue click', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    let detail: any = null;
    el.addEventListener('civ-step-continue', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const btn = el.querySelector('civ-button') as HTMLElement;
    btn.click();
    expect(detail).not.toBeNull();
    expect(detail.from).toBe(0);
    expect(detail.to).toBe(1);
  });

  it('fires civ-step-complete on last step', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    el.goToStep(2);
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-step-complete', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const btn = el.querySelector('civ-button') as HTMLElement;
    btn.click();
    expect(detail).not.toBeNull();
    expect(detail.total).toBe(3);
  });

  it('goToStep navigates and fires civ-step-change', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    let detail: any = null;
    el.addEventListener('civ-step-change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    el.goToStep(2);
    expect(detail.current).toBe(2);
    expect(detail.label).toBe('Step 3');
  });

  it('exposes currentLabel', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    expect(el.currentLabel).toBe('Step 1');
    el.goToStep(1);
    expect(el.currentLabel).toBe('Step 2');
  });

  it('blocks advancement when required field is empty', async () => {
    const el = await fixture(`
      <civ-form-step>
        <div data-step-label="Name">
          <civ-text-input label="Full name" name="name" required></civ-text-input>
        </div>
        <div data-step-label="Email">
          <civ-text-input label="Email" name="email"></civ-text-input>
        </div>
      </civ-form-step>
    `);

    // Click Continue without filling in
    const btn = el.querySelector('civ-button') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    // Should still be on step 1
    expect((el as CivFormStep).current).toBe(0);
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    expect(el.shadowRoot).toBeNull();
  });

  it('renders pause link when show-pause is set', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step show-pause>
        <div data-step-label="One"><p>Content</p></div>
        <div data-step-label="Two"><p>Content</p></div>
      </civ-form-step>
    `);
    await elementUpdated(el);
    expect(el.querySelector('[data-civ-step-pause]')).not.toBeNull();
  });

  it('renders pause link when step is marked sensitive', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step sensitive>
        <div data-step-label="Trauma"><p>Content</p></div>
      </civ-form-step>
    `);
    await elementUpdated(el);
    expect(el.querySelector('[data-civ-step-pause]')).not.toBeNull();
  });

  it('does not render pause link by default', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    expect(el.querySelector('[data-civ-step-pause]')).toBeNull();
  });

  it('fires civ-step-pause with current index and label', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step show-pause>
        <div data-step-label="Your trauma history"><p>Content</p></div>
      </civ-form-step>
    `);
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-step-pause', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const pause = el.querySelector('[data-civ-step-pause]') as HTMLElement;
    pause.click();

    expect(detail).not.toBeNull();
    expect(detail.current).toBe(0);
    expect(detail.label).toBe('Your trauma history');
  });

  it('reflects sensitive attribute on host', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step sensitive>
        <div data-step-label="X"><p>c</p></div>
      </civ-form-step>
    `);
    expect(el.hasAttribute('sensitive')).toBe(true);
  });
});
