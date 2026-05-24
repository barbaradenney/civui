import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-repeater.js';
import type { CivRepeater } from './civ-repeater.js';
import {
  getRows,
  getAddButton,
  getRowRemoveButton,
  getRowEditLink,
  rowCount,
} from './repeater-test-helpers.js';

afterEach(cleanupFixtures);

describe('civ-repeater', () => {
  it('renders a fieldset with legend', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent">
        <input type="text" name="firstName" />
      </civ-repeater>
    `);

    const fieldset = el.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Dependents');
  });

  it('renders no rows by default (just the add button)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent">
        <input type="text" name="firstName" />
      </civ-repeater>
    `);

    const rows = getRows(el);
    expect(rows.length).toBe(0);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]');
    expect(addBtn).not.toBeNull();
  });

  it('renders initial rows when min is set', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent" min="1">
        <input type="text" name="firstName" />
      </civ-repeater>
    `);

    const rows = getRows(el);
    expect(rows.length).toBe(1);
  });

  it('renders min rows on init', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="3">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const rows = getRows(el);
    expect(rows.length).toBe(3);
  });

  it('indexes field names with prefix[index].fieldName', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const input = el.querySelector('[data-civ-repeater-row] input')!;
    expect(input.getAttribute('name')).toBe('items[0].val');
  });

  it('adds a row when add button is clicked', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')! as HTMLButtonElement;
    addBtn.click();
    await elementUpdated(el);

    const rows = getRows(el);
    expect(rows.length).toBe(1);
  });

  it('indexes new row fields correctly', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')! as HTMLButtonElement;
    addBtn.click();
    await elementUpdated(el);

    const rows = getRows(el);
    const firstInput = rows[0].querySelector('input')!;
    expect(firstInput.getAttribute('name')).toBe('items[0].val');
  });

  it('fires civ-repeater-add event on add', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    let eventDetail: any = null;
    el.addEventListener('civ-repeater-add', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')! as HTMLButtonElement;
    addBtn.click();

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.index).toBe(0);
  });

  it('moves focus into the new row when added', async () => {
    // Without this, focus stays on the Add button and keyboard users
    // have to Tab back up through the form to reach the new fields.
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);
    document.body.focus();
    el.addRow();
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const newRow = el.querySelectorAll('[data-civ-repeater-row]')[0];
    const firstInput = newRow.querySelector('input');
    expect(document.activeElement).toBe(firstInput);
  });

  it('removes a row and fires civ-repeater-remove', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    // Add a second row
    el.addRow();
    await elementUpdated(el);
    expect(rowCount(el)).toBe(2);

    let eventDetail: any = null;
    el.addEventListener('civ-repeater-remove', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    el.removeRow(1);
    await elementUpdated(el);

    expect(rowCount(el)).toBe(1);
    expect(eventDetail).not.toBeNull();
    expect(eventDetail.index).toBe(1);
  });

  it('fires cancelable civ-repeater-before-remove that aborts on preventDefault', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;
    el.addRow();
    await elementUpdated(el);
    expect(rowCount(el)).toBe(2);

    let removed = false;
    el.addEventListener('civ-repeater-remove', () => { removed = true; });
    el.addEventListener('civ-repeater-before-remove', (e) => e.preventDefault());

    el.removeRow(1);
    await elementUpdated(el);

    // Nothing changed — neither DOM count nor the after-event fired.
    expect(rowCount(el)).toBe(2);
    expect(removed).toBe(false);
  });

  it('skipConfirm: true bypasses civ-repeater-before-remove (for confirm-handler re-entry)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;
    el.addRow();
    await elementUpdated(el);

    // Simulate the confirm-handler pattern: listener calls preventDefault
    // on the first pass; the modal's confirm handler re-calls removeRow
    // with skipConfirm: true and the removal proceeds without re-firing.
    let beforeCalls = 0;
    el.addEventListener('civ-repeater-before-remove', (e) => {
      beforeCalls++;
      e.preventDefault();
      // Simulate the consumer's modal confirming:
      el.removeRow((e as CustomEvent).detail.index, { skipConfirm: true });
    });

    el.removeRow(1);
    await elementUpdated(el);

    // Only ONE before-remove fired (the original), and the row IS gone.
    expect(beforeCalls).toBe(1);
    expect(rowCount(el)).toBe(1);
  });

  it('civ-repeater-before-remove is cancelable (sanity)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;
    el.addRow();
    await elementUpdated(el);
    let captured: Event | null = null;
    el.addEventListener('civ-repeater-before-remove', (e) => { captured = e; });
    el.removeRow(1);
    expect(captured).not.toBeNull();
    expect(captured!.cancelable).toBe(true);
  });

  it('does not remove below min rows', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="2">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    expect(rowCount(el)).toBe(2);

    el.removeRow(0);
    await elementUpdated(el);

    // Should still have 2 rows
    expect(rowCount(el)).toBe(2);
  });

  it('does not add above max rows', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1" max="2">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    await elementUpdated(el);
    expect(rowCount(el)).toBe(2);

    el.addRow();
    await elementUpdated(el);
    // Should still be 2 — max enforced
    expect(rowCount(el)).toBe(2);
  });

  it('hides add button when max is reached', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1" max="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]');
    expect(addBtn).toBeNull(); // Already at max (1 row, max 1)
  });

  it('renders a max-reached hint when at max', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1" max="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);
    const hint = el.querySelector('.civ-repeater-max-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toContain('1');
    expect(hint!.textContent).toContain('item');
  });

  it('does not render max-reached hint when max is 0 (unlimited)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);
    expect(el.querySelector('.civ-repeater-max-hint')).toBeNull();
  });

  it('renders empty-state-text when list is empty', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" empty-state-text="No items yet.">
        <input type="text" name="val" />
      </civ-repeater>
    `);
    const empty = el.querySelector('.civ-repeater-empty-state');
    expect(empty?.textContent?.trim()).toBe('No items yet.');
  });

  it('hides empty-state-text once a row is added', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" empty-state-text="No items yet.">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;
    expect(el.querySelector('.civ-repeater-empty-state')).not.toBeNull();
    el.addRow();
    await elementUpdated(el);
    expect(el.querySelector('.civ-repeater-empty-state')).toBeNull();
  });

  it('reindexes rows after removal', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    el.addRow();
    await elementUpdated(el);

    el.removeRow(0);
    await elementUpdated(el);

    const rows = getRows(el);
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('input')!.getAttribute('name')).toBe('items[0].val');
    expect(rows[1].querySelector('input')!.getAttribute('name')).toBe('items[1].val');
  });

  it('renders add button with item label', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Deps" name="deps" item-label="dependent">
        <input type="text" name="name" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')!;
    expect(addBtn.getAttribute('label')).toContain('dependent');
  });

  it('uses "Add {item}" copy when the list is empty', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Deps" name="deps" item-label="dependent">
        <input type="text" name="name" />
      </civ-repeater>
    `);
    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')!;
    // First-add reads "Add dependent" — NOT "Add another dependent", which
    // would falsely imply something already exists.
    expect(addBtn.getAttribute('label')).toBe('Add dependent');
  });

  it('switches to "Add another {item}" after the first row is added', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Deps" name="deps" item-label="dependent">
        <input type="text" name="name" />
      </civ-repeater>
    `) as CivRepeater;
    el.addRow();
    await elementUpdated(el);
    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')!;
    expect(addBtn.getAttribute('label')).toBe('Add another dependent');
  });

  it('uses "Add {item}" copy when the list seeds with min rows but then drops to empty (route mode)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater
        mode="route"
        legend="Deps"
        item-label="dependent"
        add-href="/dependents/new"
      ></civ-repeater>
    `) as CivRepeater;
    // route mode starts with empty rows → first-add copy
    const add = getAddButton(el) as HTMLElement;
    expect(add.getAttribute('label')).toBe('Add dependent');

    // Set rows on the route-mode repeater; copy flips
    el.rows = [{ id: 'a', firstName: 'Alex' }];
    await elementUpdated(el);
    const add2 = getAddButton(el) as HTMLElement;
    expect(add2.getAttribute('label')).toBe('Add another dependent');
  });

  it('renders add button with plus icon', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[emphasis="secondary"]')!;
    expect(addBtn.getAttribute('icon-start')).toBe('plus');
  });

  it('renders hint and error', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" hint="Add at least one" error="At least one required">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    // Group-level hints (fieldset context) use the .civ-hint--group class.
    const hint = el.querySelector('.civ-hint--group');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('Add at least one');

    const error = el.querySelector('[role="alert"]');
    expect(error).not.toBeNull();
    expect(error!.textContent).toBe('At least one required');
  });

  it('disables all fields when disabled', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" disabled>
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const fieldset = el.querySelector('fieldset')!;
    expect(fieldset.disabled).toBe(true);
  });

  it('uses Light DOM (no shadow root)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('fieldset')).not.toBeNull();
  });

  it('rows have role="group" labelled by a visible heading', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent" min="1">
        <input type="text" name="firstName" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    await elementUpdated(el);

    const rows = getRows(el);
    expect(rows[0].getAttribute('role')).toBe('group');
    expect(rows[0].getAttribute('aria-label')).toBeNull();

    const heading0 = rows[0].querySelector('.civ-repeater-row-heading')!;
    // Default headingLevel is undefined → legend treated as h2 → rows are h3.
    expect(heading0.tagName).toBe('H3');
    expect(heading0.textContent).toBe('dependent 1');
    expect(rows[0].getAttribute('aria-labelledby')).toBe(heading0.id);

    const heading1 = rows[1].querySelector('.civ-repeater-row-heading')!;
    expect(heading1.textContent).toBe('dependent 2');
  });

  it('per-row heading level is derived from headingLevel (rows sit one level deeper)', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1" heading-level="3">
        <input type="text" name="val" />
      </civ-repeater>
    `);
    const heading = el.querySelector('.civ-repeater-row-heading')!;
    // headingLevel=3 → row heading should be h4.
    expect(heading.tagName).toBe('H4');
  });

  it('per-row heading level is clamped at h6', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="X" name="x" item-label="x" min="1" heading-level="6">
        <input type="text" name="val" />
      </civ-repeater>
    `);
    const heading = el.querySelector('.civ-repeater-row-heading')!;
    expect(heading.tagName).toBe('H6');
  });

  it('updates row headings and aria-labels after removal', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    el.addRow();
    await elementUpdated(el);

    el.removeRow(0);
    await elementUpdated(el);

    const rows = getRows(el);
    expect(rows[0].querySelector('.civ-repeater-row-heading')!.textContent).toBe('item 1');
    expect(rows[1].querySelector('.civ-repeater-row-heading')!.textContent).toBe('item 2');
    // Remove-button aria-label tracks the new index too
    expect(rows[1].querySelector('civ-action-button[danger]')!.getAttribute('aria-label'))
      .toBe('Remove item 2');
  });

  it('remove button visible label includes the item label', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent" min="1">
        <input type="text" name="firstName" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    await elementUpdated(el);

    const removeBtn = getRowRemoveButton(el, 0)!;
    expect(removeBtn.getAttribute('label')).toBe('Remove dependent');
    // Aria-label still carries the index for unambiguous SR announcement
    expect(removeBtn.getAttribute('aria-label')).toBe('Remove dependent 1');
  });

  it('exposes rowCount', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    expect(el.rowCount).toBe(0);

    el.addRow();
    expect(el.rowCount).toBe(1);
  });
});

describe('civ-repeater form-steps mode', () => {
  const formStepsTemplate = `
    <civ-repeater legend="Dependents" name="deps" item-label="dependent" mode="form-steps">
      <div data-step-label="Name">
        <civ-text-input label="First name" name="firstName"></civ-text-input>
      </div>
      <div data-step-label="Details">
        <civ-text-input label="City" name="city"></civ-text-input>
      </div>
    </civ-repeater>
  `;

  it('starts with empty list and add button', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    expect(el.rowCount).toBe(0);
    const rows = getRows(el);
    expect(rows.length).toBe(0);
    const addBtn = el.querySelector('civ-button');
    expect(addBtn).not.toBeNull();
  });

  it('opens form-steps flow on add click', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-repeater-form-steps-open', handler as EventListener);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.isNew).toBe(true);
  });

  it('shows form-step inside form-steps container', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const formStep = el.querySelector('civ-form-step');
    expect(formStep).not.toBeNull();
    const steps = formStep!.querySelectorAll('[data-step-label]');
    expect(steps.length).toBe(2);
  });

  it('hides list when form-steps flow is active', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const rowContainer = el.querySelector('[data-civ-repeater-rows]') as HTMLElement;
    expect(rowContainer.classList.contains('civ-hidden')).toBe(true);
  });

  it('indexes field names inside form-steps', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const field = el.querySelector('civ-form-step civ-text-input');
    expect(field!.getAttribute('name')).toBe('deps[0].firstName');
  });

  it('cancel closes form-steps flow without saving', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-repeater-form-steps-close', handler as EventListener);

    const cancelBtn = el.querySelector('civ-button[emphasis="secondary"]') as HTMLElement;
    cancelBtn.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.action).toBe('cancel');
    expect(el.rowCount).toBe(0);
    expect(el.querySelector('civ-form-step')).toBeNull();
  });

  it('respects max limit on add', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="form-steps" max="0">
        <div data-step-label="Step">
          <civ-text-input label="Value" name="val"></civ-text-input>
        </div>
      </civ-repeater>
    `);
    await elementUpdated(el);

    // max=0 means unlimited, add should work
    const addBtn = el.querySelector('civ-button') as HTMLElement;
    expect(addBtn).not.toBeNull();
  });

  it('uses Light DOM', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    expect(el.shadowRoot).toBeNull();
  });

  it('changes legend text when form-steps flow is active', async () => {
    const el = await fixture<CivRepeater>(formStepsTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Add dependent');
  });

  it('passes form-steps-sensitive to form-step', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="People" name="people" item-label="person" mode="form-steps" form-steps-sensitive>
        <div data-step-label="Info">
          <civ-text-input label="Name" name="name"></civ-text-input>
        </div>
      </civ-repeater>
    `);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const formStep = el.querySelector('civ-form-step');
    expect(formStep).not.toBeNull();
    expect(formStep!.hasAttribute('sensitive')).toBe(true);
  });

  it('passes form-steps-show-pause to form-step', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="People" name="people" item-label="person" mode="form-steps" form-steps-show-pause>
        <div data-step-label="Info">
          <civ-text-input label="Name" name="name"></civ-text-input>
        </div>
      </civ-repeater>
    `);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const formStep = el.querySelector('civ-form-step');
    expect(formStep).not.toBeNull();
    expect(formStep!.hasAttribute('show-pause')).toBe(true);
  });
});

