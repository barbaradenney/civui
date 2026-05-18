import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-data-grid.js';
import '../pagination/civ-pagination.js';
import '../toolbar/civ-toolbar.js';
import '../bulk-actions/civ-bulk-actions.js';
import '@civui/actions/button';
import '@civui/actions/action-button';
import '@civui/inputs/text-input';
import '@civui/overlays/drawer';
import '@civui/feedback/badge';
import type { GridColumn, GridRow } from './civ-data-grid.types.js';
import { applyGridFilters } from '../filter/grid-filter.js';
import { sum, avg } from '../aggregate/grid-aggregate.js';

// Status string → badge variant. The badge's `with-icon` attribute
// auto-renders the variant's semantic icon (check-circle, warning,
// error, info), so the formatter stays declarative.
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  Approved: 'success',
  Denied: 'error',
  Pending: 'warning',
  'In review': 'info',
};

const statusBadge = (value: unknown) => {
  const v = String(value ?? '');
  const variant = STATUS_VARIANT[v] ?? 'neutral';
  return html`<civ-badge label="${v}" variant="${variant}" with-icon></civ-badge>`;
};

const meta: Meta = {
  title: 'Layout/Data Grid',
  component: 'civ-data-grid',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Semantic `<table>`-based data grid for admin screens. Built on native table semantics for predictable screen-reader behavior, with sortable columns (aria-sort), row selection, per-row action menus, sticky header, and a USWDS-style stacked layout on mobile.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Fixtures ──────────────────────────────────────────────────────────────

interface ApplicationRow {
  id: string;
  applicant: string;
  status: string;
  type: string;
  updated: string;
}

const SAMPLE_DATA: ApplicationRow[] = [
  { id: 'A-001', applicant: 'Smith, John A.', status: 'In review', type: 'Disability', updated: '2026-05-15' },
  { id: 'A-002', applicant: 'Doe, Jane M.', status: 'Approved', type: 'Pension', updated: '2026-05-14' },
  { id: 'A-003', applicant: 'Reyes, Maria L.', status: 'Pending', type: 'Education', updated: '2026-05-12' },
  { id: 'A-004', applicant: 'Chen, Wei',       status: 'In review', type: 'Disability', updated: '2026-05-10' },
  { id: 'A-005', applicant: 'Patel, Rohan',    status: 'Denied',   type: 'Healthcare',  updated: '2026-05-09' },
  { id: 'A-006', applicant: 'O\'Brien, Sean',  status: 'Approved', type: 'Pension',     updated: '2026-05-08' },
];

const defaultColumns: GridColumn[] = [
  { key: 'id', header: 'Application ID', width: '9rem' },
  { key: 'applicant', header: 'Applicant', sortable: true },
  { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status', formatter: statusBadge },
  { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
];

function toRows(data: ApplicationRow[]): GridRow[] {
  return data.map((d) => ({
    id: d.id,
    cells: { id: d.id, applicant: d.applicant, type: d.type, status: d.status, updated: d.updated },
  }));
}

function toRowsWithActions(data: ApplicationRow[]): GridRow[] {
  return data.map((d) => ({
    id: d.id,
    cells: { id: d.id, applicant: d.applicant, type: d.type, status: d.status, updated: d.updated },
    actions: [
      { id: 'view', label: 'View details' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete', destructive: true },
    ],
  }));
}

// ── Stories ──────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-default') as any;
      if (grid) {
        grid.columns = defaultColumns;
        grid.rows = toRows(SAMPLE_DATA);
      }
    }, 0);
    return html`<civ-data-grid class="story-default" caption="Veterans benefits applications"></civ-data-grid>`;
  },
};

export const Sortable: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-sortable') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.sortBy = 'updated';
      grid.sortDirection = 'desc';
      grid.addEventListener('civ-sort', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        grid.sortBy = detail.column;
        grid.sortDirection = detail.direction;
        if (detail.direction === 'none') {
          grid.rows = toRows(SAMPLE_DATA);
          return;
        }
        grid.rows = [...toRows(SAMPLE_DATA)].sort((a, b) => {
          const av = String(a.cells[detail.column] ?? '');
          const bv = String(b.cells[detail.column] ?? '');
          return detail.direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      });
    }, 0);
    return html`<civ-data-grid class="story-sortable" caption="Applications (sortable)"></civ-data-grid>`;
  },
};

