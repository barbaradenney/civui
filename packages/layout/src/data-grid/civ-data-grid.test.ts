import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-data-grid.js';
import type { GridColumn, GridRow } from './civ-data-grid.types.js';

afterEach(cleanupFixtures);

const baseColumns: GridColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
  { key: 'updated', header: 'Updated', sortable: true, align: 'end' },
];

const baseRows: GridRow[] = [
  { id: '1', cells: { name: 'Smith, John', status: 'Active', updated: '2026-05-01' } },
  { id: '2', cells: { name: 'Doe, Jane', status: 'Pending', updated: '2026-04-12' } },
  { id: '3', cells: { name: 'Reyes, Maria', status: 'Active', updated: '2026-03-30' } },
];

async function mountGrid(opts: Partial<{
  caption: string;
  columns: GridColumn[];
  rows: GridRow[];
  sortBy: string;
  sortDirection: 'asc' | 'desc' | 'none';
  selectable: 'none' | 'single' | 'multiple';
  selectedRowIds: string[];
  loading: boolean;
  errorMessage: string;
  emptyMessage: string;
}> = {}): Promise<any> {
  const el = await fixture('<civ-data-grid></civ-data-grid>') as any;
  el.caption = opts.caption ?? 'Records';
  el.columns = opts.columns ?? baseColumns;
  el.rows = opts.rows ?? baseRows;
  if (opts.sortBy !== undefined) el.sortBy = opts.sortBy;
  if (opts.sortDirection !== undefined) el.sortDirection = opts.sortDirection;
  if (opts.selectable !== undefined) el.selectable = opts.selectable;
  if (opts.selectedRowIds !== undefined) el.selectedRowIds = opts.selectedRowIds;
  if (opts.loading !== undefined) el.loading = opts.loading;
  if (opts.errorMessage !== undefined) el.errorMessage = opts.errorMessage;
  if (opts.emptyMessage !== undefined) el.emptyMessage = opts.emptyMessage;
  await elementUpdated(el);
  return el;
}

describe('civ-data-grid — rendering', () => {
  it('renders a semantic <table>', async () => {
    const el = await mountGrid();
    expect(el.querySelector('table.civ-data-grid__table')).not.toBeNull();
  });

  it('applies the responsive variant class on the wrapper', async () => {
    const stacked = await mountGrid();
    expect(stacked.querySelector('.civ-data-grid--stacked')).not.toBeNull();

    stacked.responsive = 'scroll';
    await elementUpdated(stacked);
    expect(stacked.querySelector('.civ-data-grid--scroll')).not.toBeNull();
    expect(stacked.querySelector('.civ-data-grid--stacked')).toBeNull();
  });

  it('renders <caption> with the caption prop', async () => {
    const el = await mountGrid({ caption: 'Veterans applications' });
    const caption = el.querySelector('caption');
    expect(caption?.textContent?.trim()).toBe('Veterans applications');
  });

  it('hides the caption visually but keeps it in the DOM when captionHidden', async () => {
    const el = await mountGrid({ caption: 'Hidden caption' });
    el.captionHidden = true;
    await elementUpdated(el);
    const caption = el.querySelector('caption');
    expect(caption?.className).toContain('civ-sr-only');
    expect(caption?.textContent?.trim()).toBe('Hidden caption');
  });

  it('renders one <th scope="col"> per column', async () => {
    const el = await mountGrid();
    const ths = el.querySelectorAll('thead th[scope="col"]');
    expect(ths.length).toBe(3);
  });

  it('renders one <tr> per row', async () => {
    const el = await mountGrid();
    const trs = el.querySelectorAll('tbody tr');
    expect(trs.length).toBe(3);
  });

  it('renders cell values using column.key', async () => {
    const el = await mountGrid();
    const firstRow = el.querySelectorAll('tbody tr')[0];
    expect(firstRow.textContent).toContain('Smith, John');
    expect(firstRow.textContent).toContain('Active');
    expect(firstRow.textContent).toContain('2026-05-01');
  });

  it('uses column.formatter when provided', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'count', header: 'Count', formatter: (v) => `[${v}]` },
    ];
    const rows: GridRow[] = [{ id: '1', cells: { name: 'A', count: 42 } }];
    const el = await mountGrid({ columns: cols, rows });
    const cells = el.querySelectorAll('tbody td');
    expect(cells[1].textContent?.trim()).toBe('[42]');
  });

  it('renders data-label attribute on each body cell for mobile stacking', async () => {
    const el = await mountGrid();
    const firstNameCell = el.querySelector('tbody tr:first-child td:first-child');
    expect(firstNameCell?.getAttribute('data-label')).toBe('Name');
  });
});

