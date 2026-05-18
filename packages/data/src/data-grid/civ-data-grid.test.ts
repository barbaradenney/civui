import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated, pressKey } from '@civui/test-utils';
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
  interactive: boolean;
  expandedRowIds: string[];
  expandTemplate: (row: GridRow) => string | number | unknown;
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
  if (opts.interactive !== undefined) el.interactive = opts.interactive;
  if (opts.expandedRowIds !== undefined) el.expandedRowIds = opts.expandedRowIds;
  if (opts.expandTemplate !== undefined) el.expandTemplate = opts.expandTemplate;
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
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.column).toBe('name');
    expect(detail.direction).toBe('asc');
    expect(detail.sortKeys).toEqual([{ key: 'name', direction: 'asc' }]);
  });

  it('cycles asc → desc → none', async () => {
    const el = await mountGrid({ sortBy: 'name', sortDirection: 'asc' });
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    const nameBtn = el.querySelector('thead th:first-child .civ-data-grid__sort-btn') as HTMLButtonElement;
    nameBtn.click();
    expect(handler.mock.calls[0][0].detail.column).toBe('name');
    expect(handler.mock.calls[0][0].detail.direction).toBe('desc');
    expect(handler.mock.calls[0][0].detail.sortKeys).toEqual([{ key: 'name', direction: 'desc' }]);

    el.sortDirection = 'desc';
    await elementUpdated(el);
    nameBtn.click();
    expect(handler.mock.calls[1][0].detail.column).toBe('');
    expect(handler.mock.calls[1][0].detail.direction).toBe('none');
    expect(handler.mock.calls[1][0].detail.sortKeys).toEqual([]);
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
    expect(el.querySelectorAll('civ-action-button[data-civ-menu-trigger]').length).toBe(1);
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

describe('civ-data-grid — interactive row activation (master-detail)', () => {
  it('does not fire civ-row-activate by default (interactive=false)', async () => {
    const el = await mountGrid({ rows: [{ id: '1', cells: { name: 'A' } }] });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    const row = el.querySelector('tbody tr') as HTMLElement;
    row.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires civ-row-activate when an interactive row body is clicked', async () => {
    const rows: GridRow[] = [{ id: '42', cells: { name: 'Smith' } }];
    const el = await mountGrid({ rows, interactive: true });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    // Click the body cell, not the row element directly — matches a real user click.
    const cell = el.querySelector('tbody tr .civ-data-grid__td') as HTMLElement;
    cell.click();
    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.rowId).toBe('42');
    expect(detail.row.id).toBe('42');
  });

  it('adds the interactive class to interactive rows', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' } }],
      interactive: true,
    });
    const row = el.querySelector('tbody tr') as HTMLElement;
    expect(row.classList.contains('civ-data-grid__tr--interactive')).toBe(true);
  });

  it('does not add the interactive class to disabled rows', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, disabled: true }],
      interactive: true,
    });
    const row = el.querySelector('tbody tr') as HTMLElement;
    expect(row.classList.contains('civ-data-grid__tr--interactive')).toBe(false);
  });

  it('does not fire civ-row-activate on disabled rows', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, disabled: true }],
      interactive: true,
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    const cell = el.querySelector('tbody tr .civ-data-grid__td') as HTMLElement;
    cell.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire civ-row-activate when the select-cell checkbox is clicked', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' } }],
      interactive: true,
      selectable: 'multiple',
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    const checkbox = el.querySelector(
      'tbody tr .civ-data-grid__td--select input',
    ) as HTMLInputElement;
    checkbox.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire civ-row-activate when the actions kebab trigger is clicked', async () => {
    const el = await mountGrid({
      rows: [
        {
          id: '1',
          cells: { name: 'A' },
          actions: [{ id: 'edit', label: 'Edit' }],
        },
      ],
      interactive: true,
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    const trigger = el.querySelector(
      'tbody tr .civ-data-grid__td--actions civ-action-button',
    ) as HTMLElement;
    trigger.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('warns in dev mode when interactive=true and no row has actions (mouse-only affordance)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' } }],
      interactive: true,
    });
    // Confirm the diagnostic surfaced for this consumer.
    expect(warn).toHaveBeenCalled();
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).toMatch(/civ-data-grid/);
    expect(message).toMatch(/mouse-only/);

    // Per-instance dedupe — second update doesn't re-fire.
    warn.mockClear();
    el.rows = [{ id: '2', cells: { name: 'B' } }];
    await elementUpdated(el);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('does not warn when interactive=true and at least one row has actions', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mountGrid({
      rows: [
        { id: '1', cells: { name: 'A' }, actions: [{ id: 'view', label: 'View details' }] },
      ],
      interactive: true,
    });
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).not.toMatch(/mouse-only/);
    warn.mockRestore();
  });

  it('does not fire civ-row-activate on Enter or Space keypress (keyboard activation deferred to v2)', async () => {
    // The deliberate v1 gap: row-level keyboard activation would require
    // overriding <tr> with role="button", which the WAI-ARIA Authoring
    // Practices guidance for <table>-based grids discourages. Keyboard
    // users reach the same destination via a per-row action button.
    // If a future change adds row keyboard activation, this test will
    // catch it so the tradeoff gets a deliberate revisit.
    const rows: GridRow[] = [{ id: '1', cells: { name: 'A' } }];
    const el = await mountGrid({ rows, interactive: true });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    const row = el.querySelector('tbody tr') as HTMLElement;
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire civ-row-activate when an interactive descendant in a cell formatter is clicked', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' } }],
      interactive: true,
      columns: [
        {
          key: 'name',
          header: 'Name',
          formatter: () => {
            // Insert a real <a> via the formatter (Lit will render it).
            const el = document.createElement('a');
            el.setAttribute('href', '#');
            el.setAttribute('data-testid', 'cell-link');
            el.textContent = 'Open';
            return el as unknown as string;
          },
        },
      ],
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    const link = el.querySelector('[data-testid="cell-link"]') as HTMLElement;
    // jsdom won't navigate; preventDefault would normally happen but we
    // only care that the row-activate skips when the click target is a link.
    link?.click();
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('civ-data-grid — expandable rows', () => {
  it('does not render the expand column when no row is expandable', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' } }, { id: '2', cells: { name: 'B' } }],
    });
    expect(el.querySelector('.civ-data-grid__th--expand')).toBeNull();
    expect(el.querySelector('.civ-data-grid__td--expand')).toBeNull();
  });

  it('renders an expand column at the leading edge when any row is expandable', async () => {
    const el = await mountGrid({
      rows: [
        { id: '1', cells: { name: 'A' }, expandable: true },
        { id: '2', cells: { name: 'B' } },
      ],
    });
    const header = el.querySelector('thead tr') as HTMLElement;
    const firstHeaderCell = header.querySelector('th') as HTMLElement;
    expect(firstHeaderCell.classList.contains('civ-data-grid__th--expand')).toBe(true);

    const rows = Array.from(el.querySelectorAll('tbody tr')) as HTMLElement[];
    // Expandable row gets a chevron toggle button.
    expect(rows[0].querySelector('.civ-data-grid__expand-toggle')).not.toBeNull();
    // Non-expandable row gets an empty expand cell (no button).
    expect(rows[1].querySelector('.civ-data-grid__td--expand')).not.toBeNull();
    expect(rows[1].querySelector('.civ-data-grid__expand-toggle')).toBeNull();
  });

  it('renders the chevron toggle button with aria-expanded reflecting current state', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: [],
    });
    let toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    el.expandedRowIds = ['1'];
    await elementUpdated(el);
    toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('fires civ-row-expand with the target state when the chevron is clicked', async () => {
    const el = await mountGrid({
      rows: [{ id: '42', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: [],
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-expand', handler);

    const toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    toggle.click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.rowId).toBe('42');
    expect(detail.expanded).toBe(true);
    expect(detail.row.id).toBe('42');
  });

  it('fires civ-row-expand with expanded=false when toggling an already-expanded row', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: ['1'],
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-expand', handler);
    const toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    toggle.click();
    expect(handler.mock.calls[0][0].detail.expanded).toBe(false);
  });

  it('renders a detail row immediately after each expanded row', async () => {
    const el = await mountGrid({
      rows: [
        { id: '1', cells: { name: 'A' }, expandable: true },
        { id: '2', cells: { name: 'B' }, expandable: true },
      ],
      expandedRowIds: ['1'],
      expandTemplate: (row) => `Details for ${(row.cells as any).name}`,
    });
    const tbodyRows = Array.from(el.querySelectorAll('tbody tr')) as HTMLElement[];
    // Order: data1, detail1, data2 (not expanded).
    expect(tbodyRows.length).toBe(3);
    expect(tbodyRows[0].getAttribute('data-row-id')).toBe('1');
    expect(tbodyRows[1].classList.contains('civ-data-grid__tr--detail')).toBe(true);
    expect(tbodyRows[1].getAttribute('data-detail-for')).toBe('1');
    expect(tbodyRows[2].getAttribute('data-row-id')).toBe('2');
  });

  it('passes the row to expandTemplate and renders the returned content', async () => {
    const calls: any[] = [];
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'Smith' }, expandable: true }],
      expandedRowIds: ['1'],
      expandTemplate: (row) => {
        calls.push(row);
        return `Hello ${(row.cells as any).name}`;
      },
    });
    expect(calls.length).toBe(1);
    expect(calls[0].id).toBe('1');
    const detail = el.querySelector('.civ-data-grid__td--detail') as HTMLElement;
    expect(detail.textContent?.trim()).toBe('Hello Smith');
  });

  it('detail td colspan matches the total column count', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name' }, { key: 'age', header: 'Age' }],
      rows: [{ id: '1', cells: { name: 'A', age: 30 }, expandable: true }],
      expandedRowIds: ['1'],
      selectable: 'multiple',
      expandTemplate: () => 'd',
    });
    const detail = el.querySelector('.civ-data-grid__td--detail') as HTMLElement;
    // 2 columns + select + expand = 4
    expect(detail.getAttribute('colspan')).toBe('4');
  });

  it('disabled expandable rows have a disabled toggle button and do not dispatch', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true, disabled: true }],
      expandedRowIds: [],
    });
    const toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
    const handler = vi.fn();
    el.addEventListener('civ-row-expand', handler);
    // Clicking a disabled native button does nothing; assert no event fires.
    toggle.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('chevron click does not bubble to civ-row-activate when interactive=true', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: [],
      interactive: true,
    });
    const expandHandler = vi.fn();
    const activateHandler = vi.fn();
    el.addEventListener('civ-row-expand', expandHandler);
    el.addEventListener('civ-row-activate', activateHandler);
    const toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    toggle.click();
    expect(expandHandler).toHaveBeenCalledOnce();
    expect(activateHandler).not.toHaveBeenCalled();
  });

  it('adds expanded class to the data row when expanded', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: ['1'],
      expandTemplate: () => '',
    });
    const dataRow = el.querySelector('tbody tr[data-row-id="1"]') as HTMLElement;
    expect(dataRow.classList.contains('civ-data-grid__tr--expanded')).toBe(true);
  });

  it('renders an empty detail when expandTemplate is not provided', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: ['1'],
      // No expandTemplate.
    });
    const detail = el.querySelector('.civ-data-grid__td--detail') as HTMLElement;
    expect(detail).not.toBeNull();
    expect(detail.textContent?.trim()).toBe('');
    warn.mockRestore();
  });

  it('ignores expandedRowIds entries for non-expandable rows (consumer-error case)', async () => {
    // A consumer who flips row.expandable off while the row id is still
    // in expandedRowIds shouldn't see a hybrid render — no detail row, no
    // --expanded class on the data row.
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: false }],
      expandedRowIds: ['1'],
      expandTemplate: () => 'should not appear',
    });
    expect(el.querySelector('.civ-data-grid__td--detail')).toBeNull();
    const dataRow = el.querySelector('tbody tr[data-row-id="1"]') as HTMLElement;
    expect(dataRow.classList.contains('civ-data-grid__tr--expanded')).toBe(false);
  });

  it('toggles via the chevron button on Enter / Space keypress (keyboard activation)', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: [],
    });
    const handler = vi.fn();
    el.addEventListener('civ-row-expand', handler);
    const toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    // Native <button> elements fire `click` on Enter / Space — assert
    // a real click reaches the handler since that's how keyboard users
    // activate the chevron.
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('chevron aria-controls references the detail td id (a11y contract)', async () => {
    const el = await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandedRowIds: ['1'],
      expandTemplate: () => 'detail',
    });
    const toggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    const detailId = toggle.getAttribute('aria-controls');
    expect(detailId).toBeTruthy();
    const detail = document.getElementById(detailId!);
    expect(detail).not.toBeNull();
    expect(detail!.classList.contains('civ-data-grid__td--detail')).toBe(true);
  });

  it('warns in dev mode when expandable rows exist with no expandTemplate', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      // No expandTemplate.
    });
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).toMatch(/civ-data-grid/);
    expect(message).toMatch(/expandTemplate/);
    warn.mockRestore();
  });

  it('does not warn when expandTemplate is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mountGrid({
      rows: [{ id: '1', cells: { name: 'A' }, expandable: true }],
      expandTemplate: () => 'detail',
    });
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).not.toMatch(/expandTemplate/);
    warn.mockRestore();
  });
});