export const MultipleSelection: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-multi-sel') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.selectable = 'multiple';
      grid.selectedRowIds = [];
      grid.addEventListener('civ-selection-change', (e: Event) => {
        grid.selectedRowIds = (e as CustomEvent).detail.selectedRowIds;
      });
    }, 0);
    return html`<civ-data-grid class="story-multi-sel" caption="Applications (multi-select)"></civ-data-grid>`;
  },
};

export const SingleSelection: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-single-sel') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.selectable = 'single';
      grid.selectedRowIds = [];
      grid.addEventListener('civ-selection-change', (e: Event) => {
        grid.selectedRowIds = (e as CustomEvent).detail.selectedRowIds;
      });
    }, 0);
    return html`<civ-data-grid class="story-single-sel" caption="Applications (single-select)"></civ-data-grid>`;
  },
};

export const RowActions: Story = {
  name: 'Row Actions (kebab menu)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-actions') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRowsWithActions(SAMPLE_DATA);
      grid.addEventListener('civ-row-action', (e: Event) => {
        const detail = (e as CustomEvent).detail;
        console.info('Row action:', detail.rowId, detail.action);
      });
    }, 0);
    return html`<civ-data-grid class="story-actions" caption="Applications with row actions"></civ-data-grid>`;
  },
};

export const Striped: Story = {
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-striped') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.striped = true;
    }, 0);
    return html`<civ-data-grid class="story-striped" caption="Striped rows"></civ-data-grid>`;
  },
};

export const WithFormatter: Story = {
  name: 'With Cell Formatter',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-formatter') as any;
      if (!grid) return;
      grid.columns = [
        { key: 'id', header: 'ID', width: '8rem' },
        { key: 'applicant', header: 'Applicant', sortable: true },
        {
          key: 'status',
          header: 'Status',
          formatter: statusBadge,
        },
        { key: 'updated', header: 'Updated', align: 'end' },
      ];
      grid.rows = toRows(SAMPLE_DATA);
    }, 0);
    return html`<civ-data-grid class="story-formatter" caption="Applications with status tags"></civ-data-grid>`;
  },
};

export const Loading: Story = {
  render: () => html`<civ-data-grid loading caption="Loading applications"></civ-data-grid>`,
};

export const Empty: Story = {
  render: () => html`<civ-data-grid empty-message="No applications match your filters." caption="Filtered applications"></civ-data-grid>`,
};

export const ErrorState: Story = {
  render: () => html`
    <civ-data-grid
      caption="Applications"
      error-message="Couldn't load applications. Try again."
    ></civ-data-grid>
  `,
};

export const ScrollResponsive: Story = {
  name: 'Scroll Responsive (mobile preserves columns)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-scroll') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.responsive = 'scroll';
    }, 0);
    return html`<civ-data-grid class="story-scroll" caption="Scroll-responsive table"></civ-data-grid>`;
  },
};

export const WithPagination: Story = {
  render: () => {
    const ROW_COUNT = 250;
    const allRows = Array.from({ length: ROW_COUNT }, (_, i) => ({
      id: `A-${String(i + 1).padStart(3, '0')}`,
      cells: {
        id: `A-${String(i + 1).padStart(3, '0')}`,
        applicant: `Applicant ${i + 1}`,
        type: ['Disability', 'Pension', 'Education', 'Healthcare'][i % 4],
        status: ['In review', 'Approved', 'Pending', 'Denied'][i % 4],
        updated: `2026-05-${String(((i * 3) % 28) + 1).padStart(2, '0')}`,
      },
    } as GridRow));

    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-paginated') as any;
      const pager = document.querySelector('civ-pagination.story-paginated') as any;
      if (!grid || !pager) return;

      grid.columns = defaultColumns;
      let page = 1;
      let pageSize = 25;
      const apply = () => {
        const start = (page - 1) * pageSize;
        grid.rows = allRows.slice(start, start + pageSize);
        pager.page = page;
        pager.pageSize = pageSize;
      };
      pager.totalItems = allRows.length;
      pager.page = 1;
      pager.pageSize = pageSize;
      pager.addEventListener('civ-page-change', (e: Event) => {
        page = (e as CustomEvent).detail.page;
        pageSize = (e as CustomEvent).detail.pageSize;
        apply();
      });
      apply();
    }, 0);

    return html`
      <civ-data-grid class="story-paginated" caption="Applications"></civ-data-grid>
      <civ-pagination
        class="story-paginated"
        item-name="application"
      ></civ-pagination>
    `;
  },
};

