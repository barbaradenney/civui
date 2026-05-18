import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-data-grid.js';
import '../pagination/civ-pagination.js';
import '../toolbar/civ-toolbar.js';
import '../bulk-actions/civ-bulk-actions.js';
import '../column-visibility/civ-column-visibility.js';
import '@civui/actions/button';
import '@civui/actions/action-button';
import '@civui/inputs/text-input';
import type { GridColumn, GridRow } from './civ-data-grid.types.js';
import { applyGridFilters } from '../filter/grid-filter.js';

/**
 * End-to-end admin patterns — the data components (toolbar, bulk-actions,
 * column-visibility, data-grid, pagination) composed into realistic
 * back-office screens. Each story stands alone; copy-paste the markup +
 * the wiring from the corresponding patterns doc page.
 */
const meta: Meta = {
  title: 'Patterns/Data Grid',
  parameters: {
    docs: {
      description: {
        component:
          'Realistic admin compositions of the CivUI data components. ' +
          'See the [Data Grid Patterns](/civui/form-patterns/data-grid-patterns) doc page for the prose walk-through.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Shared fixtures ───────────────────────────────────────────────────────

interface AppRow {
  id: string;
  applicant: string;
  type: string;
  status: string;
  submitted: string;
  updated: string;
}

const TYPES = ['Disability', 'Pension', 'Education', 'Healthcare'];
const STATUSES = ['In review', 'Approved', 'Pending', 'Denied'];

function makeRows(n: number): AppRow[] {
  const out: AppRow[] = [];
  const first = ['John', 'Maria', 'Wei', 'Rohan', 'Sean', 'Jane', 'Carlos', 'Aisha', 'Tomás', 'Priya'];
  const last = ['Smith', 'Reyes', 'Chen', 'Patel', 'O\'Brien', 'Doe', 'Rivera', 'Khan', 'García', 'Singh'];
  for (let i = 0; i < n; i++) {
    out.push({
      id: `A-${String(i + 1).padStart(4, '0')}`,
      applicant: `${last[i % last.length]}, ${first[i % first.length]}`,
      type: TYPES[i % TYPES.length],
      status: STATUSES[i % STATUSES.length],
      submitted: `2026-04-${String((i % 28) + 1).padStart(2, '0')}`,
      updated: `2026-05-${String(((i * 3) % 28) + 1).padStart(2, '0')}`,
    });
  }
  return out;
}

function toRows(data: AppRow[]): GridRow[] {
  return data.map((d) => ({ id: d.id, cells: { ...d } as Record<string, unknown> }));
}

function toRowsWithActions(data: AppRow[]): GridRow[] {
  return data.map((d) => ({
    id: d.id,
    cells: { ...d } as Record<string, unknown>,
    actions: [
      { id: 'view', label: 'View details' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete', destructive: true },
    ],
  }));
}

// ── Pattern 1: Basic admin list ───────────────────────────────────────────
// Toolbar (search + primary action) above. Sortable grid below. Pagination
// at the bottom. The 80% case for a back-office "list of things" screen.

export const BasicAdminList: Story = {
  name: 'Basic admin list (toolbar + grid + pagination)',
  render: () => {
    const allRows = makeRows(127);
    const cols: GridColumn[] = [
      { key: 'id', header: 'Application ID', width: '9rem' },
      { key: 'applicant', header: 'Applicant', sortable: true },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status' },
      { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
    ];
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-basic') as any;
      const pager = document.querySelector('civ-pagination.story-basic') as any;
      const search = document.querySelector('civ-text-input.story-basic-search') as any;
      if (!grid || !pager || !search) return;

      let page = 1;
      let pageSize = 25;
      let query = '';

      const filtered = () => {
        if (!query) return allRows;
        const q = query.toLowerCase();
        return allRows.filter((r) =>
          r.applicant.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
        );
      };
      const apply = () => {
        const rows = filtered();
        pager.totalItems = rows.length;
        const start = (page - 1) * pageSize;
        grid.rows = toRowsWithActions(rows.slice(start, start + pageSize));
        pager.page = page;
        pager.pageSize = pageSize;
      };

      grid.columns = cols;
      pager.pageSize = pageSize;
      apply();

      search.addEventListener('civ-input', (e: Event) => {
        query = (e as CustomEvent).detail.value;
        page = 1;
        apply();
      });
      pager.addEventListener('civ-page-change', (e: Event) => {
        page = (e as CustomEvent).detail.page;
        pageSize = (e as CustomEvent).detail.pageSize;
        apply();
      });
    }, 0);

    return html`
      <div class="civ-flex civ-flex-col civ-gap-3">
        <civ-toolbar label="Applications toolbar">
          <civ-text-input
            class="story-basic-search"
            label="Search applicants"
            type="search"
            placeholder="Name or application ID"
          ></civ-text-input>
          <civ-button
            data-civ-toolbar-end
            variant="primary"
            label="New application"
            icon-start="add"
          ></civ-button>
        </civ-toolbar>
        <civ-data-grid class="story-basic" caption="Applications"></civ-data-grid>
        <civ-pagination
          class="story-basic"
          item-name="application"
        ></civ-pagination>
      </div>
    `;
  },
};

// ── Pattern 2: Bulk operations ────────────────────────────────────────────
// Multi-selectable grid + a bulk-actions bar that appears when the user
// has selected one or more rows. Pagination underneath preserves selection
// across pages (the selectedRowIds list is the source of truth).

export const BulkOperations: Story = {
  name: 'Bulk operations (multi-select + bulk-actions bar)',
  render: () => {
    const allRows = makeRows(85);
    const cols: GridColumn[] = [
      { key: 'id', header: 'Application ID', width: '9rem' },
      { key: 'applicant', header: 'Applicant', sortable: true },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status' },
      { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
    ];
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-bulk') as any;
      const bulk = document.querySelector('civ-bulk-actions.story-bulk') as any;
      const pager = document.querySelector('civ-pagination.story-bulk') as any;
      const log = document.getElementById('story-bulk-log');
      if (!grid || !bulk || !pager) return;

      let page = 1;
      let pageSize = 25;
      let selectedRowIds: string[] = [];

      const apply = () => {
        const start = (page - 1) * pageSize;
        grid.rows = toRows(allRows.slice(start, start + pageSize));
        grid.selectedRowIds = selectedRowIds;
        pager.page = page;
        pager.pageSize = pageSize;
        bulk.count = selectedRowIds.length;
      };

      grid.columns = cols;
      grid.selectable = 'multiple';
      pager.totalItems = allRows.length;
      pager.pageSize = pageSize;
      apply();

      grid.addEventListener('civ-selection-change', (e: Event) => {
        selectedRowIds = (e as CustomEvent).detail.selectedRowIds;
        bulk.count = selectedRowIds.length;
        grid.selectedRowIds = selectedRowIds;
      });
      bulk.addEventListener('civ-clear-selection', () => {
        selectedRowIds = [];
        apply();
      });
      pager.addEventListener('civ-page-change', (e: Event) => {
        page = (e as CustomEvent).detail.page;
        pageSize = (e as CustomEvent).detail.pageSize;
        apply();
      });
      bulk.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('civ-action-button');
        if (!btn) return;
        const label = btn.getAttribute('label') ?? '';
        if (log) log.textContent = `${label} → ${selectedRowIds.length} application(s)`;
      });
    }, 0);

    return html`
      <div class="civ-flex civ-flex-col civ-gap-3">
        <civ-toolbar label="Applications toolbar">
          <civ-text-input label="Search applicants" type="search"></civ-text-input>
          <civ-button
            data-civ-toolbar-end
            variant="primary"
            label="New application"
            icon-start="add"
          ></civ-button>
        </civ-toolbar>
        <civ-bulk-actions class="story-bulk" count="0" item-name="application">
          <civ-action-button variant="secondary" icon-start="download" label="Export"></civ-action-button>
          <civ-action-button variant="secondary" icon-start="forward" label="Reassign"></civ-action-button>
          <civ-action-button variant="secondary" danger icon-start="delete" label="Delete"></civ-action-button>
        </civ-bulk-actions>
        <civ-data-grid class="story-bulk" caption="Applications"></civ-data-grid>
        <civ-pagination
          class="story-bulk"
          item-name="application"
        ></civ-pagination>
        <p id="story-bulk-log" class="civ-text-sm civ-mt-2" aria-live="polite"></p>
      </div>
    `;
  },
};

// ── Pattern 3: Power-user grid ────────────────────────────────────────────
// Everything turned on — per-column filters (the in-table filter row), a
// column-visibility popover, sortable headers, and pagination. The 5%
// case where back-office users want spreadsheet-style control.

export const PowerUserGrid: Story = {
  name: 'Power-user grid (filters + column visibility + sort + pagination)',
  render: () => {
    const cols: GridColumn[] = [
      { key: 'id', header: 'Application ID', width: '9rem' },
      { key: 'applicant', header: 'Applicant', sortable: true,
        filter: { type: 'text', placeholder: 'Search name' } },
      { key: 'type', header: 'Type',
        filter: { type: 'select', options: TYPES.map((t) => ({ value: t, label: t })) } },
      { key: 'status', header: 'Status',
        filter: { type: 'select', options: STATUSES.map((s) => ({ value: s, label: s })) } },
      { key: 'submitted', header: 'Submitted', sortable: true },
      { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
    ];
    const allRows = makeRows(204);
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-power') as any;
      const colsCtrl = document.querySelector('civ-column-visibility.story-power') as any;
      const pager = document.querySelector('civ-pagination.story-power') as any;
      if (!grid || !colsCtrl || !pager) return;

      let page = 1;
      let pageSize = 25;
      let hidden: string[] = [];
      let filters: Record<string, unknown> = {};
      let activeCols = cols;

      const apply = () => {
        const filtered = applyGridFilters(toRows(allRows), activeCols, filters);
        pager.totalItems = filtered.length;
        const start = (page - 1) * pageSize;
        grid.rows = filtered.slice(start, start + pageSize);
        pager.page = page;
        pager.pageSize = pageSize;
      };

      const rebuildCols = () => {
        activeCols = cols.map((c) => ({ ...c, hidden: hidden.includes(c.key) }));
        grid.columns = activeCols;
        grid.filters = filters;
      };

      colsCtrl.columns = cols;
      colsCtrl.hiddenColumns = hidden;
      rebuildCols();
      apply();

      colsCtrl.addEventListener('civ-column-visibility-change', (e: Event) => {
        hidden = (e as CustomEvent).detail.hiddenColumns;
        colsCtrl.hiddenColumns = hidden;
        rebuildCols();
      });
      grid.addEventListener('civ-filter-change', (e: Event) => {
        filters = (e as CustomEvent).detail.filters;
        page = 1;
        rebuildCols();
        apply();
      });
      pager.addEventListener('civ-page-change', (e: Event) => {
        page = (e as CustomEvent).detail.page;
        pageSize = (e as CustomEvent).detail.pageSize;
        apply();
      });
    }, 0);

    return html`
      <div class="civ-flex civ-flex-col civ-gap-3">
        <civ-toolbar label="Applications toolbar">
          <civ-text-input label="Search applicants" type="search"></civ-text-input>
          <civ-column-visibility
            data-civ-toolbar-end
            class="story-power"
          ></civ-column-visibility>
          <civ-button
            data-civ-toolbar-end
            variant="primary"
            label="New application"
            icon-start="add"
          ></civ-button>
        </civ-toolbar>
        <civ-data-grid
          class="story-power"
          caption="Applications (filterable, sortable, hideable columns)"
          bordered
        ></civ-data-grid>
        <civ-pagination
          class="story-power"
          item-name="application"
        ></civ-pagination>
      </div>
    `;
  },
};