describe('civ-data-grid — inline cell editing', () => {
  it('does not show edit affordance for non-editable columns', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name' }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const cell = el.querySelector('tbody td') as HTMLElement;
    expect(cell.classList.contains('civ-data-grid__td--editable')).toBe(false);
    cell.click();
    expect(el.querySelector('.civ-data-grid__edit-input')).toBeNull();
  });

  it('adds the --editable class to cells in editable columns', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const cell = el.querySelector('tbody td') as HTMLElement;
    expect(cell.classList.contains('civ-data-grid__td--editable')).toBe(true);
  });

  it('starts edit mode and fires civ-cell-edit-start when an editable cell is clicked', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-start', handler);
    const cell = el.querySelector('tbody td') as HTMLElement;
    cell.click();
    await elementUpdated(el);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toMatchObject({ rowId: '1', columnKey: 'name' });
    expect(el.querySelector('.civ-data-grid__edit-input')).not.toBeNull();
  });

  it('renders a <select> when inputType is "select"', async () => {
    const el = await mountGrid({
      columns: [{
        key: 'status',
        header: 'Status',
        editable: true,
        inputType: 'select',
        options: [
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ],
      }],
      rows: [{ id: '1', cells: { status: 'open' } }],
    });
    const cell = el.querySelector('tbody td') as HTMLElement;
    cell.click();
    await elementUpdated(el);
    const select = el.querySelector('select.civ-data-grid__edit-input') as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.value).toBe('open');
    expect(select.querySelectorAll('option').length).toBe(2);
  });

  it('renders type=number input when inputType is "number"', async () => {
    const el = await mountGrid({
      columns: [{ key: 'age', header: 'Age', editable: true, inputType: 'number' }],
      rows: [{ id: '1', cells: { age: 42 } }],
    });
    const cell = el.querySelector('tbody td') as HTMLElement;
    cell.click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.value).toBe('42');
  });

  it('commits with civ-cell-edit-commit on Enter', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-commit', handler);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'Doe';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toMatchObject({
      rowId: '1', columnKey: 'name', value: 'Doe',
    });
  });

  it('commits with parsed numeric value when inputType is "number"', async () => {
    const el = await mountGrid({
      columns: [{ key: 'age', header: 'Age', editable: true, inputType: 'number' }],
      rows: [{ id: '1', cells: { age: 42 } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-commit', handler);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = '99';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(handler.mock.calls[0][0].detail.value).toBe(99);
    expect(typeof handler.mock.calls[0][0].detail.value).toBe('number');
  });

  it('cancels with civ-cell-edit-cancel on Escape and reverts to display mode', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const commitH = vi.fn();
    const cancelH = vi.fn();
    el.addEventListener('civ-cell-edit-commit', commitH);
    el.addEventListener('civ-cell-edit-cancel', cancelH);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'changed';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await elementUpdated(el);
    expect(cancelH).toHaveBeenCalledOnce();
    expect(commitH).not.toHaveBeenCalled();
    // Cell is back to display mode showing the original value.
    expect(el.querySelector('.civ-data-grid__edit-input')).toBeNull();
    expect(el.querySelector('tbody td')?.textContent?.trim()).toBe('Smith');
  });

  it('commits on blur', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-commit', handler);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'Doe';
    input.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.value).toBe('Doe');
  });

  it('blocks commit and shows inline error when validate returns a message', async () => {
    const el = await mountGrid({
      columns: [{
        key: 'name',
        header: 'Name',
        editable: true,
        validate: (v) => (typeof v === 'string' && v.length < 3 ? 'Too short' : null),
      }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-commit', handler);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'No';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();
    const error = el.querySelector('.civ-data-grid__edit-error') as HTMLElement;
    expect(error).not.toBeNull();
    expect(error.textContent?.trim()).toBe('Too short');
    expect(error.getAttribute('role')).toBe('alert');
    // Still in edit mode.
    expect(el.querySelector('.civ-data-grid__edit-input')).not.toBeNull();
  });

  it('commits a corrected value after a validation failure', async () => {
    const el = await mountGrid({
      columns: [{
        key: 'name',
        header: 'Name',
        editable: true,
        validate: (v) => (typeof v === 'string' && v.length < 3 ? 'Too short' : null),
      }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-commit', handler);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    let input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'No';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();
    // Correct the value.
    input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'Doe';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.value).toBe('Doe');
  });

  it('does not start edit mode on a disabled row', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' }, disabled: true }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-start', handler);
    const cell = el.querySelector('tbody td') as HTMLElement;
    cell.click();
    expect(handler).not.toHaveBeenCalled();
    expect(el.querySelector('.civ-data-grid__edit-input')).toBeNull();
  });

  it('does not fire civ-row-activate when an editable cell is clicked on an interactive grid', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
      interactive: true,
    });
    const activate = vi.fn();
    const editStart = vi.fn();
    el.addEventListener('civ-row-activate', activate);
    el.addEventListener('civ-cell-edit-start', editStart);
    (el.querySelector('tbody td') as HTMLElement).click();
    expect(editStart).toHaveBeenCalledOnce();
    expect(activate).not.toHaveBeenCalled();
  });

  it('wraps editable cell value in a focusable <button> in display mode', async () => {
    // The button is the keyboard focus stop for editable cells. Without
    // it the cell is a plain <td> — not focusable, mouse-only.
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const trigger = el.querySelector('.civ-data-grid__edit-cell-trigger') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.tagName).toBe('BUTTON');
    // Native <button> is keyboard-focusable by default.
    expect(trigger.tabIndex).toBe(0);
    expect(trigger.textContent?.trim()).toBe('Smith');
  });

  it('non-editable cells do NOT get a trigger button (cleaner DOM)', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name' }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    expect(el.querySelector('.civ-data-grid__edit-cell-trigger')).toBeNull();
  });

  it('keyboard-activates edit mode via Enter on the focused trigger button', async () => {
    // Native <button> dispatches click on Enter — this is how keyboard
    // users activate edit mode.
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const editStart = vi.fn();
    el.addEventListener('civ-cell-edit-start', editStart);
    const trigger = el.querySelector('.civ-data-grid__edit-cell-trigger') as HTMLButtonElement;
    trigger.focus();
    // jsdom synthesizes the click on button.click() — same path Enter takes.
    trigger.click();
    expect(editStart).toHaveBeenCalledOnce();
  });

  it('commits cell A and starts edit on cell B when user clicks another editable cell', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'name', header: 'Name', editable: true },
        { key: 'role', header: 'Role', editable: true },
      ],
      rows: [{ id: '1', cells: { name: 'Smith', role: 'Admin' } }],
    });
    const commit = vi.fn();
    const editStart = vi.fn();
    el.addEventListener('civ-cell-edit-commit', commit);
    el.addEventListener('civ-cell-edit-start', editStart);

    // Start edit on Name.
    (el.querySelector('tbody td:first-child') as HTMLElement).click();
    await elementUpdated(el);
    const inputA = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    inputA.value = 'Doe';
    // Simulate blur (browser fires it when the user clicks elsewhere).
    inputA.dispatchEvent(new FocusEvent('blur', { bubbles: false }));

    // Then click the Role cell.
    (el.querySelectorAll('tbody td')[1] as HTMLElement).click();
    await elementUpdated(el);

    // Name commit fired with the typed value.
    expect(commit).toHaveBeenCalledOnce();
    expect(commit.mock.calls[0][0].detail).toMatchObject({
      rowId: '1', columnKey: 'name', value: 'Doe',
    });
    // Role is now in edit mode.
    expect(editStart.mock.calls.length).toBe(2);
    expect(editStart.mock.calls[1][0].detail).toMatchObject({
      rowId: '1', columnKey: 'role',
    });
  });

  it('clears the validation error when the user switches to editing another cell', async () => {
    const el = await mountGrid({
      columns: [
        {
          key: 'name', header: 'Name', editable: true,
          validate: (v) => (typeof v === 'string' && v.length < 3 ? 'Too short' : null),
        },
        { key: 'role', header: 'Role', editable: true },
      ],
      rows: [{ id: '1', cells: { name: 'Smith', role: 'Admin' } }],
    });
    // Fail validation on Name.
    (el.querySelector('tbody td:first-child') as HTMLElement).click();
    await elementUpdated(el);
    const inputA = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    inputA.value = 'No';
    inputA.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await elementUpdated(el);
    expect(el.querySelector('.civ-data-grid__edit-error')?.textContent?.trim()).toBe('Too short');

    // Switch to editing Role — the error should not carry over.
    (el.querySelectorAll('tbody td')[1] as HTMLElement).click();
    await elementUpdated(el);
    expect(el.querySelector('.civ-data-grid__edit-error')).toBeNull();
  });

  it('commits on click-outside (any document click that blurs the input)', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name', editable: true }],
      rows: [{ id: '1', cells: { name: 'Smith' } }],
    });
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-commit', handler);
    (el.querySelector('tbody td') as HTMLElement).click();
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'Doe';
    // Simulate the blur that would happen on a click outside the grid.
    input.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.value).toBe('Doe');
  });

  // Note: the NaN guard in _commitEdit is defensive code for browsers
  // that allow non-numeric input through type="number" (older Safari,
  // some edge cases with paste behavior). jsdom rejects the assignment
  // entirely (`input.value = 'abc'` → ''), so the path is not directly
  // reachable in tests. The behavior is documented inline at the guard.
});

