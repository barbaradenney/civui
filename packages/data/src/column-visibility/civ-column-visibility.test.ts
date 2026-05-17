import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanupFixtures, elementUpdated } from '@civui/test-utils';
import './civ-column-visibility.js';
import type { GridColumn } from '../data-grid/civ-data-grid.types.js';

afterEach(cleanupFixtures);

const COLUMNS: GridColumn[] = [
  { key: 'id', header: 'Application ID' },
  { key: 'applicant', header: 'Applicant' },
  { key: 'status', header: 'Status' },
  { key: 'updated', header: 'Last updated' },
];

async function mount(initial: { columns?: GridColumn[]; hiddenColumns?: string[]; minVisible?: number } = {}) {
  const el = (await fixture('<civ-column-visibility></civ-column-visibility>')) as any;
  el.columns = initial.columns ?? COLUMNS;
  el.hiddenColumns = initial.hiddenColumns ?? [];
  if (initial.minVisible !== undefined) el.minVisible = initial.minVisible;
  await elementUpdated(el);
  return el;
}

describe('civ-column-visibility', () => {
  it('renders the trigger button with the default i18n label', async () => {
    const el = await mount();
    const trigger = el.querySelector('.civ-column-visibility__trigger') as any;
    expect(trigger).not.toBeNull();
    expect(trigger.label).toBeTruthy();
  });

  it('uses the custom label prop when set', async () => {
    const el = await fixture('<civ-column-visibility label="Show columns"></civ-column-visibility>') as any;
    const trigger = el.querySelector('.civ-column-visibility__trigger') as any;
    expect(trigger.label).toBe('Show columns');
  });

  it('starts with the panel closed', async () => {
    const el = await mount();
    expect(el.open).toBe(false);
    expect(el.querySelector('.civ-column-visibility__panel')).toBeNull();
  });

  it('opens the panel when the trigger is clicked', async () => {
    const el = await mount();
    const triggerBtn = el.querySelector('.civ-column-visibility__trigger button') as HTMLButtonElement;
    triggerBtn.click();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(el.querySelector('.civ-column-visibility__panel')).not.toBeNull();
  });

  it('renders one checkbox per column when open', async () => {
    const el = await mount();
    el.open = true;
    await elementUpdated(el);
    const checkboxes = el.querySelectorAll('.civ-column-visibility__option input[type="checkbox"]');
    expect(checkboxes.length).toBe(COLUMNS.length);
  });

  it('renders each checkbox label from column.header', async () => {
    const el = await mount();
    el.open = true;
    await elementUpdated(el);
    const labels = Array.from(
      el.querySelectorAll<HTMLElement>('.civ-column-visibility__option-label'),
    ).map((n) => n.textContent?.trim());
    expect(labels).toEqual(['Application ID', 'Applicant', 'Status', 'Last updated']);
  });

  it('shows hidden columns as unchecked, visible as checked', async () => {
    const el = await mount({ hiddenColumns: ['status'] });
    el.open = true;
    await elementUpdated(el);
    const checkboxes = Array.from(
      el.querySelectorAll<HTMLInputElement>('.civ-column-visibility__option input[type="checkbox"]'),
    );
    // Order matches COLUMNS: id, applicant, status, updated.
    expect(checkboxes.map((c) => c.checked)).toEqual([true, true, false, true]);
  });

  it('fires civ-column-visibility-change with the new hidden + visible sets on toggle', async () => {
    const el = await mount();
    el.open = true;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-column-visibility-change', handler);

    // Uncheck the third (status) column.
    const checkboxes = el.querySelectorAll<HTMLInputElement>(
      '.civ-column-visibility__option input[type="checkbox"]',
    );
    checkboxes[2].checked = false;
    checkboxes[2].dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    const detail = handler.mock.calls[0][0].detail;
    expect(detail.hiddenColumns).toEqual(['status']);
    expect(detail.visibleColumns).toEqual(['id', 'applicant', 'updated']);
  });

  it('refuses to hide the last visible column (minVisible defaults to 1)', async () => {
    const el = await mount({ hiddenColumns: ['id', 'applicant', 'status'] });
    el.open = true;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-column-visibility-change', handler);

    // Try to uncheck "updated" — the only visible column.
    const updatedBox = el.querySelectorAll<HTMLInputElement>(
      '.civ-column-visibility__option input[type="checkbox"]',
    )[3];
    updatedBox.checked = false;
    updatedBox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    // After re-render, the .checked binding restores the checked state.
    await elementUpdated(el);
    const restored = el.querySelectorAll<HTMLInputElement>(
      '.civ-column-visibility__option input[type="checkbox"]',
    )[3];
    expect(restored.checked).toBe(true);
  });

  it('honors a custom minVisible threshold', async () => {
    const el = await mount({ hiddenColumns: [], minVisible: 3 });
    el.open = true;
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener('civ-column-visibility-change', handler);

    // First hide should succeed (4 → 3 visible).
    const checkboxes = el.querySelectorAll<HTMLInputElement>(
      '.civ-column-visibility__option input[type="checkbox"]',
    );
    checkboxes[0].checked = false;
    checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();

    // Simulate consumer applying the change.
    el.hiddenColumns = ['id'];
    await elementUpdated(el);

    // Second hide should be refused (3 → 2 visible, below threshold).
    handler.mockClear();
    const next = el.querySelectorAll<HTMLInputElement>(
      '.civ-column-visibility__option input[type="checkbox"]',
    )[1];
    next.checked = false;
    next.dispatchEvent(new Event('change', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const el = await mount();
    el.open = true;
    await elementUpdated(el);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await elementUpdated(el);

    expect(el.open).toBe(false);
    expect(el.querySelector('.civ-column-visibility__panel')).toBeNull();
  });

  it('reflects the open attribute on the host', async () => {
    const el = await mount();
    el.open = true;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(true);
    el.open = false;
    await elementUpdated(el);
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('wires aria-expanded + aria-haspopup + aria-controls on the trigger', async () => {
    const el = await mount();
    const trigger = el.querySelector('.civ-column-visibility__trigger') as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBeTruthy();

    el.open = true;
    await elementUpdated(el);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('uses Light DOM', async () => {
    const el = await mount();
    expect(el.shadowRoot).toBeNull();
  });
});

describe('civ-column-visibility ↔ civ-data-grid integration', () => {
  it('hides columns from the grid when hidden flag flips', async () => {
    // Import the grid lazily so this test file stays focused.
    await import('../data-grid/civ-data-grid.js');
    const container = (await fixture(`
      <div>
        <civ-column-visibility></civ-column-visibility>
        <civ-data-grid caption="t"></civ-data-grid>
      </div>
    `)) as HTMLElement;
    const cols = container.querySelector('civ-column-visibility') as any;
    const grid = container.querySelector('civ-data-grid') as any;

    const allColumns: GridColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'status', header: 'Status' },
    ];
    cols.columns = allColumns;
    cols.hiddenColumns = [];
    grid.columns = allColumns;
    grid.rows = [{ id: '1', cells: { id: 'A-1', name: 'Smith', status: 'Open' } }];
    cols.addEventListener('civ-column-visibility-change', (e: Event) => {
      const hidden = (e as CustomEvent).detail.hiddenColumns;
      cols.hiddenColumns = hidden;
      grid.columns = allColumns.map((c) => ({ ...c, hidden: hidden.includes(c.key) }));
    });
    await elementUpdated(grid);
    expect(grid.querySelectorAll('thead th').length).toBe(3);

    // Open the panel and uncheck "status".
    cols.open = true;
    await elementUpdated(cols);
    const statusBox = cols.querySelectorAll<HTMLInputElement>(
      '.civ-column-visibility__option input[type="checkbox"]',
    )[2];
    statusBox.checked = false;
    statusBox.dispatchEvent(new Event('change', { bubbles: true }));
    await elementUpdated(cols);
    await elementUpdated(grid);

    expect(grid.querySelectorAll('thead th').length).toBe(2);
    const headerTexts = Array.from(grid.querySelectorAll<HTMLElement>('thead th')).map(
      (th) => th.textContent?.trim(),
    );
    expect(headerTexts).toEqual(['ID', 'Name']);
  });
});
