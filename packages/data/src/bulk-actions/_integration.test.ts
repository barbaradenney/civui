import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import '../data-grid/civ-data-grid.js';
import './civ-bulk-actions.js';
import type { GridColumn, GridRow } from '../data-grid/civ-data-grid.types.js';

afterEach(cleanupFixtures);

describe('civ-bulk-actions ↔ civ-data-grid integration', () => {
  it('shows the bar when grid selection toggles to non-empty', async () => {
    const container = (await fixture(`
      <div>
        <civ-bulk-actions count="0" item-name="row"></civ-bulk-actions>
        <civ-data-grid caption="t"></civ-data-grid>
      </div>
    `)) as HTMLElement;
    const grid = container.querySelector('civ-data-grid') as any;
    const bulk = container.querySelector('civ-bulk-actions') as any;

    const columns: GridColumn[] = [{ key: 'name', header: 'Name' }];
    const rows: GridRow[] = [
      { id: '1', cells: { name: 'A' } },
      { id: '2', cells: { name: 'B' } },
    ];
    grid.columns = columns;
    grid.rows = rows;
    grid.selectable = 'multiple';
    grid.selectedRowIds = [];
    grid.addEventListener('civ-selection-change', (e: Event) => {
      const ids = (e as CustomEvent).detail.selectedRowIds;
      grid.selectedRowIds = ids;
      bulk.count = ids.length;
    });
    await elementUpdated(grid);

    // Toggle a row's checkbox.
    const checkbox = grid.querySelector(
      '.civ-data-grid__td--select input[type="checkbox"]',
    ) as HTMLInputElement;
    checkbox.click();
    await elementUpdated(grid);
    await elementUpdated(bulk);

    expect(bulk.count).toBe(1);
    const bar = bulk.querySelector('.civ-bulk-actions') as HTMLElement;
    expect(bar.hasAttribute('hidden')).toBe(false);
  });

  it('clears grid selection when Clear is activated on the bar', async () => {
    const container = (await fixture(`
      <div>
        <civ-bulk-actions count="2" item-name="row"></civ-bulk-actions>
        <civ-data-grid caption="t"></civ-data-grid>
      </div>
    `)) as HTMLElement;
    const grid = container.querySelector('civ-data-grid') as any;
    const bulk = container.querySelector('civ-bulk-actions') as any;

    grid.columns = [{ key: 'name', header: 'Name' }];
    grid.rows = [
      { id: '1', cells: { name: 'A' } },
      { id: '2', cells: { name: 'B' } },
    ];
    grid.selectable = 'multiple';
    grid.selectedRowIds = ['1', '2'];
    bulk.addEventListener('civ-clear-selection', () => {
      grid.selectedRowIds = [];
      bulk.count = 0;
    });
    await elementUpdated(grid);
    await elementUpdated(bulk);

    const clearBtn = bulk.querySelector(
      '.civ-bulk-actions__clear button',
    ) as HTMLButtonElement;
    clearBtn.click();
    await elementUpdated(grid);
    await elementUpdated(bulk);

    expect(grid.selectedRowIds).toEqual([]);
    expect(bulk.count).toBe(0);
    const bar = bulk.querySelector('.civ-bulk-actions') as HTMLElement;
    expect(bar.hasAttribute('hidden')).toBe(true);
  });
});