describe('civ-data-grid — sticky columns', () => {
  it('does not add sticky classes when no column has sticky', async () => {
    const el = await mountGrid({
      columns: [{ key: 'name', header: 'Name' }],
      rows: [{ id: '1', cells: { name: 'A' } }],
    });
    expect(el.querySelector('.civ-data-grid__cell--sticky')).toBeNull();
  });

  it('applies position: sticky to header and body cells of a start-sticky column', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start' },
        { key: 'name', header: 'Name' },
      ],
      rows: [{ id: '1', cells: { id: 'A-1', name: 'Smith' } }],
    });
    const th = el.querySelector('thead th:first-child') as HTMLElement;
    const td = el.querySelector('tbody td:first-child') as HTMLElement;
    expect(th.classList.contains('civ-data-grid__cell--sticky')).toBe(true);
    expect(th.classList.contains('civ-data-grid__cell--sticky-start')).toBe(true);
    expect(th.getAttribute('style')).toContain('position: sticky');
    expect(th.getAttribute('style')).toContain('inset-inline-start: 0');
    expect(td.getAttribute('style')).toContain('position: sticky');
  });

  it('does not stick non-sticky columns', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start' },
        { key: 'name', header: 'Name' },
      ],
      rows: [{ id: '1', cells: { id: 'A-1', name: 'Smith' } }],
    });
    const nonStickyTh = el.querySelectorAll('thead th')[1] as HTMLElement;
    expect(nonStickyTh.classList.contains('civ-data-grid__cell--sticky')).toBe(false);
  });

  it('accumulates offsets across multiple start-sticky columns', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start' },
        { key: 'name', header: 'Name', width: '12rem', sticky: 'start' },
        { key: 'role', header: 'Role' },
      ],
      rows: [{ id: '1', cells: { id: 'A-1', name: 'Smith', role: 'Admin' } }],
    });
    const ths = el.querySelectorAll('thead th');
    const first = ths[0] as HTMLElement;
    const second = ths[1] as HTMLElement;
    expect(first.getAttribute('style')).toContain('inset-inline-start: 0');
    // Second sticky column starts after the first's width.
    expect(second.getAttribute('style')).toMatch(/inset-inline-start:\s*calc\(4rem\)/);
  });

  it('handles end-sticky columns with right offsets accumulated in reverse', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'a', header: 'A', width: '6rem', sticky: 'end' },
        { key: 'b', header: 'B', width: '8rem', sticky: 'end' },
      ],
      rows: [{ id: '1', cells: { name: 'Smith', a: 1, b: 2 } }],
    });
    const ths = el.querySelectorAll('thead th') as NodeListOf<HTMLElement>;
    // Rightmost (B) gets offset 0; A accumulates B's 8rem.
    expect(ths[2].getAttribute('style')).toContain('inset-inline-end: 0');
    expect(ths[1].getAttribute('style')).toMatch(/inset-inline-end:\s*calc\(8rem\)/);
    expect(ths[1].classList.contains('civ-data-grid__cell--sticky-end')).toBe(true);
  });

  it('marks the last start-sticky column with the boundary class (for the shadow)', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start' },
        { key: 'name', header: 'Name', width: '12rem', sticky: 'start' },
        { key: 'role', header: 'Role' },
      ],
      rows: [{ id: '1', cells: { id: 'A-1', name: 'Smith', role: 'Admin' } }],
    });
    const ths = el.querySelectorAll('thead th') as NodeListOf<HTMLElement>;
    expect(ths[0].classList.contains('civ-data-grid__cell--sticky-boundary-start')).toBe(false);
    expect(ths[1].classList.contains('civ-data-grid__cell--sticky-boundary-start')).toBe(true);
  });

  it('marks the first end-sticky column with the boundary class', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'a', header: 'A', width: '6rem', sticky: 'end' },
        { key: 'b', header: 'B', width: '8rem', sticky: 'end' },
      ],
      rows: [{ id: '1', cells: { name: 'Smith', a: 1, b: 2 } }],
    });
    const ths = el.querySelectorAll('thead th') as NodeListOf<HTMLElement>;
    // The visually-leftmost end-sticky column (A) is the boundary.
    expect(ths[1].classList.contains('civ-data-grid__cell--sticky-boundary-end')).toBe(true);
    expect(ths[2].classList.contains('civ-data-grid__cell--sticky-boundary-end')).toBe(false);
  });

  it('warns in dev mode when multiple sticky columns share an edge without explicit widths', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start' },
        // Second sticky column without width — can't accumulate the offset.
        { key: 'name', header: 'Name', sticky: 'start' },
      ],
      rows: [{ id: '1', cells: { id: 'A-1', name: 'Smith' } }],
    });
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).toMatch(/civ-data-grid/);
    expect(message).toMatch(/sticky/);
    expect(message).toMatch(/width/);
    warn.mockRestore();
  });

  it('does not warn when only a single sticky column per edge omits width', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mountGrid({
      columns: [
        // First sticky column — width is fine to omit; offset is 0.
        { key: 'id', header: 'ID', sticky: 'start' },
        { key: 'name', header: 'Name' },
      ],
      rows: [{ id: '1', cells: { id: 'A-1', name: 'Smith' } }],
    });
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).not.toMatch(/sticky/);
    warn.mockRestore();
  });

  it('applies sticky styles to editable cells too', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start', editable: true },
      ],
      rows: [{ id: '1', cells: { id: 'A-1' } }],
    });
    const td = el.querySelector('tbody td') as HTMLElement;
    expect(td.classList.contains('civ-data-grid__cell--sticky')).toBe(true);
    expect(td.getAttribute('style')).toContain('position: sticky');
  });

  it('selected rows set --_civ-sticky-bg so sticky cells share the selection background', async () => {
    // The cascade pattern: rather than overriding the sticky cell's
    // background directly, the row sets a CSS custom property that
    // the sticky cell consumes. This keeps stripe / select / hover
    // visuals consistent through the pinned columns.
    const el = await mountGrid({
      columns: [{ key: 'id', header: 'ID', width: '4rem', sticky: 'start' }],
      rows: [{ id: '1', cells: { id: 'A-1' } }],
      selectable: 'multiple',
      selectedRowIds: ['1'],
    });
    const row = el.querySelector('tbody tr') as HTMLElement;
    expect(row.classList.contains('civ-data-grid__tr--selected')).toBe(true);
    // Don't assert the resolved background (jsdom doesn't compute it
    // reliably) — verify the cascade source classes are on the row,
    // which is what drives the styling.
    const stickyCell = row.querySelector('.civ-data-grid__cell--sticky') as HTMLElement;
    expect(stickyCell).not.toBeNull();
  });

  it('striped grids put both row-background and sticky-bg cascade on odd rows', async () => {
    const el = await mountGrid({
      columns: [{ key: 'id', header: 'ID', width: '4rem', sticky: 'start' }],
      rows: [
        { id: '1', cells: { id: 'A-1' } },
        { id: '2', cells: { id: 'A-2' } },
      ],
    });
    el.striped = true;
    await elementUpdated(el);
    // The striped + sticky CSS rules target `.civ-data-grid--striped
    // .civ-data-grid__tbody .civ-data-grid__tr:nth-child(odd)` — verify
    // the wrapper class is in place and the rows have sticky cells.
    expect(el.querySelector('.civ-data-grid--striped')).not.toBeNull();
    const stickyCells = el.querySelectorAll('tbody .civ-data-grid__cell--sticky');
    expect(stickyCells.length).toBe(2);
  });

  it('sticky-header cell gets the higher z-index token (corner cell layering)', async () => {
    // When both sticky-header (on the grid) and a sticky-start column
    // are active, the top-left corner cell needs to layer above the
    // body sticky cells. The CSS uses --civ-z-sticky-header in the
    // thead descendant selector — verify the header cell carries the
    // sticky class so the rule matches.
    const el = await mountGrid({
      columns: [{ key: 'id', header: 'ID', width: '4rem', sticky: 'start' }],
      rows: [{ id: '1', cells: { id: 'A-1' } }],
    });
    el.stickyHeader = true;
    await elementUpdated(el);
    const cornerCell = el.querySelector('thead .civ-data-grid__cell--sticky') as HTMLElement;
    expect(cornerCell).not.toBeNull();
    expect(cornerCell.tagName).toBe('TH');
  });

  it('still emits the sticky classes when responsive="stacked" (CSS handles the reset at narrow viewports)', async () => {
    // The render path doesn't conditionally drop sticky based on
    // responsive mode — that would require knowing the viewport. The
    // sticky styles are present in the DOM but neutralized by the
    // `@media (max-width: 480px)` rule in components.css. Test verifies
    // the class is still on the cell (the media query handles the
    // visual neutralization separately).
    const el = await mountGrid({
      columns: [{ key: 'id', header: 'ID', width: '4rem', sticky: 'start' }],
      rows: [{ id: '1', cells: { id: 'A-1' } }],
    });
    // responsive defaults to 'stacked'
    expect(el.responsive).toBe('stacked');
    const td = el.querySelector('tbody td') as HTMLElement;
    expect(td.classList.contains('civ-data-grid__cell--sticky')).toBe(true);
  });
});