export const FullAdminLayout: Story = {
  name: 'Full Admin Layout (toolbar + bulk actions)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-full') as any;
      const bulk = document.querySelector('civ-bulk-actions.story-full') as any;
      if (!grid || !bulk) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.selectable = 'multiple';
      grid.selectedRowIds = [];
      grid.addEventListener('civ-selection-change', (e: Event) => {
        const ids = (e as CustomEvent).detail.selectedRowIds;
        grid.selectedRowIds = ids;
        bulk.count = ids.length;
      });
      bulk.addEventListener('civ-clear-selection', () => {
        grid.selectedRowIds = [];
        bulk.count = 0;
      });
    }, 0);
    return html`
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <civ-toolbar label="Applications toolbar">
          <civ-text-input label="Search" type="search"></civ-text-input>
          <civ-button data-civ-toolbar-end variant="primary" label="Add application"></civ-button>
        </civ-toolbar>
        <civ-bulk-actions class="story-full" count="0" item-name="application">
          <civ-action-button variant="secondary" icon-start="download" label="Export"></civ-action-button>
          <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
        </civ-bulk-actions>
        <civ-data-grid class="story-full" caption="Applications"></civ-data-grid>
      </div>
    `;
  },
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => {
    setTimeout(() => {
      ['dense', 'default', 'spacious'].forEach((scale) => {
        const grid = document.querySelector(`civ-data-grid.story-density-${scale}`) as any;
        if (!grid) return;
        grid.columns = defaultColumns;
        grid.rows = toRows(SAMPLE_DATA.slice(0, 3));
      });
    }, 0);
    return html`
      <div class="civ-flex civ-flex-col civ-gap-6">
        <div data-civ-scale="dense">
          <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
          <civ-data-grid class="story-density-dense" caption="Applications (dense)"></civ-data-grid>
        </div>
        <div>
          <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
          <civ-data-grid class="story-density-default" caption="Applications (default)"></civ-data-grid>
        </div>
        <div data-civ-scale="spacious">
          <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
          <civ-data-grid class="story-density-spacious" caption="Applications (spacious)"></civ-data-grid>
        </div>
      </div>
    `;
  },
};