describe('civ-data-grid — sorting', () => {
  it('marks sortable columns with a sort button', async () => {
    const el = await mountGrid();
    const sortBtns = el.querySelectorAll('.civ-data-grid__sort-btn');
    expect(sortBtns.length).toBe(2); // name + updated
  });

  it('does not render a sort button on non-sortable columns', async () => {
    const el = await mountGrid();
    const statusTh = el.querySelectorAll('thead th')[1];
    expect(statusTh.querySelector('.civ-data-grid__sort-btn')).toBeNull();
  });

  it('reflects current sort state via aria-sort', async () => {
    const el = await mountGrid({ sortBy: 'name', sortDirection: 'asc' });
    const ths = el.querySelectorAll('thead th[aria-sort]');
    const nameTh = Array.from(ths).find((th) => th.textContent?.includes('Name'));
    expect(nameTh?.getAttribute('aria-sort')).toBe('ascending');
  });

  it('fires civ-sort with asc on first click of an unsorted column', async () => {
    const el = await mountGrid();
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    const nameBtn = el.querySelector('thead th:first-child .civ-data-grid__sort-btn') as HTMLButtonElement;
    nameBtn.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ column: 'name', direction: 'asc' });
  });

  it('cycles asc → desc → none', async () => {
    const el = await mountGrid({ sortBy: 'name', sortDirection: 'asc' });
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    const nameBtn = el.querySelector('thead th:first-child .civ-data-grid__sort-btn') as HTMLButtonElement;
    nameBtn.click();
    expect(handler.mock.calls[0][0].detail).toEqual({ column: 'name', direction: 'desc' });

    el.sortDirection = 'desc';
    await elementUpdated(el);
    nameBtn.click();
    expect(handler.mock.calls[1][0].detail).toEqual({ column: '', direction: 'none' });
  });
});

describe('civ-data-grid — selection', () => {
  it('does not render selection checkboxes when selectable="none"', async () => {
    const el = await mountGrid({ selectable: 'none' });
    expect(el.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('renders a select-all checkbox in the header for multiple selection', async () => {
    const el = await mountGrid({ selectable: 'multiple' });
    const headerCheckbox = el.querySelector('thead input[type="checkbox"]');
    expect(headerCheckbox).not.toBeNull();
  });

  it('renders a checkbox per row for multiple selection', async () => {
    const el = await mountGrid({ selectable: 'multiple' });
    const bodyCheckboxes = el.querySelectorAll('tbody input[type="checkbox"]');
    expect(bodyCheckboxes.length).toBe(3);
  });

  it('renders radio inputs per row for single selection', async () => {
    const el = await mountGrid({ selectable: 'single' });
    const radios = el.querySelectorAll('tbody input[type="radio"]');
    expect(radios.length).toBe(3);
  });

  it('fires civ-selection-change when a row checkbox toggles on', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: [] });
    const handler = vi.fn();
    el.addEventListener('civ-selection-change', handler);

    const firstCheckbox = el.querySelectorAll('tbody input[type="checkbox"]')[0] as HTMLInputElement;
    firstCheckbox.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ selectedRowIds: ['1'] });
  });

  it('fires civ-selection-change with id removed when a checked row toggles off', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: ['1', '2'] });
    const handler = vi.fn();
    el.addEventListener('civ-selection-change', handler);

    const firstCheckbox = el.querySelectorAll('tbody input[type="checkbox"]')[0] as HTMLInputElement;
    firstCheckbox.click();

    expect(handler.mock.calls[0][0].detail).toEqual({ selectedRowIds: ['2'] });
  });

  it('select-all checkbox selects all enabled rows', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: [] });
    const handler = vi.fn();
    el.addEventListener('civ-selection-change', handler);

    const headerCheckbox = el.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
    headerCheckbox.checked = true;
    headerCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({ selectedRowIds: ['1', '2', '3'] });
  });

  it('select-all checkbox is checked when every enabled row is selected', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: ['1', '2', '3'] });
    const headerCheckbox = el.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
    expect(headerCheckbox.checked).toBe(true);
  });

  it('select-all checkbox is indeterminate when only some rows are selected', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: ['1'] });
    const headerCheckbox = el.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
    expect(headerCheckbox.indeterminate).toBe(true);
  });

  it('marks selected rows with aria-selected="true"', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: ['2'] });
    const rows = el.querySelectorAll('tbody tr');
    expect(rows[0].getAttribute('aria-selected')).toBe('false');
    expect(rows[1].getAttribute('aria-selected')).toBe('true');
  });

  it('shows the selection status when one or more rows are selected', async () => {
    const el = await mountGrid({ selectable: 'multiple', selectedRowIds: ['1', '2'] });
    const status = el.querySelector('.civ-data-grid__selection-status');
    expect(status?.textContent).toContain('2');
    expect(status?.textContent).toContain('3');
  });
});