describe('civ-data-grid — group-by', () => {
  const groupColumns: GridColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'applicant', header: 'Applicant' },
    { key: 'type', header: 'Type' },
  ];
  const groupRows: GridRow[] = [
    { id: '1', cells: { id: 'A-1', applicant: 'Smith', type: 'Disability' } },
    { id: '2', cells: { id: 'A-2', applicant: 'Doe', type: 'Disability' } },
    { id: '3', cells: { id: 'A-3', applicant: 'Reyes', type: 'Pension' } },
    { id: '4', cells: { id: 'A-4', applicant: 'Chen', type: 'Pension' } },
  ];

  it('does not group by default (groupBy is empty)', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    expect(el.querySelectorAll('.civ-data-grid__tr--group').length).toBe(0);
    expect(el.querySelectorAll('tbody tr').length).toBe(4);
  });

  it('renders a group header row per distinct group when groupBy is set', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    await elementUpdated(el);
    const groupHeaders = el.querySelectorAll('.civ-data-grid__tr--group');
    expect(groupHeaders.length).toBe(2);
    const keys = Array.from(groupHeaders).map((h) => h.getAttribute('data-group-key'));
    expect(keys).toEqual(['Disability', 'Pension']);
  });

  it('group header spans all visible columns via colspan', async () => {
    const el = await mountGrid({
      columns: groupColumns,
      rows: groupRows,
      selectable: 'multiple',
    });
    el.groupBy = 'type';
    await elementUpdated(el);
    const header = el.querySelector('.civ-data-grid__td--group') as HTMLElement;
    // 3 columns + 1 select = 4
    expect(header.getAttribute('colspan')).toBe('4');
  });

  it('group header label defaults to "{key} ({count})"', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    await elementUpdated(el);
    const labels = Array.from(
      el.querySelectorAll<HTMLElement>('.civ-data-grid__group-label'),
    ).map((n) => n.textContent?.trim());
    expect(labels).toEqual(['Disability (2)', 'Pension (2)']);
  });

  it('groupLabel callback overrides the default label', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    el.groupLabel = (key: string, rows: any[]) => `${key.toUpperCase()} — ${rows.length} applicant(s)`;
    await elementUpdated(el);
    const labels = Array.from(
      el.querySelectorAll<HTMLElement>('.civ-data-grid__group-label'),
    ).map((n) => n.textContent?.trim());
    expect(labels[0]).toBe('DISABILITY — 2 applicant(s)');
  });

  it('renders all rows when no expandedGroups is set (default-all-expanded)', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    await elementUpdated(el);
    // tbody has: 2 group headers + 4 data rows = 6.
    expect(el.querySelectorAll('tbody tr').length).toBe(6);
  });

  it('hides rows whose group is not in expandedGroups', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    el.expandedGroups = ['Disability']; // Pension collapsed
    await elementUpdated(el);
    // 2 group headers + 2 Disability rows (Pension's 2 rows hidden) = 4.
    expect(el.querySelectorAll('tbody tr').length).toBe(4);
    // Pension rows should not be in the DOM.
    const text = el.querySelector('tbody')?.textContent ?? '';
    expect(text).toContain('Smith');
    expect(text).toContain('Doe');
    expect(text).not.toContain('Reyes');
    expect(text).not.toContain('Chen');
  });

  it('chevron aria-expanded reflects current state per group', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    el.expandedGroups = ['Disability'];
    await elementUpdated(el);
    const toggles = Array.from(el.querySelectorAll<HTMLButtonElement>('.civ-data-grid__group-toggle'));
    expect(toggles[0].getAttribute('aria-expanded')).toBe('true');
    expect(toggles[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('fires civ-group-toggle with target state when the chevron is clicked', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    el.expandedGroups = ['Disability', 'Pension'];
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-group-toggle', handler);
    const toggle = el.querySelector('.civ-data-grid__group-toggle') as HTMLButtonElement;
    toggle.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail).toEqual({
      groupKey: 'Disability',
      expanded: false, // target: collapse this one
    });
  });

  it('preserves group order from the rows array (insertion-ordered)', async () => {
    // Reverse the natural order — Pension first then Disability.
    const reordered: GridRow[] = [
      { id: '3', cells: { id: 'A-3', applicant: 'Reyes', type: 'Pension' } },
      { id: '1', cells: { id: 'A-1', applicant: 'Smith', type: 'Disability' } },
      { id: '4', cells: { id: 'A-4', applicant: 'Chen', type: 'Pension' } },
      { id: '2', cells: { id: 'A-2', applicant: 'Doe', type: 'Disability' } },
    ];
    const el = await mountGrid({ columns: groupColumns, rows: reordered });
    el.groupBy = 'type';
    await elementUpdated(el);
    const keys = Array.from(el.querySelectorAll('.civ-data-grid__tr--group'))
      .map((h) => h.getAttribute('data-group-key'));
    expect(keys).toEqual(['Pension', 'Disability']);
  });

  it('renders null/undefined group values under an empty-string key', async () => {
    const rows: GridRow[] = [
      { id: '1', cells: { id: 'A-1', applicant: 'Smith', type: null } },
      { id: '2', cells: { id: 'A-2', applicant: 'Doe', type: 'Disability' } },
    ];
    const el = await mountGrid({ columns: groupColumns, rows });
    el.groupBy = 'type';
    await elementUpdated(el);
    const keys = Array.from(el.querySelectorAll('.civ-data-grid__tr--group'))
      .map((h) => h.getAttribute('data-group-key'));
    expect(keys).toContain(''); // empty string for null
    expect(keys).toContain('Disability');
  });

  it('uses the i18n fallback label when the group key is empty', async () => {
    const rows: GridRow[] = [
      { id: '1', cells: { id: 'A-1', applicant: 'Smith', type: null } },
    ];
    const el = await mountGrid({ columns: groupColumns, rows });
    el.groupBy = 'type';
    await elementUpdated(el);
    const label = el.querySelector('.civ-data-grid__group-label') as HTMLElement;
    // i18n fallback "(no value)" appears for the empty group key.
    expect(label.textContent).toContain('(no value)');
  });

  it('explicit expandedGroups=[] collapses every group (consumer takes control)', async () => {
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'type';
    el.expandedGroups = [];
    await elementUpdated(el);
    // 2 group headers + 0 data rows.
    expect(el.querySelectorAll('tbody tr').length).toBe(2);
    const toggles = el.querySelectorAll<HTMLButtonElement>('.civ-data-grid__group-toggle');
    expect(toggles[0].getAttribute('aria-expanded')).toBe('false');
    expect(toggles[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('sticky-start columns still get sticky classes on data rows inside groups', async () => {
    const el = await mountGrid({
      columns: [
        { key: 'id', header: 'ID', width: '4rem', sticky: 'start' },
        { key: 'applicant', header: 'Applicant' },
        { key: 'type', header: 'Type' },
      ],
      rows: groupRows,
    });
    el.groupBy = 'type';
    await elementUpdated(el);
    // Find a data row (not a group header) and assert its first cell is sticky.
    const dataRows = el.querySelectorAll('tbody tr:not(.civ-data-grid__tr--group)');
    expect(dataRows.length).toBeGreaterThan(0);
    const firstCell = dataRows[0].querySelector('td') as HTMLElement;
    expect(firstCell.classList.contains('civ-data-grid__cell--sticky')).toBe(true);
    expect(firstCell.getAttribute('style')).toContain('position: sticky');
  });

  it('expandable rows inside a group still get a chevron and fire civ-row-expand', async () => {
    const rows: GridRow[] = [
      {
        id: '1',
        cells: { id: 'A-1', applicant: 'Smith', type: 'Disability' },
        expandable: true,
      },
    ];
    const el = await mountGrid({ columns: groupColumns, rows });
    el.groupBy = 'type';
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-row-expand', handler);
    const expandToggle = el.querySelector('.civ-data-grid__expand-toggle') as HTMLButtonElement;
    expect(expandToggle).not.toBeNull();
    expandToggle.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.rowId).toBe('1');
  });

  it('editable cells still fire civ-cell-edit-start when clicked inside a group', async () => {
    const rows: GridRow[] = [
      { id: '1', cells: { id: 'A-1', applicant: 'Smith', type: 'Disability' } },
    ];
    const cols: GridColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'applicant', header: 'Applicant', editable: true },
      { key: 'type', header: 'Type' },
    ];
    const el = await mountGrid({ columns: cols, rows });
    el.groupBy = 'type';
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-cell-edit-start', handler);
    const editableCell = el.querySelector('tbody tr:not(.civ-data-grid__tr--group) td:nth-child(2)') as HTMLElement;
    editableCell.click();
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.columnKey).toBe('applicant');
  });

  it('warns in dev mode when groupBy doesn\'t match any column key or row data', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await mountGrid({ columns: groupColumns, rows: groupRows });
    el.groupBy = 'typo-no-such-key';
    await elementUpdated(el);
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).toMatch(/groupBy/);
    expect(message).toMatch(/typo-no-such-key/);
    warn.mockRestore();
  });

  it('does NOT warn when groupBy matches a column.key (even if no row data has the key yet)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Column declares 'category' but rows haven't populated it — still legitimate.
    const cols: GridColumn[] = [
      ...groupColumns,
      { key: 'category', header: 'Category' },
    ];
    const el = await mountGrid({ columns: cols, rows: groupRows });
    el.groupBy = 'category';
    await elementUpdated(el);
    const message = warn.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(message).not.toMatch(/groupBy/);
    warn.mockRestore();
  });
});