export const MasterDetailDrawer: Story = {
  name: 'Master-Detail (row → civ-drawer)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-detail') as any;
      const drawer = document.querySelector('civ-drawer.story-detail') as any;
      const fields = document.querySelector('#story-detail-fields') as HTMLElement;
      if (!grid || !drawer || !fields) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.interactive = true;
      grid.addEventListener('civ-row-activate', (e: Event) => {
        const row = (e as CustomEvent).detail.row;
        drawer.heading = `Application ${row.id}`;
        fields.innerHTML = '';
        for (const col of defaultColumns) {
          const dt = document.createElement('dt');
          dt.textContent = col.header;
          dt.style.fontWeight = '600';
          dt.style.marginTop = 'var(--civ-spacing-3)';
          const dd = document.createElement('dd');
          dd.textContent = String(row.cells[col.key] ?? '—');
          dd.style.margin = '0';
          fields.appendChild(dt);
          fields.appendChild(dd);
        }
        drawer.open = true;
      });
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">Click any row to view its detail.</p>
        <civ-data-grid class="story-detail" caption="Applications"></civ-data-grid>
        <civ-drawer class="story-detail" position="end" heading="Application details">
          <dl id="story-detail-fields" style="margin: 0;"></dl>
        </civ-drawer>
      </div>
    `;
  },
};

export const ExpandableRows: Story = {
  name: 'Expandable Rows (per-row detail)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-expandable') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      // Mix expandable + non-expandable rows so the chevron-cell behavior
      // (rendered when any row has expandable=true; empty for rows that don't)
      // is visible in the same table.
      grid.rows = toRows(SAMPLE_DATA).map((r, i) => ({
        ...r,
        expandable: i % 2 === 0,
      }));
      grid.expandedRowIds = [];
      grid.expandTemplate = (row: any) => html`
        <div class="civ-flex civ-flex-col civ-gap-2">
          <div><strong>Applicant notes for ${row.id}</strong></div>
          <p class="civ-m-0">
            Detail content rendered by the consumer's <code>expandTemplate</code>.
            Could be a key/value list, a child <code>civ-data-grid</code>, a form,
            or any arbitrary Lit template.
          </p>
          <dl class="civ-flex civ-flex-col civ-gap-1" style="margin: 0;">
            <div class="civ-flex civ-gap-2">
              <dt style="font-weight: 600; min-width: 8rem;">Status</dt>
              <dd style="margin: 0;">${row.cells.status}</dd>
            </div>
            <div class="civ-flex civ-gap-2">
              <dt style="font-weight: 600; min-width: 8rem;">Last updated</dt>
              <dd style="margin: 0;">${row.cells.updated}</dd>
            </div>
          </dl>
        </div>
      `;
      grid.addEventListener('civ-row-expand', (e: Event) => {
        const { rowId, expanded } = (e as CustomEvent).detail;
        grid.expandedRowIds = expanded
          ? [...grid.expandedRowIds, rowId]
          : grid.expandedRowIds.filter((id: string) => id !== rowId);
      });
    }, 0);
    return html`<civ-data-grid class="story-expandable" caption="Applications with expandable detail"></civ-data-grid>`;
  },
};

export const ExpandableNestedGrid: Story = {
  name: 'Expandable Rows → nested civ-data-grid',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-nested') as any;
      if (!grid) return;
      grid.columns = [
        { key: 'id', header: 'Application ID', width: '9rem' },
        { key: 'applicant', header: 'Applicant' },
        { key: 'documentCount', header: 'Documents', align: 'end' },
      ];
      grid.rows = SAMPLE_DATA.slice(0, 3).map((d, i) => ({
        id: d.id,
        cells: {
          id: d.id,
          applicant: d.applicant,
          documentCount: (i + 1) * 2,
        },
        expandable: true,
      }));
      grid.expandedRowIds = [];
      grid.expandTemplate = (row: any) => {
        const docs = Array.from({ length: row.cells.documentCount }, (_, i) => ({
          id: `${row.id}-doc-${i + 1}`,
          cells: {
            name: `Document ${i + 1}.pdf`,
            type: ['Medical', 'Legal', 'Identity'][i % 3],
            uploaded: `2026-04-${String(15 - i).padStart(2, '0')}`,
          },
        }));
        return html`
          <p class="civ-m-0 civ-mb-2"><strong>Supporting documents for ${row.id}</strong></p>
          <civ-data-grid
            caption="Documents for ${row.id}"
            caption-hidden
            .columns=${[
              { key: 'name', header: 'Document name' },
              { key: 'type', header: 'Type' },
              { key: 'uploaded', header: 'Uploaded', align: 'end' },
            ]}
            .rows=${docs}
          ></civ-data-grid>
        `;
      };
      grid.addEventListener('civ-row-expand', (e: Event) => {
        const { rowId, expanded } = (e as CustomEvent).detail;
        grid.expandedRowIds = expanded
          ? [...grid.expandedRowIds, rowId]
          : grid.expandedRowIds.filter((id: string) => id !== rowId);
      });
    }, 0);
    return html`<civ-data-grid class="story-nested" caption="Applications with nested document grid"></civ-data-grid>`;
  },
};

export const InlineCellEditing: Story = {
  name: 'Inline Cell Editing',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-edit') as any;
      if (!grid) return;
      // Keep a mutable copy for in-place edits.
      const data = toRows(SAMPLE_DATA);
      grid.rows = data;
      grid.columns = [
        { key: 'id', header: 'Application ID', width: '9rem' },
        { key: 'applicant', header: 'Applicant', editable: true,
          validate: (v: unknown) =>
            typeof v === 'string' && v.trim().length < 3
              ? 'Applicant name must be at least 3 characters'
              : null,
        },
        { key: 'type', header: 'Type', editable: true, inputType: 'select',
          options: [
            { value: 'Disability', label: 'Disability' },
            { value: 'Pension', label: 'Pension' },
            { value: 'Education', label: 'Education' },
            { value: 'Healthcare', label: 'Healthcare' },
          ],
        },
        { key: 'status', header: 'Status', formatter: statusBadge },
        { key: 'updated', header: 'Last updated', align: 'end' },
      ];
      grid.addEventListener('civ-cell-edit-commit', (e: Event) => {
        const { rowId, columnKey, value } = (e as CustomEvent).detail;
        grid.rows = data.map((r) =>
          r.id === rowId ? { ...r, cells: { ...r.cells, [columnKey]: value } } : r,
        );
      });
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">
          Click <strong>Applicant</strong> or <strong>Type</strong> cells to edit.
          Enter or blur commits; Escape cancels. Applicant requires ≥3 characters.
        </p>
        <civ-data-grid class="story-edit" caption="Applications (editable)"></civ-data-grid>
      </div>
    `;
  },
};

