import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-confirmation-panel.js';
import type { CivConfirmationPanel } from './civ-confirmation-panel.js';

afterEach(cleanupFixtures);

describe('civ-confirmation-panel', () => {
  it('renders a status region with the heading as accessible name', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Application complete" no-autofocus>
        <p>We have sent a confirmation email.</p>
      </civ-confirmation-panel>
    `);

    const region = el.querySelector('[role="status"]')!;
    expect(region).not.toBeNull();

    const heading = el.querySelector('[role="heading"]')!;
    expect(heading.textContent).toBe('Application complete');
    expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('defaults the heading level to 1', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus></civ-confirmation-panel>
    `);
    const heading = el.querySelector('[role="heading"]')!;
    expect(heading.getAttribute('aria-level')).toBe('1');
  });

  it('honors heading-level override', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" heading-level="2" no-autofocus></civ-confirmation-panel>
    `);
    const heading = el.querySelector('[role="heading"]')!;
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('renders the reference number callout when reference is set', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel
        heading="Done"
        reference="HDJ2-123F"
        no-autofocus
      ></civ-confirmation-panel>
    `);

    const refBlock = el.querySelector('.civ-confirmation-panel__reference')!;
    expect(refBlock).not.toBeNull();
    expect(refBlock.querySelector('.civ-confirmation-panel__reference-value')!.textContent!.trim())
      .toBe('HDJ2-123F');
    expect(refBlock.querySelector('.civ-confirmation-panel__reference-label')!.textContent!.trim())
      .toBe('Reference number');
  });

  it('uses a custom reference label when provided', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel
        heading="Done"
        reference="CASE-9001"
        reference-label="Case number"
        no-autofocus
      ></civ-confirmation-panel>
    `);
    const label = el.querySelector('.civ-confirmation-panel__reference-label')!;
    expect(label.textContent!.trim()).toBe('Case number');
  });

  it('omits the reference callout when reference is empty', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus></civ-confirmation-panel>
    `);
    expect(el.querySelector('.civ-confirmation-panel__reference')).toBeNull();
  });

  it('relocates the pending-reference slot when reference is empty', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus>
        <p data-pending-reference class="pending-marker">
          We will email your reference number within 24 hours.
        </p>
      </civ-confirmation-panel>
    `);
    await elementUpdated(el);

    const pendingTarget = el.querySelector('.civ-confirmation-panel__pending')!;
    const pending = pendingTarget.querySelector('.pending-marker');
    expect(pending).not.toBeNull();
    expect(pending!.textContent!.trim()).toContain('within 24 hours');
  });

  it('reference takes precedence over pending-reference when both are provided', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" reference="REF-1" no-autofocus>
        <p data-pending-reference class="pending-marker">pending</p>
      </civ-confirmation-panel>
    `);
    await elementUpdated(el);

    expect(el.querySelector('.civ-confirmation-panel__reference')).not.toBeNull();
    expect(el.querySelector('.civ-confirmation-panel__pending')).toBeNull();
  });

  it('relocates the default body slot', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus>
        <p class="body-marker">Body copy.</p>
      </civ-confirmation-panel>
    `);
    await elementUpdated(el);

    const body = el.querySelector('.civ-confirmation-panel__body')!;
    expect(body.querySelector('.body-marker')).not.toBeNull();
  });

  it('relocates next-steps and actions slots into their targets', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus>
        <div data-next-steps class="next-marker">
          <h2>What happens next</h2>
        </div>
        <div data-actions class="actions-marker">
          <button type="button">Print</button>
        </div>
      </civ-confirmation-panel>
    `);
    await elementUpdated(el);

    expect(
      el.querySelector('.civ-confirmation-panel__next-steps .next-marker'),
    ).not.toBeNull();
    expect(
      el.querySelector('.civ-confirmation-panel__actions .actions-marker'),
    ).not.toBeNull();
  });

  it('actions container carries the civ-button-row class for mobile stacking', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus></civ-confirmation-panel>
    `);
    const actions = el.querySelector('.civ-confirmation-panel__actions')!;
    expect(actions.classList.contains('civ-button-row')).toBe(true);
  });

  it('renders the success icon inside the header', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus></civ-confirmation-panel>
    `);
    const icon = el.querySelector('.civ-confirmation-panel__header civ-icon');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('name')).toBe('check-circle');
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
  });

  it('focuses the heading on mount unless no-autofocus is set', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done"></civ-confirmation-panel>
    `);
    // queueMicrotask is flushed by awaiting an empty resolution
    await Promise.resolve();
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]') as HTMLElement;
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(heading);
  });

  it('does not move focus when no-autofocus is set', async () => {
    const el = await fixture<CivConfirmationPanel>(`
      <civ-confirmation-panel heading="Done" no-autofocus></civ-confirmation-panel>
    `);
    await Promise.resolve();
    await elementUpdated(el);
    const heading = el.querySelector('[role="heading"]') as HTMLElement;
    expect(heading.hasAttribute('tabindex')).toBe(false);
    expect(document.activeElement).not.toBe(heading);
  });

  it('uses Light DOM', async () => {
    const el = await fixture(
      '<civ-confirmation-panel heading="X" no-autofocus></civ-confirmation-panel>',
    );
    expect(el.shadowRoot).toBeNull();
  });
});