describe('civ-data-grid — keyboard navigation', () => {
  // Helper — get the 2D cell layout (header row + body rows).
  function cells(el: any): HTMLElement[][] {
    const trs = Array.from(el.querySelectorAll('thead tr, tbody tr')) as HTMLElement[];
    return trs.map((tr) =>
      Array.from(tr.querySelectorAll(':scope > th, :scope > td')) as HTMLElement[],
    );
  }

  it('does NOT promote to role="grid" by default (semantic table is the default)', async () => {
    const el = await mountGrid();
    const table = el.querySelector('table.civ-data-grid__table');
    expect(table?.getAttribute('role')).toBeNull();
    const ths = el.querySelectorAll('thead th');
    expect(ths[0]?.getAttribute('role')).toBeNull();
  });

  it('promotes to role="grid" + role="columnheader" + role="gridcell" when keyboardNav=true', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const table = el.querySelector('table.civ-data-grid__table');
    expect(table?.getAttribute('role')).toBe('grid');
    const trs = el.querySelectorAll('thead tr, tbody tr');
    trs.forEach((tr: Element) => expect(tr.getAttribute('role')).toBe('row'));
    const headers = el.querySelectorAll('thead th');
    headers.forEach((th: Element) => expect(th.getAttribute('role')).toBe('columnheader'));
    const bodyCells = el.querySelectorAll('tbody td');
    bodyCells.forEach((td: Element) => expect(td.getAttribute('role')).toBe('gridcell'));
  });

  it('applies roving tabindex — exactly one cell at tabindex=0', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const focusable = el.querySelectorAll(
      '.civ-data-grid__th[tabindex="0"], .civ-data-grid__td[tabindex="0"]',
    );
    expect(focusable.length).toBe(1);
    // Initial position is (0, 0) — the first header cell.
    const grid = cells(el);
    expect(focusable[0]).toBe(grid[0][0]);
  });

  it('drops inner controls (sort button) to tabindex=-1 when keyboardNav=true', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const sortBtn = el.querySelector('.civ-data-grid__sort-btn') as HTMLButtonElement;
    expect(sortBtn).not.toBeNull();
    expect(sortBtn.tabIndex).toBe(-1);
  });

  it('arrow keys move the roving tabindex between cells', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // Start at (0, 0). ArrowRight → (0, 1).
    pressKey(grid[0][0], 'ArrowRight');
    expect(grid[0][1].tabIndex).toBe(0);
    expect(grid[0][0].tabIndex).toBe(-1);
    // ArrowDown → (1, 1) — first body row, second cell.
    pressKey(grid[0][1], 'ArrowDown');
    expect(grid[1][1].tabIndex).toBe(0);
  });

  it('Home moves to first cell in row; End moves to last cell in row', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // Move to (1, 2) first.
    pressKey(grid[0][0], 'ArrowDown');
    pressKey(grid[1][0], 'ArrowRight');
    pressKey(grid[1][1], 'ArrowRight');
    expect(grid[1][2].tabIndex).toBe(0);
    // Home → (1, 0)
    pressKey(grid[1][2], 'Home');
    expect(grid[1][0].tabIndex).toBe(0);
    // End → (1, last)
    pressKey(grid[1][0], 'End');
    const lastCol = grid[1].length - 1;
    expect(grid[1][lastCol].tabIndex).toBe(0);
  });

  it('Ctrl+Home moves to grid (0, 0); Ctrl+End moves to last cell of last row', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // Move somewhere in the middle.
    pressKey(grid[0][0], 'ArrowDown');
    pressKey(grid[1][0], 'ArrowRight');
    expect(grid[1][1].tabIndex).toBe(0);
    // Ctrl+End — last row, last col.
    pressKey(grid[1][1], 'End', { ctrlKey: true });
    const lastRow = grid.length - 1;
    const lastCol = grid[lastRow].length - 1;
    expect(grid[lastRow][lastCol].tabIndex).toBe(0);
    // Ctrl+Home — back to (0, 0).
    pressKey(grid[lastRow][lastCol], 'Home', { ctrlKey: true });
    expect(grid[0][0].tabIndex).toBe(0);
  });

  it('PageDown / PageUp move by 10 rows (clamped to the grid)', async () => {
    const BODY_ROWS = 25;
    const PAGE_STEP = 10;
    const TOTAL_ROWS = BODY_ROWS + 1; // +1 for the header row
    const LAST_ROW_INDEX = TOTAL_ROWS - 1;
    const manyRows: GridRow[] = Array.from({ length: BODY_ROWS }, (_, i) => ({
      id: `r${i}`,
      cells: { name: `Name ${i}`, status: 'A', updated: '2026-01-01' },
    }));
    const el = await mountGrid({ rows: manyRows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    expect(grid.length).toBe(TOTAL_ROWS);
    // PageDown from (0, 0) → (10, 0)
    pressKey(grid[0][0], 'PageDown');
    expect(grid[PAGE_STEP][0].tabIndex).toBe(0);
    // PageDown again → (20, 0)
    pressKey(grid[PAGE_STEP][0], 'PageDown');
    expect(grid[PAGE_STEP * 2][0].tabIndex).toBe(0);
    // PageDown beyond end clamps to the last row.
    pressKey(grid[PAGE_STEP * 2][0], 'PageDown');
    expect(grid[LAST_ROW_INDEX][0].tabIndex).toBe(0);
    // PageUp from last steps back one PAGE_STEP.
    pressKey(grid[LAST_ROW_INDEX][0], 'PageUp');
    expect(grid[LAST_ROW_INDEX - PAGE_STEP][0].tabIndex).toBe(0);
  });

  it('Enter on a sortable header activates the column sort', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    const grid = cells(el);
    pressKey(grid[0][0], 'Enter');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.column).toBe('name');
  });

  it('Enter on a select cell toggles row selection', async () => {
    const el = await mountGrid({ selectable: 'multiple' });
    el.keyboardNav = true;
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-selection-change', handler);
    // First body row, first cell = the select cell.
    const grid = cells(el);
    pressKey(grid[1][0], 'Enter');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.selectedRowIds).toEqual(['1']);
  });

  it('Enter on a plain cell of an interactive row fires civ-row-activate', async () => {
    const el = await mountGrid({
      interactive: true,
      rows: baseRows.map((r) => ({ ...r, actions: [{ id: 'view', label: 'View' }] })),
    });
    el.keyboardNav = true;
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-row-activate', handler);
    // (1, 0) in this grid is the row-actions cell? No — interactive + actions means actions column is present.
    // Layout: with selectable='none', actions=present: cells are [...visibleColumns, actionsCell]
    // So (1, 0) is the first data cell (name). Enter → it's plain text → row-activate.
    const grid = cells(el);
    pressKey(grid[1][0], 'Enter');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].detail.rowId).toBe('1');
  });

  it('F2 on an editable cell enters edit mode', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'amount', header: 'Amount', editable: true, inputType: 'number' },
    ];
    const rows: GridRow[] = [{ id: '1', cells: { name: 'A', amount: 42 } }];
    const el = await mountGrid({ columns: cols, rows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // (1, 1) is the editable amount cell.
    pressKey(grid[1][1], 'F2');
    await elementUpdated(el);
    expect(el._editingCell).toEqual({ rowId: '1', columnKey: 'amount' });
    const input = el.querySelector('.civ-data-grid__edit-input');
    expect(input).not.toBeNull();
  });

  it('refocuses the cell after edit commits when keyboardNav is on', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name', editable: true },
    ];
    const rows: GridRow[] = [{ id: '1', cells: { name: 'A' } }];
    const el = await mountGrid({ columns: cols, rows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    pressKey(grid[1][0], 'F2');
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__edit-input') as HTMLInputElement;
    input.value = 'B';
    pressKey(input, 'Enter');
    await elementUpdated(el);
    expect(el._editingCell).toBeNull();
    const after = cells(el);
    expect(after[1][0].tabIndex).toBe(0);
    expect(document.activeElement).toBe(after[1][0]);
  });

  it('reverts to plain semantic table when keyboardNav is toggled off', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    expect(el.querySelector('table')?.getAttribute('role')).toBe('grid');
    el.keyboardNav = false;
    await elementUpdated(el);
    expect(el.querySelector('table')?.getAttribute('role')).toBeNull();
    // Inner controls regain default tab order (no explicit tabindex).
    const sortBtn = el.querySelector('.civ-data-grid__sort-btn') as HTMLButtonElement;
    expect(sortBtn.getAttribute('tabindex')).toBeNull();
    // Cells lose their tabindex too.
    const firstTh = el.querySelector('thead th');
    expect(firstTh?.getAttribute('tabindex')).toBeNull();
  });

  it('focusin on a cell syncs the roving tabindex (mouse click compatibility)', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // Dispatch focusin on (2, 1) — simulates user clicking that cell.
    grid[2][1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(grid[2][1].tabIndex).toBe(0);
    expect(grid[0][0].tabIndex).toBe(-1);
  });

  it('arrow keys are inert when keyboardNav is off (default)', async () => {
    const el = await mountGrid();
    // keyboardNav is false by default.
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    const grid = cells(el);
    // Headers don't have tabindex=0 because keyboardNav is off, so they
    // aren't even focusable as a cell — but dispatching the event still
    // verifies the keydown handler bails out.
    pressKey(grid[0][0], 'ArrowRight');
    pressKey(grid[0][0], 'Enter');
    expect(handler).not.toHaveBeenCalled();
  });

  it('column memory restores the user\'s column after transiting a single-cell group row', async () => {
    // Three data rows with a `type` column we'll group by.
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status' },
    ];
    const rows: GridRow[] = [
      { id: '1', cells: { name: 'A', type: 'X', status: 'On' } },
      { id: '2', cells: { name: 'B', type: 'Y', status: 'Off' } },
      { id: '3', cells: { name: 'C', type: 'Y', status: 'On' } },
    ];
    const el = await mountGrid({ columns: cols, rows });
    el.groupBy = 'type';
    el.expandedGroups = ['X', 'Y'];
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // Layout (with groupBy):
    //   row 0: thead — 3 column-header cells
    //   row 1: group "X" header — 1 col-span cell
    //   row 2: data row id=1 — 3 cells
    //   row 3: group "Y" header — 1 col-span cell
    //   row 4: data row id=2 — 3 cells
    //   row 5: data row id=3 — 3 cells
    // Navigate header (0, 2) "Status".
    pressKey(grid[0][0], 'ArrowRight');
    pressKey(grid[0][1], 'ArrowRight');
    expect(grid[0][2].tabIndex).toBe(0);
    // ArrowDown into the "X" group row — only col 0 exists, focus collapses.
    pressKey(grid[0][2], 'ArrowDown');
    expect(grid[1][0].tabIndex).toBe(0);
    expect(grid[1].length).toBe(1);
    // ArrowDown into the data row — col 2 should be restored from memory.
    pressKey(grid[1][0], 'ArrowDown');
    expect(grid[2][2].tabIndex).toBe(0);
    // Continue down through "Y" group row to next data row — col 2 still restored.
    pressKey(grid[2][2], 'ArrowDown');
    expect(grid[3][0].tabIndex).toBe(0); // Y group header
    pressKey(grid[3][0], 'ArrowDown');
    expect(grid[4][2].tabIndex).toBe(0);
  });

  it('column memory does not survive an explicit horizontal nav', async () => {
    // After moving with ArrowLeft, vertical nav uses the new column.
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    pressKey(grid[0][0], 'ArrowRight');
    pressKey(grid[0][1], 'ArrowRight'); // now at (0, 2)
    pressKey(grid[0][2], 'ArrowLeft'); // now at (0, 1) — memory becomes 1
    pressKey(grid[0][1], 'ArrowDown'); // (1, 1)
    expect(grid[1][1].tabIndex).toBe(0);
  });

  it('Escape returns focus to the cell when focus is on an inner control', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    const sortBtn = el.querySelector('.civ-data-grid__sort-btn') as HTMLButtonElement;
    sortBtn.focus();
    expect(document.activeElement).toBe(sortBtn);
    pressKey(sortBtn, 'Escape');
    expect(document.activeElement).toBe(grid[0][0]);
  });

  it('Escape is inert when focus is already on the cell (lets consumer-level handlers run)', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    grid[0][0].focus();
    // Need to inspect defaultPrevented on the event object, so dispatch
    // raw rather than via pressKey (which doesn't return the event).
    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    grid[0][0].dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('arrow keys work when focus is on an inner control (mouse-clicked into the grid)', async () => {
    const el = await mountGrid();
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    const sortBtn = el.querySelector('.civ-data-grid__sort-btn') as HTMLButtonElement;
    sortBtn.focus();
    pressKey(sortBtn, 'ArrowDown');
    expect(grid[1][0].tabIndex).toBe(0);
  });

  it('column memory preserves col position across expand-detail rows', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'status', header: 'Status' },
      { key: 'updated', header: 'Updated' },
    ];
    const rows: GridRow[] = [
      { id: '1', cells: { name: 'A', status: 'On', updated: '1' }, expandable: true },
      { id: '2', cells: { name: 'B', status: 'Off', updated: '2' } },
    ];
    const el = await mountGrid({
      columns: cols,
      rows,
      expandedRowIds: ['1'],
      expandTemplate: () => 'detail',
    });
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // Layout: row 0 = header (4 cells incl. expand col); row 1 = data row 1 (4 cells);
    // row 2 = detail row (1 col-span cell); row 3 = data row 2 (4 cells).
    // Move to (1, 3) — the "Updated" cell of row 1.
    pressKey(grid[0][0], 'ArrowDown');
    pressKey(grid[1][0], 'ArrowRight');
    pressKey(grid[1][1], 'ArrowRight');
    pressKey(grid[1][2], 'ArrowRight');
    expect(grid[1][3].tabIndex).toBe(0);
    // ArrowDown into detail row — collapses to col 0.
    pressKey(grid[1][3], 'ArrowDown');
    expect(grid[2][0].tabIndex).toBe(0);
    expect(grid[2].length).toBe(1);
    // ArrowDown into data row 2 — col 3 restored.
    pressKey(grid[2][0], 'ArrowDown');
    expect(grid[3][3].tabIndex).toBe(0);
  });

  it('sets aria-multiselectable="true" when selectable="multiple"', async () => {
    const el = await mountGrid({ selectable: 'multiple' });
    el.keyboardNav = true;
    await elementUpdated(el);
    const table = el.querySelector('table.civ-data-grid__table');
    expect(table?.getAttribute('aria-multiselectable')).toBe('true');
  });

  it('omits aria-multiselectable when selectable is none or single', async () => {
    const el = await mountGrid({ selectable: 'single' });
    el.keyboardNav = true;
    await elementUpdated(el);
    const table = el.querySelector('table.civ-data-grid__table');
    expect(table?.getAttribute('aria-multiselectable')).toBeNull();
  });

  it('sets aria-labelledby on the table pointing at the caption', async () => {
    const el = await mountGrid({ caption: 'Veterans applications' });
    const table = el.querySelector('table.civ-data-grid__table');
    const caption = el.querySelector('caption');
    const labelId = table?.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(caption?.id).toBe(labelId);
  });

  it('drops the scroll-wrapper tabindex when keyboardNav is on (single tab stop)', async () => {
    const el = await mountGrid({ caption: 'X' });
    el.responsive = 'scroll';
    el.keyboardNav = true;
    await elementUpdated(el);
    const scroll = el.querySelector('.civ-data-grid__scroll') as HTMLElement;
    expect(scroll.tabIndex).toBe(-1);
  });

  it('keeps the scroll-wrapper tabindex when responsive=scroll without keyboardNav', async () => {
    const el = await mountGrid({ caption: 'X' });
    el.responsive = 'scroll';
    await elementUpdated(el);
    const scroll = el.querySelector('.civ-data-grid__scroll') as HTMLElement;
    expect(scroll.tabIndex).toBe(0);
  });

  it('skips loading-state placeholder cells (preserves role="status" live region)', async () => {
    const el = await mountGrid({ loading: true });
    el.keyboardNav = true;
    await elementUpdated(el);
    // Loading row: <td role="status"> — must not be overwritten.
    const stateCell = el.querySelector('.civ-data-grid__state--loading');
    expect(stateCell?.getAttribute('role')).toBe('status');
    expect(stateCell?.getAttribute('tabindex')).toBeNull();
    // The header cells still get the grid roles since they're not state rows.
    expect(el.querySelector('thead th')?.getAttribute('role')).toBe('columnheader');
  });

  it('skips error-state placeholder cells (preserves role="alert" live region)', async () => {
    const el = await mountGrid({ errorMessage: 'Failed' });
    el.keyboardNav = true;
    await elementUpdated(el);
    const stateCell = el.querySelector('.civ-data-grid__state--error');
    expect(stateCell?.getAttribute('role')).toBe('alert');
    expect(stateCell?.getAttribute('tabindex')).toBeNull();
  });

  it('skips empty-state placeholder cells (no grid role overwrite)', async () => {
    const el = await mountGrid({ rows: [] });
    el.keyboardNav = true;
    await elementUpdated(el);
    const stateCell = el.querySelector('.civ-data-grid__state--empty');
    expect(stateCell?.getAttribute('role')).toBeNull();
    expect(stateCell?.getAttribute('tabindex')).toBeNull();
  });

  it('bails on Escape when focus is inside an open <civ-menu> (lets the menu handle it first)', async () => {
    const rows: GridRow[] = [{
      id: '1',
      cells: { name: 'A', status: 'X', updated: '1' },
      actions: [{ id: 'edit', label: 'Edit' }],
    }];
    const el = await mountGrid({ rows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const menu = el.querySelector('civ-menu') as any;
    menu.setAttribute('open', '');
    await elementUpdated(el);
    const menuItem = el.querySelector('civ-menu-item') as HTMLElement;
    // Focus a focusable element inside the open menu. civ-menu-item is a
    // Light-DOM host that delegates focus to an inner <button>, so we
    // call focus on it and read where focus actually lands.
    menuItem.focus();
    const focusInsideMenu = document.activeElement;
    expect(focusInsideMenu?.closest('civ-menu[open]')).toBe(menu);
    // Dispatch Escape on whatever's focused inside the menu — the grid's
    // handler should bail because target is inside an open menu, leaving
    // focus management to <civ-menu> (its own document-level handler
    // closes the menu and refocuses the trigger separately).
    pressKey(focusInsideMenu as HTMLElement, 'Escape');
    const actionsCell = el.querySelector('.civ-data-grid__td--actions');
    expect(document.activeElement).not.toBe(actionsCell);
  });

  it('clamps focused row when rows shrink underfoot', async () => {
    const longRows: GridRow[] = Array.from({ length: 5 }, (_, i) => ({
      id: `r${i}`,
      cells: { name: `Name ${i}`, status: 'A', updated: '2026-01-01' },
    }));
    const el = await mountGrid({ rows: longRows });
    el.keyboardNav = true;
    await elementUpdated(el);
    // Move to the last body row.
    const grid = cells(el);
    pressKey(grid[0][0], 'End', { ctrlKey: true });
    expect(grid[grid.length - 1][grid[grid.length - 1].length - 1].tabIndex).toBe(0);
    // Shrink to 2 rows; the focused row index would now be out of bounds
    // without the clamp.
    el.rows = longRows.slice(0, 2);
    await elementUpdated(el);
    const after = cells(el);
    // 1 header + 2 body = 3 rows; clamp lands on the last available row.
    const lastRow = after[after.length - 1];
    expect(lastRow[lastRow.length - 1].tabIndex).toBe(0);
  });

  it('disabled rows still expose their cells for navigation; controls remain disabled', async () => {
    const rows: GridRow[] = [
      { id: '1', cells: { name: 'A', status: 'X', updated: '1' }, disabled: true },
      { id: '2', cells: { name: 'B', status: 'Y', updated: '2' } },
    ];
    const el = await mountGrid({ rows, selectable: 'multiple' });
    el.keyboardNav = true;
    await elementUpdated(el);
    const grid = cells(el);
    // ArrowDown into the disabled row works (cell focusable).
    pressKey(grid[0][0], 'ArrowDown');
    expect(grid[1][0].tabIndex).toBe(0);
    // The row's select-checkbox is disabled and Enter doesn't toggle selection.
    const selectChk = grid[1][0].querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(selectChk.disabled).toBe(true);
  });
});