describe('civ-data-grid — row actions', () => {
  it('does not render an actions column when no row has actions', async () => {
    const el = await mountGrid();
    expect(el.querySelector('.civ-data-grid__th--actions')).toBeNull();
  });

  it('renders an actions column when at least one row has actions', async () => {
    const rows: GridRow[] = [
      { id: '1', cells: { name: 'A' }, actions: [{ id: 'edit', label: 'Edit' }] },
      { id: '2', cells: { name: 'B' } },
    ];
    const el = await mountGrid({ rows, columns: [{ key: 'name', header: 'Name' }] });
    expect(el.querySelector('.civ-data-grid__th--actions')).not.toBeNull();
  });

  it('renders an action trigger per row when actions exist', async () => {
    const rows: GridRow[] = [
      { id: '1', cells: { name: 'A' }, actions: [{ id: 'edit', label: 'Edit' }] },
    ];
    const el = await mountGrid({ rows, columns: [{ key: 'name', header: 'Name' }] });
    expect(el.querySelectorAll('.civ-data-grid__action-trigger').length).toBe(1);
  });

  it('renders each action menu item with its label visible', async () => {
    const rows: GridRow[] = [
      {
        id: '1',
        cells: { name: 'A' },
        actions: [
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete', destructive: true },
        ],
      },
    ];
    const el = await mountGrid({ rows, columns: [{ key: 'name', header: 'Name' }] });
    const menu = el.querySelector('civ-menu') as any;
    menu.open = true;
    await elementUpdated(menu);
    const labels = Array.from(el.querySelectorAll('civ-menu-item .civ-menu-item__label'))
      .map((n) => (n.textContent ?? '').trim());
    expect(labels).toEqual(['Edit', 'Delete']);
  });

  it('fires civ-row-action when an action item is selected', async () => {
    const rows: GridRow[] = [
      {
        id: '42',
        cells: { name: 'A' },
        actions: [
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete', destructive: true },
        ],
      },
    ];
    const el = await mountGrid({ rows, columns: [{ key: 'name', header: 'Name' }] });

    const handler = vi.fn();
    el.addEventListener('civ-row-action', handler);

    const menu = el.querySelector('civ-menu') as any;
    menu.open = true;
    await elementUpdated(menu);

    const deleteItem = el.querySelector('civ-menu-item[value="delete"]') as HTMLElement;
    deleteItem.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.rowId).toBe('42');
    expect(detail.action).toBe('delete');
    expect(detail.row.id).toBe('42');
  });
});

describe('civ-data-grid — states', () => {
  it('shows the loading state when loading=true', async () => {
    const el = await mountGrid({ loading: true });
    expect(el.querySelector('.civ-data-grid__state--loading')).not.toBeNull();
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('shows the error state with role=alert when errorMessage is set', async () => {
    const el = await mountGrid({ errorMessage: 'Failed to load' });
    const error = el.querySelector('.civ-data-grid__state--error') as HTMLElement;
    expect(error).not.toBeNull();
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain('Failed to load');
  });

  it('shows the empty state when rows is empty', async () => {
    const el = await mountGrid({ rows: [] });
    expect(el.querySelector('.civ-data-grid__state--empty')).not.toBeNull();
  });

  it('uses the custom emptyMessage when provided', async () => {
    const el = await mountGrid({ rows: [], emptyMessage: 'No applications yet.' });
    expect(el.querySelector('.civ-data-grid__state--empty')?.textContent).toContain('No applications yet.');
  });
});

describe('civ-data-grid — accessibility', () => {
  it('renders Light DOM', async () => {
    const el = await mountGrid();
    expect(el.shadowRoot).toBeNull();
  });

  it('uses native <table> semantics (not role="grid")', async () => {
    const el = await mountGrid();
    const table = el.querySelector('table');
    expect(table?.getAttribute('role')).toBeNull();
  });

  it('column headers use scope="col"', async () => {
    const el = await mountGrid();
    el.querySelectorAll('thead th').forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });
  });

  it('falls back to the i18n grid label when caption is empty', async () => {
    const el = await fixture('<civ-data-grid></civ-data-grid>') as any;
    el.columns = baseColumns;
    el.rows = baseRows;
    el.caption = '';
    await elementUpdated(el);
    const caption = el.querySelector('caption');
    expect(caption?.textContent?.trim().length).toBeGreaterThan(0);
  });
});
