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