describe('civ-data-grid — column filtering', () => {
  const filterColumns: GridColumn[] = [
    { key: 'name', header: 'Name', filter: { type: 'text', placeholder: 'Search…' } },
    { key: 'status', header: 'Status', filter: {
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Pending', label: 'Pending' },
      ],
    }},
    { key: 'amount', header: 'Amount', filter: { type: 'number-range' } },
  ];
  const filterRows: GridRow[] = [
    { id: '1', cells: { name: 'Smith', status: 'Active', amount: 100 } },
    { id: '2', cells: { name: 'Doe', status: 'Pending', amount: 50 } },
  ];

  it('does NOT render a filter row when no column has a filter config', async () => {
    const el = await mountGrid();
    expect(el.querySelector('.civ-data-grid__filter-row')).toBeNull();
  });

  it('renders a filter row inside <thead> when any column declares a filter', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const row = el.querySelector('thead .civ-data-grid__filter-row');
    expect(row).not.toBeNull();
  });

  it('renders a text input for a text-filter column with the placeholder', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const input = el.querySelector('.civ-data-grid__filter-cell input[type="text"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.placeholder).toBe('Search…');
    expect(input.getAttribute('aria-label')).toBe('Filter Name');
  });

  it('renders a select with a default "All" empty option for a select-filter column', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const select = el.querySelector('.civ-data-grid__filter-cell select') as HTMLSelectElement;
    expect(select).not.toBeNull();
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(['', 'Active', 'Pending']);
    expect(select.getAttribute('aria-label')).toBe('Filter Status');
  });

  it('renders two number inputs for a number-range filter column with min/max labels', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const rangeInputs = el.querySelectorAll('.civ-data-grid__filter-input--range');
    expect(rangeInputs).toHaveLength(2);
    expect(rangeInputs[0].getAttribute('aria-label')).toBe('Min Amount');
    expect(rangeInputs[1].getAttribute('aria-label')).toBe('Max Amount');
  });

  it('renders placeholder cells aligned with selection / expand / actions columns', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name', filter: { type: 'text' } },
      { key: 'status', header: 'Status' },
    ];
    const rows: GridRow[] = [{
      id: '1',
      cells: { name: 'A', status: 'X' },
      actions: [{ id: 'edit', label: 'Edit' }],
    }];
    const el = await mountGrid({ columns: cols, rows, selectable: 'multiple' });
    const row = el.querySelector('.civ-data-grid__filter-row')!;
    const cells = row.querySelectorAll('.civ-data-grid__filter-cell');
    // 1 selection placeholder + 1 text filter cell + 1 column-without-filter placeholder + 1 actions placeholder.
    expect(cells).toHaveLength(4);
    expect(cells[0].classList.contains('civ-data-grid__filter-cell--placeholder')).toBe(true);
    expect(cells[2].classList.contains('civ-data-grid__filter-cell--placeholder')).toBe(true);
    expect(cells[3].classList.contains('civ-data-grid__filter-cell--placeholder')).toBe(true);
    expect(cells[1].querySelector('input')).not.toBeNull();
  });

  it('fires civ-filter-change with target state on text input', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const handler = vi.fn();
    el.addEventListener('civ-filter-change', handler);
    const input = el.querySelector('.civ-data-grid__filter-cell input[type="text"]') as HTMLInputElement;
    input.value = 'smith';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.columnKey).toBe('name');
    expect(detail.filters).toEqual({ name: { type: 'text', value: 'smith' } });
  });

  it('drops the filter entry when text input is cleared to empty', async () => {
    const el = await mountGrid({
      columns: filterColumns,
      rows: filterRows,
    });
    el.filters = { name: { type: 'text', value: 'smith' } };
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-filter-change', handler);
    const input = el.querySelector('.civ-data-grid__filter-cell input[type="text"]') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler.mock.calls[0][0].detail.filters).toEqual({});
  });

  it('fires civ-filter-change with select value', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const handler = vi.fn();
    el.addEventListener('civ-filter-change', handler);
    const select = el.querySelector('.civ-data-grid__filter-cell select') as HTMLSelectElement;
    select.value = 'Active';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(handler.mock.calls[0][0].detail.filters).toEqual({
      status: { type: 'select', value: 'Active' },
    });
  });

  it('merges number-range min and max bounds across multiple events', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    const handler = vi.fn();
    el.addEventListener('civ-filter-change', handler);
    const [minInput, maxInput] = el.querySelectorAll('.civ-data-grid__filter-input--range') as NodeListOf<HTMLInputElement>;
    // Set min first.
    minInput.value = '50';
    minInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler.mock.calls[0][0].detail.filters).toEqual({
      amount: { type: 'number-range', min: 50, max: undefined },
    });
    // Apply the new state, then set max.
    el.filters = handler.mock.calls[0][0].detail.filters;
    await elementUpdated(el);
    maxInput.value = '100';
    maxInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler.mock.calls[1][0].detail.filters).toEqual({
      amount: { type: 'number-range', min: 50, max: 100 },
    });
  });

  it('drops the number-range filter entry when both bounds are cleared', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    el.filters = { amount: { type: 'number-range', min: 10, max: 100 } };
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-filter-change', handler);
    const [minInput, maxInput] = el.querySelectorAll('.civ-data-grid__filter-input--range') as NodeListOf<HTMLInputElement>;
    minInput.value = '';
    minInput.dispatchEvent(new Event('input', { bubbles: true }));
    // After clearing min, the next state in the dispatched event still has max=100.
    el.filters = handler.mock.calls[0][0].detail.filters;
    await elementUpdated(el);
    maxInput.value = '';
    maxInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler.mock.calls[1][0].detail.filters).toEqual({});
  });

  it('filter inputs drop to tabindex=-1 when keyboardNav is on', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__filter-cell input[type="text"]') as HTMLInputElement;
    expect(input.tabIndex).toBe(-1);
  });

  it('Enter on a focused filter cell focuses its input (text-entry pattern)', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    el.keyboardNav = true;
    await elementUpdated(el);
    // Filter row is the second tr in thead — index 1.
    const filterRow = el.querySelector('thead tr.civ-data-grid__filter-row')!;
    const firstFilterCell = filterRow.querySelector('.civ-data-grid__filter-cell:not(.civ-data-grid__filter-cell--placeholder)') as HTMLElement;
    firstFilterCell.focus();
    expect(document.activeElement).toBe(firstFilterCell);
    pressKey(firstFilterCell, 'Enter');
    const input = firstFilterCell.querySelector('input') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
  });

  it('Esc from a focused filter input returns focus to its cell', async () => {
    const el = await mountGrid({ columns: filterColumns, rows: filterRows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const input = el.querySelector('.civ-data-grid__filter-cell input[type="text"]') as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);
    pressKey(input, 'Escape');
    const cell = input.closest('.civ-data-grid__filter-cell');
    expect(document.activeElement).toBe(cell);
  });
});