describe('civ-repeater route mode', () => {
  type Row = { id: string; firstName: string; lastName: string };

  const sampleRows: Row[] = [
    { id: 'a', firstName: 'Alex', lastName: 'Chen' },
    { id: 'b', firstName: 'Jordan', lastName: 'Lee' },
  ];

  /**
   * Mount a route-mode repeater with the given rows. Helper to keep test
   * setup compact — assigning the JS `rows` / `rowSummary` props after
   * fixture() (since neither serializes through HTML attributes).
   */
  async function mountRouted(opts: {
    rows?: Row[];
    addHref?: string;
    editHrefPattern?: string;
    idField?: string;
    summaryFields?: string;
    rowSummary?: (row: Row, i: number) => string;
    min?: number;
    max?: number;
  } = {}): Promise<CivRepeater> {
    const el = await fixture<CivRepeater>(`
      <civ-repeater
        mode="route"
        legend="Dependents"
        item-label="dependent"
        add-href="${opts.addHref ?? '/dependents/new'}"
        edit-href-pattern="${opts.editHrefPattern ?? '/dependents/{id}/edit'}"
        ${opts.idField !== undefined ? `id-field="${opts.idField}"` : ''}
        ${opts.summaryFields !== undefined ? `summary-fields="${opts.summaryFields}"` : ''}
        ${opts.min !== undefined ? `min="${opts.min}"` : ''}
        ${opts.max !== undefined ? `max="${opts.max}"` : ''}
      ></civ-repeater>
    `);
    el.rows = opts.rows ?? sampleRows;
    if (opts.rowSummary) el.rowSummary = opts.rowSummary as any;
    await elementUpdated(el);
    return el;
  }

  it('renders one summary card per row', async () => {
    const el = await mountRouted();
    const rows = getRows(el);
    expect(rows.length).toBe(2);
  });

  it('renders a per-row heading like "dependent 1"', async () => {
    const el = await mountRouted();
    const headings = el.querySelectorAll('.civ-repeater-row-heading');
    expect(headings.length).toBe(2);
    expect(headings[0].textContent?.trim()).toBe('dependent 1');
    expect(headings[1].textContent?.trim()).toBe('dependent 2');
  });

  it('joins summary-fields values for the summary line', async () => {
    const el = await mountRouted({ summaryFields: 'firstName,lastName' });
    const summaries = el.querySelectorAll('.civ-list-item__content');
    expect(summaries[0].textContent?.trim()).toBe('Alex Chen');
    expect(summaries[1].textContent?.trim()).toBe('Jordan Lee');
  });

  it('rowSummary fn wins over summary-fields', async () => {
    const el = await mountRouted({
      summaryFields: 'firstName,lastName',
      rowSummary: (row) => `${row.lastName.toUpperCase()}, ${row.firstName}`,
    });
    const summaries = el.querySelectorAll('.civ-list-item__content');
    expect(summaries[0].textContent?.trim()).toBe('CHEN, Alex');
  });

  it('falls back to "{itemLabel} {index+1}" when neither summary source is set', async () => {
    const el = await mountRouted();
    const summaries = el.querySelectorAll('.civ-list-item__content');
    expect(summaries[0].textContent?.trim()).toBe('dependent 1');
  });

  it('summary-template interpolates {prop} placeholders', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater
        mode="route"
        legend="Deps"
        item-label="dependent"
        add-href="/new"
        summary-template="{firstName} {lastName}"
      ></civ-repeater>
    `);
    el.rows = [{ id: 'a', firstName: 'Alex', lastName: 'Chen' }];
    await elementUpdated(el);
    const summary = el.querySelector('.civ-list-item__content');
    expect(summary?.textContent?.trim()).toBe('Alex Chen');
  });

  it('summary-template wins over summary-fields when both are set', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater
        mode="route"
        legend="Deps"
        item-label="dependent"
        add-href="/new"
        summary-template="{lastName}, {firstName}"
        summary-fields="firstName,lastName"
      ></civ-repeater>
    `);
    el.rows = [{ id: 'a', firstName: 'Alex', lastName: 'Chen' }];
    await elementUpdated(el);
    const summary = el.querySelector('.civ-list-item__content');
    expect(summary?.textContent?.trim()).toBe('Chen, Alex');
  });

  it('rowSummary fn still wins over summary-template', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater
        mode="route"
        legend="Deps"
        item-label="dependent"
        add-href="/new"
        summary-template="{firstName} {lastName}"
      ></civ-repeater>
    `) as CivRepeater;
    el.rows = [{ id: 'a', firstName: 'Alex', lastName: 'Chen' }] as any;
    el.rowSummary = (row) => `FN: ${row.firstName}`;
    await elementUpdated(el);
    const summary = el.querySelector('.civ-list-item__content');
    expect(summary?.textContent?.trim()).toBe('FN: Alex');
  });

  it('summary-template renders empty string for missing properties', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater
        mode="route"
        legend="Deps"
        item-label="dependent"
        add-href="/new"
        summary-template="{firstName} {middleName} {lastName}"
      ></civ-repeater>
    `);
    el.rows = [{ id: 'a', firstName: 'Alex', lastName: 'Chen' }];
    await elementUpdated(el);
    const summary = el.querySelector('.civ-list-item__content');
    // Double space where middleName was — that's the literal template, not a bug.
    expect(summary?.textContent?.trim()).toBe('Alex  Chen');
  });

  it('Add affordance is a real <a href> with the addHref', async () => {
    const el = await mountRouted({ addHref: '/dependents/new' });
    // The Add link is the fieldset-level civ-link, NOT one of the per-row
    // Edit links — scope the query so the test reflects the role split.
    const add = getAddButton(el) as HTMLElement;
    expect(add).not.toBeNull();
    expect(add.getAttribute('href')).toBe('/dependents/new');
  });

  it('Edit per-row interpolates {id} from row[idField]', async () => {
    const el = await mountRouted({
      editHrefPattern: '/dependents/{id}/edit',
      idField: 'id',
    });
    const editLinks = el.querySelectorAll('[data-civ-repeater-row] civ-action-button[href]');
    expect(editLinks[0].getAttribute('href')).toBe('/dependents/a/edit');
    expect(editLinks[1].getAttribute('href')).toBe('/dependents/b/edit');
  });

  it('Edit per-row interpolates {index} when pattern uses it', async () => {
    const el = await mountRouted({
      editHrefPattern: '/d/{index}',
    });
    const editLinks = el.querySelectorAll('[data-civ-repeater-row] civ-action-button[href]');
    expect(editLinks[0].getAttribute('href')).toBe('/d/0');
    expect(editLinks[1].getAttribute('href')).toBe('/d/1');
  });

  it('falls back to {index} and warns when {id} is missing on a row', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const el = await fixture<CivRepeater>(`
        <civ-repeater
          mode="route"
          legend="Items"
          add-href="/new"
          edit-href-pattern="/items/{id}/edit"
        ></civ-repeater>
      `);
      el.rows = [{ firstName: 'no-id' } as any];
      await elementUpdated(el);

      const editLink = getRowEditLink(el, 0);
      expect(editLink?.getAttribute('href')).toBe('/items/0/edit');
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('warns ONCE about missing id even when many rows lack it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const el = await fixture<CivRepeater>(`
        <civ-repeater mode="route" legend="X" add-href="/new" edit-href-pattern="/i/{id}"></civ-repeater>
      `);
      el.rows = Array.from({ length: 10 }, (_, i) => ({ name: `x${i}` }));
      await elementUpdated(el);
      // Force another render
      el.rows = [...el.rows];
      await elementUpdated(el);
      const repeaterWarnings = warn.mock.calls.filter(c => String(c[0]).includes('edit-href-pattern uses {id}'));
      expect(repeaterWarnings.length).toBe(1);
    } finally {
      warn.mockRestore();
    }
  });

  it('URI-encodes id values to keep slashes / spaces safe in URLs', async () => {
    const el = await mountRouted({
      rows: [{ id: 'a/b', firstName: 'x', lastName: 'y' }],
      editHrefPattern: '/items/{id}',
    });
    const editLink = getRowEditLink(el, 0);
    expect(editLink?.getAttribute('href')).toBe('/items/a%2Fb');
  });

  it('Remove fires civ-repeater-remove with index, id, and row payload', async () => {
    const el = await mountRouted();
    let detail: any = null;
    el.addEventListener('civ-repeater-remove', ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const removeBtn = getRowRemoveButton(el, 0) as HTMLElement;
    removeBtn.click();
    await elementUpdated(el);

    expect(detail).not.toBeNull();
    expect(detail.index).toBe(0);
    expect(detail.id).toBe('a');
    expect(detail.row).toEqual({ id: 'a', firstName: 'Alex', lastName: 'Chen' });
  });

  it('does not mutate the rows array on remove (host owns it)', async () => {
    const el = await mountRouted();
    const originalRows = el.rows;
    const removeBtn = getRowRemoveButton(el, 0) as HTMLElement;
    removeBtn.click();
    await elementUpdated(el);
    // Repeater never touches `rows` — host updates it in response to the event.
    expect(el.rows).toBe(originalRows);
    expect(el.rows.length).toBe(2);
  });

  it('does not fire remove below min', async () => {
    const el = await mountRouted({ min: 2 });
    let detail: any = null;
    el.addEventListener('civ-repeater-remove', ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const removeBtn = getRowRemoveButton(el, 0) as HTMLElement;
    removeBtn.click();
    await elementUpdated(el);
    expect(detail).toBeNull();
  });

  it('hides the Add affordance when at max', async () => {
    const el = await mountRouted({ max: 2 });
    expect(rowCount(el)).toBe(2);
    // The top-level add affordance — `civ-link` outside any row.
    const topLevelAdd = getAddButton(el);
    expect(topLevelAdd).toBeNull();
  });

  it('warns when slotted children are passed in route mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await fixture<CivRepeater>(`
        <civ-repeater mode="route" add-href="/new">
          <civ-text-input label="ignored" name="ignored"></civ-text-input>
        </civ-repeater>
      `);
      expect(warn).toHaveBeenCalled();
      const calls = warn.mock.calls.map(c => String(c[0]));
      expect(calls.some(s => s.includes('route mode'))).toBe(true);
    } finally {
      warn.mockRestore();
    }
  });

  it('re-renders when rows is replaced (controlled prop)', async () => {
    const el = await mountRouted({ rows: sampleRows.slice(0, 1) });
    expect(rowCount(el)).toBe(1);
    el.rows = sampleRows;
    await elementUpdated(el);
    expect(rowCount(el)).toBe(2);
  });
});