export const StickyColumns: Story = {
  name: 'Sticky Columns (pinned start)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-sticky') as any;
      if (!grid) return;
      grid.columns = [
        { key: 'id', header: 'ID', width: '5rem', sticky: 'start' },
        { key: 'applicant', header: 'Applicant', width: '14rem', sticky: 'start' },
        { key: 'type', header: 'Type', width: '10rem' },
        { key: 'status', header: 'Status', width: '8rem', formatter: statusBadge },
        { key: 'submitted', header: 'Submitted', width: '8rem' },
        { key: 'reviewed', header: 'Last reviewed', width: '10rem' },
        { key: 'reviewer', header: 'Reviewer', width: '12rem' },
        { key: 'notes', header: 'Notes', width: '20rem' },
        { key: 'updated', header: 'Last updated', width: '8rem', align: 'end' },
      ];
      grid.rows = SAMPLE_DATA.map((d) => ({
        id: d.id,
        cells: {
          id: d.id,
          applicant: d.applicant,
          type: d.type,
          status: d.status,
          submitted: '2026-04-22',
          reviewed: '2026-05-09',
          reviewer: 'Adams, Casey',
          notes: 'Pending supporting documentation upload from claimant.',
          updated: d.updated,
        },
      }));
      grid.responsive = 'scroll';
    }, 0);
    return html`
      <div style="max-width: 700px;">
        <p class="civ-mb-3">
          ID and Applicant are pinned to the leading edge. Scroll horizontally —
          they stay visible while the rest of the columns slide under.
        </p>
        <civ-data-grid class="story-sticky" caption="Applications (wide table)"></civ-data-grid>
      </div>
    `;
  },
};

export const StickyEndColumn: Story = {
  name: 'Sticky Column (pinned end)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-sticky-end') as any;
      if (!grid) return;
      grid.columns = [
        { key: 'id', header: 'ID', width: '5rem' },
        { key: 'applicant', header: 'Applicant', width: '14rem' },
        { key: 'type', header: 'Type', width: '10rem' },
        { key: 'status', header: 'Status', width: '8rem', formatter: statusBadge },
        { key: 'submitted', header: 'Submitted', width: '8rem' },
        { key: 'reviewer', header: 'Reviewer', width: '12rem' },
        { key: 'updated', header: 'Last updated', width: '10rem', align: 'end', sticky: 'end' },
      ];
      grid.rows = SAMPLE_DATA.map((d) => ({
        id: d.id,
        cells: {
          id: d.id,
          applicant: d.applicant,
          type: d.type,
          status: d.status,
          submitted: '2026-04-22',
          reviewer: 'Adams, Casey',
          updated: d.updated,
        },
      }));
      grid.responsive = 'scroll';
    }, 0);
    return html`
      <div style="max-width: 700px;">
        <p class="civ-mb-3">
          The Last updated column is pinned to the trailing edge.
        </p>
        <civ-data-grid class="story-sticky-end" caption="Applications (sticky end)"></civ-data-grid>
      </div>
    `;
  },
};

