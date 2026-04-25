import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-repeater.js';
import type { CivRepeater } from './civ-repeater.js';

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

  it('renders initial row from template', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent">
        <input type="text" name="firstName" />
      </civ-repeater>
    `);

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    expect(rows.length).toBe(1);
  });

  it('renders min rows on init', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="3">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    expect(rows.length).toBe(3);
  });

  it('indexes field names with prefix[index].fieldName', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
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

    const addBtn = el.querySelector('civ-button[variant="secondary"]')! as HTMLButtonElement;
    addBtn.click();
    await elementUpdated(el);

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    expect(rows.length).toBe(2);
  });

  it('indexes new row fields correctly', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[variant="secondary"]')! as HTMLButtonElement;
    addBtn.click();
    await elementUpdated(el);

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    const secondInput = rows[1].querySelector('input')!;
    expect(secondInput.getAttribute('name')).toBe('items[1].val');
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

    const addBtn = el.querySelector('civ-button[variant="secondary"]')! as HTMLButtonElement;
    addBtn.click();

    expect(eventDetail).not.toBeNull();
    expect(eventDetail.index).toBe(1);
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
    expect(el.querySelectorAll('[data-civ-repeater-row]').length).toBe(2);

    let eventDetail: any = null;
    el.addEventListener('civ-repeater-remove', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    el.removeRow(1);
    await elementUpdated(el);

    expect(el.querySelectorAll('[data-civ-repeater-row]').length).toBe(1);
    expect(eventDetail).not.toBeNull();
    expect(eventDetail.index).toBe(1);
  });

  it('does not remove below min rows', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" min="2">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    expect(el.querySelectorAll('[data-civ-repeater-row]').length).toBe(2);

    el.removeRow(0);
    await elementUpdated(el);

    // Should still have 2 rows
    expect(el.querySelectorAll('[data-civ-repeater-row]').length).toBe(2);
  });

  it('does not add above max rows', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" max="2">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    await elementUpdated(el);
    expect(el.querySelectorAll('[data-civ-repeater-row]').length).toBe(2);

    el.addRow();
    await elementUpdated(el);
    // Should still be 2 — max enforced
    expect(el.querySelectorAll('[data-civ-repeater-row]').length).toBe(2);
  });

  it('hides add button when max is reached', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" max="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const addBtn = el.querySelector('civ-button[variant="secondary"]');
    expect(addBtn).toBeNull(); // Already at max (1 row, max 1)
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

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
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

    const addBtn = el.querySelector('civ-button[variant="secondary"]')!;
    expect(addBtn.getAttribute('label')).toContain('dependent');
  });

  it('renders hint and error', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" hint="Add at least one" error="At least one required">
        <input type="text" name="val" />
      </civ-repeater>
    `);

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

  it('rows have role="group" and aria-label', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Dependents" name="deps" item-label="dependent">
        <input type="text" name="firstName" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    await elementUpdated(el);

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    expect(rows[0].getAttribute('role')).toBe('group');
    expect(rows[0].getAttribute('aria-label')).toBe('dependent 1');
    expect(rows[1].getAttribute('aria-label')).toBe('dependent 2');
  });

  it('updates row aria-labels after removal', async () => {
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

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    expect(rows[0].getAttribute('aria-label')).toBe('item 1');
    expect(rows[1].getAttribute('aria-label')).toBe('item 2');
  });

  it('exposes rowCount', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    expect(el.rowCount).toBe(1);

    el.addRow();
    expect(el.rowCount).toBe(2);
  });
});

