import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-bulk-actions.js';

afterEach(cleanupFixtures);

describe('civ-bulk-actions', () => {
  it('hides the bar when count is 0', async () => {
    const el = await fixture('<civ-bulk-actions count="0"></civ-bulk-actions>');
    const bar = el.querySelector('.civ-bulk-actions') as HTMLElement;
    expect(bar.hasAttribute('hidden')).toBe(true);
  });

  it('shows the bar when count > 0', async () => {
    const el = await fixture('<civ-bulk-actions count="3"></civ-bulk-actions>');
    const bar = el.querySelector('.civ-bulk-actions') as HTMLElement;
    expect(bar.hasAttribute('hidden')).toBe(false);
  });

  it('renders pluralized status text for count > 1', async () => {
    const el = await fixture('<civ-bulk-actions count="3" item-name="application"></civ-bulk-actions>');
    const status = el.querySelector('.civ-bulk-actions__status') as HTMLElement;
    expect(status.textContent).toContain('3');
    expect(status.textContent).toContain('applications');
  });

  it('renders singular status text for count === 1', async () => {
    const el = await fixture('<civ-bulk-actions count="1" item-name="application"></civ-bulk-actions>');
    const status = el.querySelector('.civ-bulk-actions__status') as HTMLElement;
    expect(status.textContent).toContain('1');
    expect(status.textContent).toContain('application');
    expect(status.textContent).not.toContain('applications');
  });

  it('uses itemNamePlural override when set', async () => {
    const el = await fixture('<civ-bulk-actions count="3" item-name="entry" item-name-plural="entries"></civ-bulk-actions>');
    const status = el.querySelector('.civ-bulk-actions__status') as HTMLElement;
    expect(status.textContent).toContain('entries');
    expect(status.textContent).not.toContain('entrys');
  });

  it('renders a default Clear button label', async () => {
    const el = await fixture('<civ-bulk-actions count="2"></civ-bulk-actions>');
    const clearBtn = el.querySelector('.civ-bulk-actions__clear') as any;
    expect(clearBtn).not.toBeNull();
    expect(clearBtn.label).toBeTruthy();
  });

  it('uses the clearLabel override when provided', async () => {
    const el = await fixture('<civ-bulk-actions count="2" clear-label="Deselect all"></civ-bulk-actions>') as any;
    const clearBtn = el.querySelector('.civ-bulk-actions__clear') as any;
    expect(clearBtn.label).toBe('Deselect all');
  });

  it('fires civ-clear-selection when Clear is clicked', async () => {
    const el = await fixture('<civ-bulk-actions count="2"></civ-bulk-actions>');
    const handler = vi.fn();
    el.addEventListener('civ-clear-selection', handler);

    const clearBtn = el.querySelector('.civ-bulk-actions__clear button') as HTMLButtonElement;
    clearBtn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('relocates default-slotted action buttons into the actions container', async () => {
    const el = await fixture(`
      <civ-bulk-actions count="2">
        <button data-testid="archive">Archive</button>
        <button data-testid="delete">Delete</button>
      </civ-bulk-actions>
    `);
    await elementUpdated(el);
    const actions = el.querySelector('.civ-bulk-actions__actions');
    expect(actions?.querySelector('[data-testid="archive"]')).not.toBeNull();
    expect(actions?.querySelector('[data-testid="delete"]')).not.toBeNull();
  });

  it('keeps slotted action buttons in the DOM when count transitions to 0', async () => {
    const el = await fixture(`
      <civ-bulk-actions count="2">
        <button data-testid="archive">Archive</button>
      </civ-bulk-actions>
    `) as any;
    await elementUpdated(el);

    el.count = 0;
    await elementUpdated(el);

    // Bar is hidden but the action button still exists so it doesn't disappear
    // from the DOM during selection transitions.
    expect(el.querySelector('[data-testid="archive"]')).not.toBeNull();
    expect(el.querySelector('.civ-bulk-actions')?.hasAttribute('hidden')).toBe(true);
  });

  it('updates the status text reactively when count changes', async () => {
    const el = await fixture('<civ-bulk-actions count="1" item-name="row"></civ-bulk-actions>') as any;
    const status = el.querySelector('.civ-bulk-actions__status') as HTMLElement;
    expect(status.textContent).toContain('1 row');

    el.count = 5;
    await elementUpdated(el);
    expect(status.textContent).toContain('5 rows');
  });

  it('uses Light DOM', async () => {
    const el = await fixture('<civ-bulk-actions count="0"></civ-bulk-actions>');
    expect(el.shadowRoot).toBeNull();
  });

  it('exposes role="region" with aria-live="polite"', async () => {
    const el = await fixture('<civ-bulk-actions count="2"></civ-bulk-actions>');
    const bar = el.querySelector('.civ-bulk-actions') as HTMLElement;
    expect(bar.getAttribute('role')).toBe('region');
    expect(bar.getAttribute('aria-live')).toBe('polite');
  });
});