export const ExportToCsv: Story = {
  name: 'Export to CSV / JSON',
  render: () => {
    setTimeout(async () => {
      const grid = document.querySelector('civ-data-grid.story-export') as any;
      const csvBtn = document.querySelector('#story-export-csv') as HTMLButtonElement;
      const jsonBtn = document.querySelector('#story-export-json') as HTMLButtonElement;
      const selectedBtn = document.querySelector('#story-export-selected') as HTMLButtonElement;
      const out = document.querySelector('#story-export-out') as HTMLElement;
      if (!grid || !csvBtn || !jsonBtn || !selectedBtn || !out) return;

      // Lazy-load the export utility to keep this story self-contained.
      const { gridExport } = await import('@civui/data/export');

      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.selectable = 'multiple';
      grid.selectedRowIds = [];
      grid.addEventListener('civ-selection-change', (e: Event) => {
        grid.selectedRowIds = (e as CustomEvent).detail.selectedRowIds;
      });

      const preview = (file: File) => {
        file.text().then((text) => {
          out.textContent = `${file.name} (${file.type})\n\n${text}`;
        });
      };

      csvBtn.addEventListener('click', () => {
        preview(gridExport(grid.rows, grid.columns, {
          filename: 'applications.csv',
        }));
      });
      jsonBtn.addEventListener('click', () => {
        preview(gridExport(grid.rows, grid.columns, {
          format: 'json',
          filename: 'applications.json',
        }));
      });
      selectedBtn.addEventListener('click', () => {
        preview(gridExport(grid.rows, grid.columns, {
          filename: 'selected-applications.csv',
          selectedRowIds: grid.selectedRowIds,
        }));
      });
    }, 0);
    return html`
      <div class="civ-flex civ-flex-col civ-gap-3">
        <p class="civ-m-0">
          Select rows below, then preview an export. In production the
          consumer would create a Blob URL and trigger a download instead
          of printing — the utility is the same.
        </p>
        <div class="civ-flex civ-gap-2">
          <civ-action-button id="story-export-csv" variant="secondary" icon-start="download" label="Export all (CSV)"></civ-action-button>
          <civ-action-button id="story-export-json" variant="secondary" icon-start="download" label="Export all (JSON)"></civ-action-button>
          <civ-action-button id="story-export-selected" variant="secondary" icon-start="download" label="Export selection (CSV)"></civ-action-button>
        </div>
        <civ-data-grid class="story-export" caption="Applications (export demo)"></civ-data-grid>
        <pre id="story-export-out" style="background: var(--civ-color-base-lightest); padding: var(--civ-spacing-3); border-radius: 4px; max-height: 200px; overflow: auto; white-space: pre-wrap; font-size: 0.85em;">Click an export button to preview the output.</pre>
      </div>
    `;
  },
};