describe('civ-repeater detail mode', () => {
  it('renders summary and detail containers per row', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const summary = el.querySelector('[data-civ-repeater-summary]');
    const detail = el.querySelector('[data-civ-repeater-detail]');
    expect(summary).not.toBeNull();
    expect(detail).not.toBeNull();
  });

  it('collapses rows initially in detail mode', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const detail = el.querySelector('[data-civ-repeater-detail]') as HTMLElement;
    expect(detail.style.display).toBe('none');
  });

  it('expands row when edit button is clicked', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const editBtn = el.querySelector('civ-action-button') as HTMLButtonElement;
    editBtn.click();
    await elementUpdated(el);

    const summary = el.querySelector('[data-civ-repeater-summary]') as HTMLElement;
    const detail = el.querySelector('[data-civ-repeater-detail]') as HTMLElement;
    expect(summary.style.display).toBe('none');
    expect(detail.style.display).toBe('');
  });

  it('collapses row when save button is clicked', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    // Expand
    const editBtn = el.querySelector('civ-action-button') as HTMLButtonElement;
    editBtn.click();
    await elementUpdated(el);

    // Save
    const saveBtn = el.querySelector('civ-action-button[variant="primary"]') as HTMLButtonElement;
    saveBtn.click();
    await elementUpdated(el);

    const detail = el.querySelector('[data-civ-repeater-detail]') as HTMLElement;
    expect(detail.style.display).toBe('none');
  });

  it('auto-expands new row on add in detail mode', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="0">
        <input type="text" name="val" />
      </civ-repeater>
    `) as CivRepeater;

    el.addRow();
    await elementUpdated(el);

    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    const lastDetail = rows[rows.length - 1].querySelector('[data-civ-repeater-detail]') as HTMLElement;
    expect(lastDetail.style.display).toBe('');
  });

  it('has edit button with aria-label', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const editBtn = el.querySelector('civ-action-button');
    expect(editBtn).not.toBeNull();
    expect(editBtn!.getAttribute('aria-label')).toBe('Edit item 1');
  });

  it('indexes field names inside detail container', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="detail" min="1">
        <input type="text" name="val" />
      </civ-repeater>
    `);

    const input = el.querySelector('[data-civ-repeater-detail] input');
    expect(input).not.toBeNull();
    expect(input!.getAttribute('name')).toBe('items[0].val');
  });
});

describe('civ-repeater wizard mode', () => {
  const wizardTemplate = `
    <civ-repeater legend="Dependents" name="deps" item-label="dependent" mode="wizard">
      <div data-step-label="Name">
        <civ-text-input label="First name" name="firstName"></civ-text-input>
      </div>
      <div data-step-label="Details">
        <civ-text-input label="City" name="city"></civ-text-input>
      </div>
    </civ-repeater>
  `;

  it('starts with empty list and add button', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    expect(el.rowCount).toBe(0);
    const rows = el.querySelectorAll('[data-civ-repeater-row]');
    expect(rows.length).toBe(0);
    const addBtn = el.querySelector('civ-button');
    expect(addBtn).not.toBeNull();
  });

  it('opens wizard on add click', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-repeater-wizard-open', handler as EventListener);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.isNew).toBe(true);
  });

  it('shows form-step inside wizard container', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const formStep = el.querySelector('civ-form-step');
    expect(formStep).not.toBeNull();
    const steps = formStep!.querySelectorAll('[data-step-label]');
    expect(steps.length).toBe(2);
  });

  it('hides list when wizard is active', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const rowContainer = el.querySelector('[data-civ-repeater-rows]') as HTMLElement;
    expect(rowContainer.style.display).toBe('none');
  });

  it('indexes field names inside wizard steps', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const field = el.querySelector('civ-form-step civ-text-input');
    expect(field!.getAttribute('name')).toBe('deps[0].firstName');
  });

  it('cancel closes wizard without saving', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-repeater-wizard-close', handler as EventListener);

    const cancelBtn = el.querySelector('civ-button[variant="secondary"]') as HTMLElement;
    cancelBtn.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.action).toBe('cancel');
    expect(el.rowCount).toBe(0);
    expect(el.querySelector('civ-form-step')).toBeNull();
  });

  it('respects max limit on add', async () => {
    const el = await fixture<CivRepeater>(`
      <civ-repeater legend="Items" name="items" item-label="item" mode="wizard" max="0">
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
    const el = await fixture<CivRepeater>(wizardTemplate);
    expect(el.shadowRoot).toBeNull();
  });

  it('changes legend text when wizard is active', async () => {
    const el = await fixture<CivRepeater>(wizardTemplate);
    await elementUpdated(el);

    const addBtn = el.querySelector('civ-button') as HTMLElement;
    addBtn.click();
    await elementUpdated(el);

    const legend = el.querySelector('legend');
    expect(legend!.textContent).toContain('Add dependent');
  });
});
