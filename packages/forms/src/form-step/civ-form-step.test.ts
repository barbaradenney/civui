import { describe, it, expect, afterEach } from 'vitest';
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

  it('shows progress indicator', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    const progress = el.querySelector('[aria-live="polite"]');
    expect(progress).not.toBeNull();
    expect(progress!.textContent).toContain('Step 1 of 3');
  });

  it('hides back button on first step', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    const buttons = el.querySelectorAll('button');
    // Only continue button should be visible (back is a span placeholder)
    const backBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'Back');
    expect(backBtn).toBeUndefined();
  });

  it('shows back button on second step', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    el.goToStep(1);
    await elementUpdated(el);
    const backBtn = Array.from(el.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Back');
    expect(backBtn).not.toBeUndefined();
  });

  it('fires civ-step-continue on continue click', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    let detail: any = null;
    el.addEventListener('civ-step-continue', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const continueBtn = Array.from(el.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Continue')!;
    continueBtn.click();
    expect(detail).not.toBeNull();
    expect(detail.from).toBe(0);
    expect(detail.to).toBe(1);
  });

  it('fires civ-step-complete on last step continue', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    el.goToStep(2);
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-step-complete', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const saveBtn = Array.from(el.querySelectorAll('button')).find(b => b.textContent?.includes('Save'))!;
    saveBtn.click();
    expect(detail).not.toBeNull();
    expect(detail.total).toBe(3);
  });

  it('fires civ-step-back on back click', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    el.goToStep(1);
    await elementUpdated(el);

    let detail: any = null;
    el.addEventListener('civ-step-back', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);

    const backBtn = Array.from(el.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Back')!;
    backBtn.click();
    expect(detail).not.toBeNull();
    expect(detail.from).toBe(1);
    expect(detail.to).toBe(0);
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

  it('disables buttons when navDisabled is true', async () => {
    const el = await fixture<CivFormStep>(threeSteps) as CivFormStep;
    el.goToStep(1);
    (el as any).navDisabled = true;
    await elementUpdated(el);
    const buttons = el.querySelectorAll('button');
    for (const btn of buttons) {
      expect(btn.disabled).toBe(true);
    }
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    expect(el.shadowRoot).toBeNull();
  });
});