describe('civ-data-grid — aggregator footer', () => {
  const aggColumns: GridColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'amount', header: 'Amount', align: 'numeric', aggregate: 'sum' },
    { key: 'count', header: 'Count', aggregate: 'count' },
  ];
  const aggRows: GridRow[] = [
    { id: '1', cells: { name: 'A', amount: 100, count: 'x' } },
    { id: '2', cells: { name: 'B', amount: 250, count: 'y' } },
    { id: '3', cells: { name: 'C', amount: 50, count: 'z' } },
  ];

  it('does NOT render <tfoot> when no column has aggregate', async () => {
    const el = await mountGrid();
    expect(el.querySelector('tfoot')).toBeNull();
  });

  it('renders <tfoot> when any column has aggregate', async () => {
    const el = await mountGrid({ columns: aggColumns, rows: aggRows });
    expect(el.querySelector('tfoot.civ-data-grid__tfoot')).not.toBeNull();
  });

  it('computes sum for a sum column from current rows', async () => {
    const el = await mountGrid({ columns: aggColumns, rows: aggRows });
    const cells = el.querySelectorAll('tfoot .civ-data-grid__tfoot-cell');
    // Layout: [name placeholder, amount sum, count]
    expect(cells[1].textContent?.trim()).toBe('400');
    expect(cells[2].textContent?.trim()).toBe('3');
  });

  it('renders placeholder cells for columns without an aggregator', async () => {
    const el = await mountGrid({ columns: aggColumns, rows: aggRows });
    const cells = el.querySelectorAll('tfoot .civ-data-grid__tfoot-cell');
    // First cell is the "Name" column placeholder.
    expect(cells[0].classList.contains('civ-data-grid__tfoot-cell--placeholder')).toBe(true);
    expect(cells[0].textContent?.trim()).toBe('');
  });

  it('renders placeholders for selection / expand / row-actions columns', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'amount', header: 'Amount', aggregate: 'sum' },
    ];
    const rows: GridRow[] = [{
      id: '1',
      cells: { name: 'A', amount: 100 },
      actions: [{ id: 'view', label: 'View' }],
    }];
    const el = await mountGrid({ columns: cols, rows, selectable: 'multiple' });
    const footerCells = el.querySelectorAll('tfoot .civ-data-grid__tfoot-cell');
    // 1 select placeholder + 1 name placeholder + 1 amount sum + 1 actions placeholder = 4
    expect(footerCells).toHaveLength(4);
    expect(footerCells[0].classList.contains('civ-data-grid__tfoot-cell--placeholder')).toBe(true);
    expect(footerCells[1].classList.contains('civ-data-grid__tfoot-cell--placeholder')).toBe(true);
    expect(footerCells[2].textContent?.trim()).toBe('100');
    expect(footerCells[3].classList.contains('civ-data-grid__tfoot-cell--placeholder')).toBe(true);
  });

  it('supports a function aggregator and renders its returned value verbatim', async () => {
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      {
        key: 'amount',
        header: 'Amount',
        aggregate: (rows) => '$' + rows.reduce((s, r) => s + Number(r.cells.amount), 0).toFixed(2),
      },
    ];
    const el = await mountGrid({ columns: cols, rows: aggRows });
    const cell = el.querySelector('tfoot .civ-data-grid__tfoot-cell:not(.civ-data-grid__tfoot-cell--placeholder)');
    expect(cell?.textContent?.trim()).toBe('$400.00');
  });

  it('applies stickyFooter class to the wrapper when stickyFooter=true AND any column aggregates', async () => {
    const el = await mountGrid({ columns: aggColumns, rows: aggRows });
    el.stickyFooter = true;
    await elementUpdated(el);
    expect(el.querySelector('.civ-data-grid--sticky-footer')).not.toBeNull();
  });

  it('does NOT apply stickyFooter class when no column aggregates (footer wouldn\'t render anyway)', async () => {
    const el = await mountGrid();
    el.stickyFooter = true;
    await elementUpdated(el);
    expect(el.querySelector('.civ-data-grid--sticky-footer')).toBeNull();
  });

  it('recomputes the footer when rows change', async () => {
    const el = await mountGrid({ columns: aggColumns, rows: aggRows });
    let cells = el.querySelectorAll('tfoot .civ-data-grid__tfoot-cell');
    expect(cells[1].textContent?.trim()).toBe('400');
    el.rows = [
      { id: '1', cells: { name: 'A', amount: 1000, count: 'x' } },
    ];
    await elementUpdated(el);
    cells = el.querySelectorAll('tfoot .civ-data-grid__tfoot-cell');
    expect(cells[1].textContent?.trim()).toBe('1000');
    expect(cells[2].textContent?.trim()).toBe('1');
  });

  it('renders per-group subtotal rows when groupBy + aggregate are both set', async () => {
    const groupRowsLocal: GridRow[] = [
      { id: '1', cells: { name: 'A', type: 'X', amount: 100, count: 'a' } },
      { id: '2', cells: { name: 'B', type: 'X', amount: 250, count: 'b' } },
      { id: '3', cells: { name: 'C', type: 'Y', amount: 50, count: 'c' } },
    ];
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'amount', header: 'Amount', aggregate: 'sum' },
      { key: 'count', header: 'Count', aggregate: 'count' },
    ];
    const el = await mountGrid({ columns: cols, rows: groupRowsLocal });
    el.groupBy = 'type';
    await elementUpdated(el);
    const subtotals = el.querySelectorAll('.civ-data-grid__tr--group-subtotal');
    expect(subtotals).toHaveLength(2);
    // Group X subtotal: 100 + 250 = 350
    const xCells = subtotals[0].querySelectorAll('.civ-data-grid__tfoot-cell');
    expect(xCells[2].textContent?.trim()).toBe('350');
    expect(xCells[3].textContent?.trim()).toBe('2');
    // Group Y subtotal: 50
    const yCells = subtotals[1].querySelectorAll('.civ-data-grid__tfoot-cell');
    expect(yCells[2].textContent?.trim()).toBe('50');
    expect(yCells[3].textContent?.trim()).toBe('1');
  });

  it('omits subtotal rows when showGroupSubtotals=false', async () => {
    const groupRowsLocal: GridRow[] = [
      { id: '1', cells: { name: 'A', type: 'X', amount: 100 } },
      { id: '2', cells: { name: 'B', type: 'X', amount: 250 } },
    ];
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'amount', header: 'Amount', aggregate: 'sum' },
    ];
    const el = await mountGrid({ columns: cols, rows: groupRowsLocal });
    el.groupBy = 'type';
    el.showGroupSubtotals = false;
    await elementUpdated(el);
    expect(el.querySelectorAll('.civ-data-grid__tr--group-subtotal')).toHaveLength(0);
    // But the grand-total footer still renders.
    expect(el.querySelector('tfoot.civ-data-grid__tfoot')).not.toBeNull();
  });

  it('subtotal rows only render for expanded groups', async () => {
    const groupRowsLocal: GridRow[] = [
      { id: '1', cells: { name: 'A', type: 'X', amount: 100 } },
      { id: '2', cells: { name: 'B', type: 'Y', amount: 50 } },
    ];
    const cols: GridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'amount', header: 'Amount', aggregate: 'sum' },
    ];
    const el = await mountGrid({ columns: cols, rows: groupRowsLocal });
    el.groupBy = 'type';
    el.expandedGroups = ['X']; // Y collapsed
    await elementUpdated(el);
    const subtotals = el.querySelectorAll('.civ-data-grid__tr--group-subtotal');
    expect(subtotals).toHaveLength(1);
    expect(subtotals[0].getAttribute('data-group-subtotal-for')).toBe('X');
  });

  it('keyboardNav includes footer cells in cell-nav rotation', async () => {
    const el = await mountGrid({ columns: aggColumns, rows: aggRows });
    el.keyboardNav = true;
    await elementUpdated(el);
    const footerCells = el.querySelectorAll('tfoot .civ-data-grid__td');
    // Footer cells get role=gridcell + tabindex managed via _applyKeyboardNav.
    expect(footerCells[0].getAttribute('role')).toBe('gridcell');
    // All cells start with tabindex=-1 except focused (0, 0).
    footerCells.forEach((c) => expect((c as HTMLElement).tabIndex).toBe(-1));
  });
});