export const KeyboardNavigation: Story = {
  name: 'Keyboard grid navigation (role="grid")',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-keynav') as any;
      if (!grid) return;
      const cols: GridColumn[] = [
        { key: 'applicant', header: 'Applicant', sortable: true },
        { key: 'type', header: 'Type' },
        { key: 'status', header: 'Status', editable: true, formatter: statusBadge, inputType: 'select', options: [
          { value: 'In review', label: 'In review' },
          { value: 'Approved', label: 'Approved' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Denied', label: 'Denied' },
        ]},
        { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
      ];
      const data = [...SAMPLE_DATA];
      const rows: GridRow[] = data.map((d) => ({
        id: d.id,
        cells: { applicant: d.applicant, type: d.type, status: d.status, updated: d.updated },
        actions: [
          { id: 'view', label: 'View details' },
          { id: 'edit', label: 'Edit' },
        ],
      }));
      grid.columns = cols;
      grid.rows = rows;
      grid.selectable = 'multiple';
      grid.selectedRowIds = [];
      grid.addEventListener('civ-selection-change', (e: Event) => {
        grid.selectedRowIds = (e as CustomEvent).detail.selectedRowIds;
      });
      grid.addEventListener('civ-sort', (e: Event) => {
        const { column, direction } = (e as CustomEvent).detail;
        grid.sortBy = column;
        grid.sortDirection = direction;
      });
      grid.addEventListener('civ-cell-edit-commit', (e: Event) => {
        const { rowId, columnKey, value } = (e as CustomEvent).detail;
        grid.rows = grid.rows.map((r: GridRow) =>
          r.id === rowId ? { ...r, cells: { ...r.cells, [columnKey]: value } } : r,
        );
      });
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">
          With <code>keyboardNav</code>, the table promotes to
          <code>role="grid"</code> and becomes a single tab stop. Once
          focused, use:
        </p>
        <ul class="civ-mb-4" style="line-height: 1.7;">
          <li><kbd>Tab</kbd> — focus the grid; <kbd>Tab</kbd> again leaves it.</li>
          <li><kbd>← → ↑ ↓</kbd> — move between cells.</li>
          <li><kbd>Home</kbd> / <kbd>End</kbd> — first / last cell in the current row.</li>
          <li><kbd>Ctrl+Home</kbd> / <kbd>Ctrl+End</kbd> — first / last cell in the grid.</li>
          <li><kbd>PageUp</kbd> / <kbd>PageDown</kbd> — jump 10 rows.</li>
          <li><kbd>Enter</kbd> / <kbd>Space</kbd> — activate the cell (sort, toggle checkbox, open menu, start edit).</li>
          <li><kbd>F2</kbd> — start edit on editable cells (Excel convention).</li>
          <li><kbd>Esc</kbd> — cancel an active edit.</li>
        </ul>
        <civ-data-grid
          class="story-keynav"
          caption="Applications — keyboard-navigable"
          keyboard-nav
          bordered
        ></civ-data-grid>
      </div>
    `;
  },
};

export const MultiColumnSort: Story = {
  name: 'Multi-column sort (Shift-click)',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-multisort') as any;
      if (!grid) return;
      const allRows = SAMPLE_DATA.map((d) => ({
        id: d.id,
        cells: { applicant: d.applicant, type: d.type, status: d.status, updated: d.updated },
      }));
      const cols: GridColumn[] = [
        { key: 'applicant', header: 'Applicant', sortable: true },
        { key: 'type', header: 'Type', sortable: true },
        { key: 'status', header: 'Status', sortable: true, formatter: statusBadge },
        { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
      ];
      grid.columns = cols;
      grid.rows = [...allRows];
      grid.multiSort = true;
      grid.sortKeys = [];
      // Client-side sort that honors the full stack.
      const compare = (av: unknown, bv: unknown): number => {
        // Numeric compare when both values are numbers — avoids the
        // lexicographic '10' < '2' trap of a pure String() compare.
        if (typeof av === 'number' && typeof bv === 'number') return av - bv;
        const as = String(av ?? '');
        const bs = String(bv ?? '');
        return as < bs ? -1 : as > bs ? 1 : 0;
      };
      const applySort = (keys: { key: string; direction: 'asc' | 'desc' }[]) => {
        if (keys.length === 0) {
          grid.rows = [...allRows];
          return;
        }
        const sorted = [...allRows].sort((a, b) => {
          for (const { key, direction } of keys) {
            const cmp = compare(a.cells[key], b.cells[key]);
            if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
          }
          return 0;
        });
        grid.rows = sorted;
      };
      grid.addEventListener('civ-sort', (e: Event) => {
        const { sortKeys } = (e as CustomEvent).detail;
        grid.sortKeys = sortKeys;
        applySort(sortKeys);
      });
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">
          Click a header to sort by that column alone.
          <strong>Shift-click</strong> additional headers to add them as
          secondary / tertiary sort keys — the priority badge (1, 2, 3…)
          next to the chevron shows the order. Shift-click an active key
          again to flip its direction; a third shift-click removes it.
        </p>
        <civ-data-grid
          class="story-multisort"
          caption="Applications (multi-column sort)"
          bordered
        ></civ-data-grid>
      </div>
    `;
  },
};

export const Aggregations: Story = {
  name: 'Aggregations',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-aggregate') as any;
      if (!grid) return;
      const fmtUSD = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
      const cols: GridColumn[] = [
        { key: 'applicant', header: 'Applicant', sortable: true },
        { key: 'type', header: 'Type' },
        {
          key: 'amount',
          header: 'Award amount',
          align: 'numeric',
          formatter: (v) => fmtUSD(Number(v)),
          aggregate: (rows, col) => `Total: ${fmtUSD(sum(rows, col))}`,
        },
        {
          key: 'days',
          header: 'Days in review',
          align: 'numeric',
          aggregate: (rows, col) => `Avg: ${avg(rows, col).toFixed(1)}`,
        },
      ];
      grid.columns = cols;
      grid.rows = SAMPLE_DATA.map((d, i) => ({
        id: d.id,
        cells: {
          applicant: d.applicant,
          type: d.type,
          amount: 1500 + i * 850,
          days: 4 + (i * 3) % 28,
        },
      }));
      grid.groupBy = 'type';
      grid.stickyFooter = true;
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">
          Each column with <code>aggregate</code> contributes a per-group
          subtotal row plus a grand-total in the sticky <code>&lt;tfoot&gt;</code>.
          Custom function aggregators do the formatting (currency,
          decimals, "Total:" / "Avg:" prefixes).
        </p>
        <div style="max-height: 360px; overflow-y: auto; border: 1px solid var(--civ-color-base-lighter);">
          <civ-data-grid
            class="story-aggregate"
            caption="Applications with subtotals"
            bordered
          ></civ-data-grid>
        </div>
      </div>
    `;
  },
};

export const ColumnFiltering: Story = {
  name: 'Per-column filtering',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-filter') as any;
      const status = document.getElementById('story-filter-status');
      if (!grid) return;
      const cols: GridColumn[] = [
        { key: 'applicant', header: 'Applicant', sortable: true, filter: { type: 'text', placeholder: 'Search name' } },
        { key: 'type', header: 'Type', filter: {
          type: 'select',
          options: [
            { value: 'Disability', label: 'Disability' },
            { value: 'Pension', label: 'Pension' },
            { value: 'Education', label: 'Education' },
            { value: 'Healthcare', label: 'Healthcare' },
          ],
        }},
        { key: 'status', header: 'Status', formatter: statusBadge, filter: {
          type: 'select',
          options: [
            { value: 'In review', label: 'In review' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Denied', label: 'Denied' },
          ],
        }},
        { key: 'amount', header: 'Amount', align: 'numeric',
          filter: { type: 'number-range' },
          formatter: (v) => `$${v}`,
        },
      ];
      const allRows: GridRow[] = SAMPLE_DATA.map((d, i) => ({
        id: d.id,
        cells: {
          applicant: d.applicant,
          type: d.type,
          status: d.status,
          // Synthesize an "amount" column for the range filter demo.
          amount: 100 + i * 75,
        },
      }));
      grid.columns = cols;
      grid.rows = allRows;
      grid.filters = {};
      const updateStatus = () => {
        const n = Object.keys(grid.filters).length;
        if (status) {
          status.textContent = n === 0
            ? `${grid.rows.length} rows shown — no filters active.`
            : `${grid.rows.length} of ${allRows.length} rows shown — ${n} active filter${n === 1 ? '' : 's'}.`;
        }
      };
      updateStatus();
      grid.addEventListener('civ-filter-change', (e: Event) => {
        const { filters } = (e as CustomEvent).detail;
        grid.filters = filters;
        grid.rows = applyGridFilters(allRows, cols, filters);
        updateStatus();
      });
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">
          Type, select, or set a min/max — the grid dispatches
          <code>civ-filter-change</code> with the new full filter state,
          and the consumer applies the filter via
          <code>applyGridFilters</code> from <code>@civui/data/filter</code>.
        </p>
        <civ-data-grid
          class="story-filter"
          caption="Applications (with per-column filters)"
          bordered
        ></civ-data-grid>
        <p id="story-filter-status" class="civ-mt-3" aria-live="polite"></p>
      </div>
    `;
  },
};

export const GroupBy: Story = {
  name: 'Group-by collapsible groups',
  render: () => {
    setTimeout(() => {
      const grid = document.querySelector('civ-data-grid.story-groupby') as any;
      if (!grid) return;
      grid.columns = defaultColumns;
      grid.rows = toRows(SAMPLE_DATA);
      grid.groupBy = 'type';
      grid.expandedGroups = ['Disability', 'Pension', 'Education', 'Healthcare'];
      grid.groupLabel = (key: string, rows: any[]) =>
        `${key} (${rows.length} application${rows.length === 1 ? '' : 's'})`;
      grid.addEventListener('civ-group-toggle', (e: Event) => {
        const { groupKey, expanded } = (e as CustomEvent).detail;
        grid.expandedGroups = expanded
          ? [...grid.expandedGroups, groupKey]
          : grid.expandedGroups.filter((k: string) => k !== groupKey);
      });
    }, 0);
    return html`
      <div>
        <p class="civ-mb-3">
          Rows are grouped by the <strong>Type</strong> column. Click a
          chevron to collapse a group; its data rows hide while the header
          stays.
        </p>
        <civ-data-grid class="story-groupby" caption="Applications grouped by type"></civ-data-grid>
      </div>
    `;
  },
};
