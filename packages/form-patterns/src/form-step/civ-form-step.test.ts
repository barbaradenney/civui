import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-form-step.js';
import '@civui/layout/accordion';
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

  it('shows civ-progress-header by default (minimal mode)', async () => {
    const el = await fixture<CivFormStep>(threeSteps);
    // Minimal mode renders civ-progress-header, not civ-progress
    expect(el.querySelector('civ-progress-header')).not.toBeNull();
    expect(el.querySelector('civ-progress-steps')).toBeNull();
    const counter = el.querySelector('.civ-progress-header__counter');
    expect(counter).not.toBeNull();
    expect(counter!.textContent).toContain('1');
    expect(counter!.textContent).toContain('3');
  });

  it('renders civ-progress-steps when progress="steps"', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step progress="steps">
        <div data-step-label="A"><p>a</p></div>
        <div data-step-label="B"><p>b</p></div>
      </civ-form-step>
    `);
    const progress = el.querySelector('civ-progress-steps');
    expect(progress).not.toBeNull();
    const segments = progress!.querySelectorAll('.civ-progress-segment');
    expect(segments.length).toBe(2);
    // The accompanying civ-progress-header announces step changes, so the
    // steps bar is rendered silent to avoid a duplicate screen-reader read.
    expect(progress!.hasAttribute('silent')).toBe(true);
  });

  it('renders civ-progress-percent when progress="bar"', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step progress="bar">
        <div data-step-label="A"><p>a</p></div>
        <div data-step-label="B"><p>b</p></div>
        <div data-step-label="C"><p>c</p></div>
      </civ-form-step>
    `);
    const bar = el.querySelector('civ-progress-percent');
    expect(bar).not.toBeNull();
    expect(bar!.getAttribute('value')).toBe('0'); // step 0 of 3 = 0%
  });

  it('updates progress-bar value on step change', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step progress="bar">
        <div data-step-label="A"><p>a</p></div>
        <div data-step-label="B"><p>b</p></div>
        <div data-step-label="C"><p>c</p></div>
      </civ-form-step>
    `) as CivFormStep;
    el.goToStep(1);
    await elementUpdated(el);
    const bar = el.querySelector('civ-progress-percent');
    expect(Number(bar!.getAttribute('value'))).toBe(33);
  });

  it('hides nav bar for single step', async () => {
    const el = await fixture(`
      <civ-form-step>
        <div data-step-label="Only"><p>Only step</p></div>
      </civ-form-step>
    `);
    expect(el.querySelector('.civ-progress-header__counter')).toBeNull();
  });

  it('hide-nav suppresses all progress modes', async () => {
    for (const mode of ['minimal', 'steps', 'bar']) {
      const el = await fixture<CivFormStep>(`
        <civ-form-step hide-nav progress="${mode}">
          <div data-step-label="A"><p>a</p></div>
          <div data-step-label="B"><p>b</p></div>
        </civ-form-step>
      `);
      expect(el.querySelector('civ-progress-steps')).toBeNull();
      expect(el.querySelector('civ-progress-percent')).toBeNull();
      expect(el.querySelector('.civ-progress-header__counter')).toBeNull();
    }
  });

  it('shows back link on non-first step for all progress modes', async () => {
    for (const mode of ['minimal', 'steps', 'bar']) {
      const el = await fixture<CivFormStep>(`
        <civ-form-step progress="${mode}">
          <div data-step-label="A"><p>a</p></div>
          <div data-step-label="B"><p>b</p></div>
        </civ-form-step>
      `) as CivFormStep;

      // First step — no back link
      expect(el.querySelector('.civ-wizard-nav')).toBeNull();

      // Advance to step 2
      el.goToStep(1);
      await elementUpdated(el);

      // Back link visible
      const nav = el.querySelector('.civ-wizard-nav');
      expect(nav).not.toBeNull();
    }
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

  it('skips required fields hidden inside a closed civ-conditional', async () => {
    // The user can't see hidden-branch fields and shouldn't be blocked
    // by them when advancing the step.
    const el = await fixture(`
      <civ-form-step>
        <div data-step-label="Name">
          <civ-yes-no legend="Have a phone?" name="hasPhone" value="no"></civ-yes-no>
          <div data-civ-conditional-content aria-hidden="true">
            <civ-text-input label="Phone" name="phone" required></civ-text-input>
          </div>
        </div>
        <div data-step-label="Done">
          <p>Done</p>
        </div>
      </civ-form-step>
    `);
    await elementUpdated(el);

    const btn = el.querySelector('civ-button') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    // Hidden required field should not block advance.
    expect((el as CivFormStep).current).toBe(1);
  });

  it('skips required fields inside a collapsed civ-accordion-item', async () => {
    // A collapsed <details>-backed accordion keeps children in the DOM, but
    // the user can't see them — they must not block advancing.
    const el = await fixture(`
      <civ-form-step>
        <div data-step-label="Name">
          <civ-accordion-item label="Optional details">
            <civ-text-input label="Phone" name="phone" required></civ-text-input>
          </civ-accordion-item>
        </div>
        <div data-step-label="Done">
          <p>Done</p>
        </div>
      </civ-form-step>
    `);
    await elementUpdated(el);

    const btn = el.querySelector('civ-button') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    expect((el as CivFormStep).current).toBe(1);
  });

  it('still blocks on a required field inside an OPEN civ-accordion-item', async () => {
    const el = await fixture(`
      <civ-form-step>
        <div data-step-label="Name">
          <civ-accordion-item label="Details" open>
            <civ-text-input label="Phone" name="phone" required></civ-text-input>
          </civ-accordion-item>
        </div>
        <div data-step-label="Done">
          <p>Done</p>
        </div>
      </civ-form-step>
    `);
    await elementUpdated(el);

    const btn = el.querySelector('civ-button') as HTMLElement;
    btn.click();
    await elementUpdated(el);

    // Visible required field blocks advancement.
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

  it('fires civ-step-pause from sensitive step even without explicit show-pause', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step sensitive>
        <div data-step-label="Trauma history"><p>c</p></div>
      </civ-form-step>
    `);
    await elementUpdated(el);

    let fired = false;
    el.addEventListener('civ-step-pause', (() => { fired = true; }) as EventListener);
    const pause = el.querySelector('[data-civ-step-pause]') as HTMLElement;
    pause.click();
    expect(fired).toBe(true);
  });
});

