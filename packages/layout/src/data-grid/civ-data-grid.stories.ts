import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-data-grid.js';
import '../pagination/civ-pagination.js';
import '../toolbar/civ-toolbar.js';
import '../bulk-actions/civ-bulk-actions.js';
import '@civui/actions/button';
import '@civui/inputs/text-input';
import type { GridColumn, GridRow } from './civ-data-grid.types.js';

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
  { key: 'status', header: 'Status' },
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
          formatter: (value: any) => {
            const v = String(value);
            const variant = v === 'Approved' ? 'success' : v === 'Denied' ? 'error' : 'info';
            return html`<civ-tag variant="${variant}">${v}</civ-tag>` as any;
          },
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
          <civ-button variant="secondary" icon-start="download" label="Export"></civ-button>
          <civ-button variant="secondary" danger label="Delete"></civ-button>
        </civ-bulk-actions>
        <civ-data-grid class="story-full" caption="Applications"></civ-data-grid>
      </div>
    `;
  },
};