describe('civ-data-grid — multi-column sort', () => {
  const sortCols: GridColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'updated', header: 'Updated', sortable: true },
  ];

  function clickHeader(el: any, columnKey: string, shiftKey = false) {
    const cols = ['name', 'status', 'updated'];
    const idx = cols.indexOf(columnKey);
    const btn = el.querySelectorAll('thead .civ-data-grid__sort-btn')[idx] as HTMLButtonElement;
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey }));
  }

  it('without multiSort=true, shift-click is ignored (single-sort cycle as today)', async () => {
    const el = await mountGrid({ columns: sortCols });
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    // Click name → asc
    clickHeader(el, 'name', false);
    expect(handler.mock.calls[0][0].detail.sortKeys).toEqual([{ key: 'name', direction: 'asc' }]);
    // Shift-click status — should REPLACE (since multiSort is off), not add.
    el.sortBy = 'name';
    el.sortDirection = 'asc';
    await elementUpdated(el);
    clickHeader(el, 'status', true);
    expect(handler.mock.calls[1][0].detail.sortKeys).toEqual([{ key: 'status', direction: 'asc' }]);
  });

  it('with multiSort=true, plain click on a new column replaces the stack', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [{ key: 'name', direction: 'asc' }];
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    clickHeader(el, 'status', false);
    expect(handler.mock.calls[0][0].detail.sortKeys).toEqual([{ key: 'status', direction: 'asc' }]);
  });

  it('with multiSort=true, plain click on the active column cycles asc → desc → none', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [{ key: 'name', direction: 'asc' }];
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    clickHeader(el, 'name', false);
    expect(handler.mock.calls[0][0].detail.sortKeys).toEqual([{ key: 'name', direction: 'desc' }]);
    el.sortKeys = [{ key: 'name', direction: 'desc' }];
    await elementUpdated(el);
    clickHeader(el, 'name', false);
    expect(handler.mock.calls[1][0].detail.sortKeys).toEqual([]);
  });

  it('with multiSort=true, shift-click ADDS a new column to the stack (asc)', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [{ key: 'name', direction: 'asc' }];
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    clickHeader(el, 'status', true);
    expect(handler.mock.calls[0][0].detail.sortKeys).toEqual([
      { key: 'name', direction: 'asc' },
      { key: 'status', direction: 'asc' },
    ]);
  });

  it('with multiSort=true, shift-click on an existing column cycles asc → desc → removed', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [
      { key: 'name', direction: 'asc' },
      { key: 'status', direction: 'asc' },
    ];
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    // Shift-click status (asc → desc, in-place).
    clickHeader(el, 'status', true);
    expect(handler.mock.calls[0][0].detail.sortKeys).toEqual([
      { key: 'name', direction: 'asc' },
      { key: 'status', direction: 'desc' },
    ]);
    el.sortKeys = handler.mock.calls[0][0].detail.sortKeys;
    await elementUpdated(el);
    // Shift-click again (desc → removed).
    clickHeader(el, 'status', true);
    expect(handler.mock.calls[1][0].detail.sortKeys).toEqual([
      { key: 'name', direction: 'asc' },
    ]);
  });

  it('renders a position badge next to the chevron when the stack has more than one key', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [
      { key: 'name', direction: 'asc' },
      { key: 'status', direction: 'desc' },
    ];
    await elementUpdated(el);
    const badges = el.querySelectorAll('.civ-data-grid__sort-position');
    expect(badges).toHaveLength(2);
    expect(badges[0].textContent?.trim()).toBe('1');
    expect(badges[1].textContent?.trim()).toBe('2');
  });

  it('does NOT render a position badge for a single-key sort', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [{ key: 'name', direction: 'asc' }];
    await elementUpdated(el);
    expect(el.querySelectorAll('.civ-data-grid__sort-position')).toHaveLength(0);
  });

  it('sets aria-sort correctly for every column in the multi-sort stack', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [
      { key: 'name', direction: 'asc' },
      { key: 'status', direction: 'desc' },
    ];
    await elementUpdated(el);
    const ths = el.querySelectorAll('thead .civ-data-grid__th--sortable');
    expect(ths[0].getAttribute('aria-sort')).toBe('ascending');
    expect(ths[1].getAttribute('aria-sort')).toBe('descending');
    expect(ths[2].getAttribute('aria-sort')).toBe('none');
  });

  it('civ-sort event carries column + direction for the just-toggled column even in multi-sort mode', async () => {
    const el = await mountGrid({ columns: sortCols });
    el.multiSort = true;
    el.sortKeys = [{ key: 'name', direction: 'asc' }];
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener('civ-sort', handler);
    clickHeader(el, 'status', true);
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.column).toBe('status');
    expect(detail.direction).toBe('asc');
  });
});