describe('civ-form-step Enter handling', () => {
  afterEach(cleanupFixtures);

  it('Enter inside an input advances to the next step', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="Name">
          <input id="name-input" type="text" />
        </div>
        <div data-step-label="Email">
          <input id="email-input" type="email" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);
    expect(el.current).toBe(0);

    const input = el.querySelector('#name-input') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    await elementUpdated(el);

    expect(el.current).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('Enter on the final step fires civ-step-complete', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="Name">
          <input id="name-input" type="text" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);
    expect(el.current).toBe(0);
    expect(el.total).toBe(1);

    let fired = false;
    el.addEventListener('civ-step-complete', () => { fired = true; });

    const input = el.querySelector('#name-input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await elementUpdated(el);
    expect(fired).toBe(true);
  });

  it('Enter stops propagation so a parent civ-form does not also see it', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="Name">
          <input id="name-input" type="text" />
        </div>
        <div data-step-label="Email">
          <input id="email-input" type="email" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);

    let parentSawIt = false;
    el.parentElement!.addEventListener('keydown', () => { parentSawIt = true; });

    const input = el.querySelector('#name-input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

    expect(parentSawIt).toBe(false);
  });

  it('does not advance when Enter happens inside a textarea', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="Notes">
          <textarea id="notes"></textarea>
        </div>
        <div data-step-label="Done">
          <input id="done" type="text" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);

    const textarea = el.querySelector('#notes') as HTMLTextAreaElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    textarea.dispatchEvent(event);
    await elementUpdated(el);

    expect(el.current).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not advance when Enter happens on a button', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="Action">
          <button type="button" id="btn">Click me</button>
        </div>
        <div data-step-label="Done">
          <input type="text" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);

    const btn = el.querySelector('#btn') as HTMLButtonElement;
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await elementUpdated(el);

    expect(el.current).toBe(0);
  });

  it('does not advance when defaultPrevented (e.g., dialog already handled it)', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="One">
          <input id="i" type="text" />
        </div>
        <div data-step-label="Two">
          <input type="text" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);

    const input = el.querySelector('#i') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    event.preventDefault();
    input.dispatchEvent(event);
    await elementUpdated(el);

    expect(el.current).toBe(0);
  });

  it('does not advance when Enter originates from inside a [role="dialog"]', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="Pick a date">
          <div role="dialog" aria-label="Calendar">
            <button id="day" data-civ-day>15</button>
          </div>
        </div>
        <div data-step-label="Done">
          <input type="text" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);

    const day = el.querySelector('#day') as HTMLElement;
    day.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await elementUpdated(el);

    expect(el.current).toBe(0);
  });

  it('only Enter advances — other keys do not', async () => {
    const el = await fixture<CivFormStep>(`
      <civ-form-step>
        <div data-step-label="One">
          <input id="i" type="text" />
        </div>
        <div data-step-label="Two">
          <input type="text" />
        </div>
      </civ-form-step>
    `) as CivFormStep;
    await elementUpdated(el);

    const input = el.querySelector('#i') as HTMLInputElement;
    for (const key of ['Tab', 'a', 'Escape', ' ']) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
    await elementUpdated(el);
    expect(el.current).toBe(0);
  });
});
