import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-column-visibility.js';
import '../data-grid/civ-data-grid.js';
import '@civui/feedback/badge';
import type { GridColumn } from '../data-grid/civ-data-grid.types.js';

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
  title: 'Data/Column Visibility',
  component: 'civ-column-visibility',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A popover that lets users toggle which columns of a civ-data-grid are visible. Multi-select — the panel stays open while the user toggles several checkboxes. Wired to a sibling civ-data-grid via the consumer: listen for civ-column-visibility-change, update the grid columns by flipping each entry\'s hidden flag.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const SAMPLE_COLUMNS: GridColumn[] = [
  { key: 'id', header: 'Application ID', width: '9rem' },
  { key: 'applicant', header: 'Applicant', sortable: true },
  { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status', formatter: statusBadge },
  { key: 'updated', header: 'Last updated', sortable: true, align: 'end' },
];

const SAMPLE_ROWS = [
  { id: 'A-001', cells: { id: 'A-001', applicant: 'Smith, John A.', type: 'Disability', status: 'In review', updated: '2026-05-15' } },
  { id: 'A-002', cells: { id: 'A-002', applicant: 'Doe, Jane M.', type: 'Pension', status: 'Approved', updated: '2026-05-14' } },
  { id: 'A-003', cells: { id: 'A-003', applicant: 'Reyes, Maria L.', type: 'Education', status: 'Pending', updated: '2026-05-12' } },
];

export const Default: Story = {
  render: () => {
    setTimeout(() => {
      const cols = document.querySelector('civ-column-visibility.story-default') as any;
      if (!cols) return;
      cols.columns = SAMPLE_COLUMNS;
      cols.hiddenColumns = [];
      cols.addEventListener('civ-column-visibility-change', (e: Event) => {
        cols.hiddenColumns = (e as CustomEvent).detail.hiddenColumns;
      });
    }, 0);
    return html`
      <div style="min-height: 320px;">
        <civ-column-visibility class="story-default"></civ-column-visibility>
      </div>
    `;
  },
};

export const SomeHidden: Story = {
  name: 'Pre-hidden Columns',
  render: () => {
    setTimeout(() => {
      const cols = document.querySelector('civ-column-visibility.story-pre') as any;
      if (!cols) return;
      cols.columns = SAMPLE_COLUMNS;
      cols.hiddenColumns = ['type', 'updated'];
      cols.addEventListener('civ-column-visibility-change', (e: Event) => {
        cols.hiddenColumns = (e as CustomEvent).detail.hiddenColumns;
      });
    }, 0);
    return html`
      <div style="min-height: 320px;">
        <civ-column-visibility class="story-pre"></civ-column-visibility>
      </div>
    `;
  },
};

export const WithDataGrid: Story = {
  name: 'Wired to a civ-data-grid',
  render: () => {
    setTimeout(() => {
      const cols = document.querySelector('civ-column-visibility.story-grid') as any;
      const grid = document.querySelector('civ-data-grid.story-grid') as any;
      if (!cols || !grid) return;
      cols.columns = SAMPLE_COLUMNS;
      cols.hiddenColumns = [];
      grid.columns = SAMPLE_COLUMNS;
      grid.rows = SAMPLE_ROWS;
      cols.addEventListener('civ-column-visibility-change', (e: Event) => {
        const hidden = (e as CustomEvent).detail.hiddenColumns;
        cols.hiddenColumns = hidden;
        grid.columns = SAMPLE_COLUMNS.map((c) => ({ ...c, hidden: hidden.includes(c.key) }));
      });
    }, 0);
    return html`
      <div class="civ-flex civ-flex-col civ-gap-3">
        <div style="display: flex; justify-content: flex-end;">
          <civ-column-visibility class="story-grid"></civ-column-visibility>
        </div>
        <civ-data-grid class="story-grid" caption="Applications"></civ-data-grid>
      </div>
    `;
  },
};

export const AlignStart: Story = {
  name: 'Align Start (left)',
  render: () => {
    setTimeout(() => {
      const cols = document.querySelector('civ-column-visibility.story-align') as any;
      if (!cols) return;
      cols.columns = SAMPLE_COLUMNS;
    }, 0);
    return html`
      <div style="min-height: 320px;">
        <civ-column-visibility class="story-align" align="start"></civ-column-visibility>
      </div>
    `;
  },
};

export const CustomMinVisible: Story = {
  name: 'Higher minVisible Floor',
  render: () => {
    setTimeout(() => {
      const cols = document.querySelector('civ-column-visibility.story-min') as any;
      if (!cols) return;
      cols.columns = SAMPLE_COLUMNS;
      cols.minVisible = 3;
      cols.addEventListener('civ-column-visibility-change', (e: Event) => {
        cols.hiddenColumns = (e as CustomEvent).detail.hiddenColumns;
      });
    }, 0);
    return html`
      <div style="min-height: 320px;">
        <p class="civ-mb-2">Try hiding columns — the component refuses to drop below 3 visible.</p>
        <civ-column-visibility class="story-min"></civ-column-visibility>
      </div>
    `;
  },
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => {
    setTimeout(() => {
      ['dense', 'default', 'spacious'].forEach((scale) => {
        const cols = document.querySelector(`civ-column-visibility.story-density-${scale}`) as any;
        if (!cols) return;
        cols.columns = SAMPLE_COLUMNS;
        cols.open = true;
      });
    }, 0);
    return html`
      <div class="civ-flex civ-flex-col civ-gap-6" style="min-height: 600px;">
        <div data-civ-scale="dense">
          <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
          <civ-column-visibility class="story-density-dense"></civ-column-visibility>
        </div>
        <div>
          <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
          <civ-column-visibility class="story-density-default"></civ-column-visibility>
        </div>
        <div data-civ-scale="spacious">
          <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
          <civ-column-visibility class="story-density-spacious"></civ-column-visibility>
        </div>
      </div>
    `;
  },
};
