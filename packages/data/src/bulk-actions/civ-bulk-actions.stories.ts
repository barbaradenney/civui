import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-bulk-actions.js';
import '@civui/actions/action-button';

const meta: Meta = {
  title: 'Layout/Bulk Actions',
  component: 'civ-bulk-actions',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Selection-aware action bar that appears above or below a data-grid when one or more rows are selected. Hidden via display:none when count is 0 so action buttons survive selection transitions. Wired to a sibling civ-data-grid: listen for civ-selection-change on the grid → update count; listen for civ-clear-selection on the bar → reset selectedRowIds.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const SingleSelection: Story = {
  render: () => html`
    <civ-bulk-actions count="1" item-name="application">
      <civ-action-button variant="secondary" icon-start="download" label="Export"></civ-action-button>
      <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
    </civ-bulk-actions>
  `,
};

export const MultipleSelection: Story = {
  render: () => html`
    <civ-bulk-actions count="7" item-name="application">
      <civ-action-button variant="secondary" icon-start="download" label="Export"></civ-action-button>
      <civ-action-button variant="secondary" icon-start="email" label="Notify"></civ-action-button>
      <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
    </civ-bulk-actions>
  `,
};

export const CustomPlural: Story = {
  name: 'Custom Plural (entries)',
  render: () => html`
    <civ-bulk-actions count="3" item-name="entry" item-name-plural="entries">
      <civ-action-button variant="secondary" label="Archive"></civ-action-button>
    </civ-bulk-actions>
  `,
};

export const CustomClearLabel: Story = {
  render: () => html`
    <civ-bulk-actions count="4" item-name="row" clear-label="Deselect all">
      <civ-action-button variant="secondary" label="Approve"></civ-action-button>
      <civ-action-button variant="secondary" danger label="Reject"></civ-action-button>
    </civ-bulk-actions>
  `,
};

export const Hidden: Story = {
  name: 'Hidden (count=0)',
  render: () => html`
    <div>
      <p>Bar is hidden because count is 0 — but the buttons still exist in the DOM:</p>
      <civ-bulk-actions count="0">
        <civ-action-button variant="secondary" label="Archive"></civ-action-button>
      </civ-bulk-actions>
    </div>
  `,
};

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-bulk-actions count="3" item-name="application">
          <civ-action-button variant="secondary" label="Archive"></civ-action-button>
          <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
        </civ-bulk-actions>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-bulk-actions count="3" item-name="application">
          <civ-action-button variant="secondary" label="Archive"></civ-action-button>
          <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
        </civ-bulk-actions>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-bulk-actions count="3" item-name="application">
          <civ-action-button variant="secondary" label="Archive"></civ-action-button>
          <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
        </civ-bulk-actions>
      </div>
    </div>
  `,
};

export const Interactive: Story = {
  render: () => html`
    <div>
      <p>
        <button id="bulk-add" type="button">Increment count</button>
        <button id="bulk-reset" type="button">Reset count</button>
      </p>
      <civ-bulk-actions id="bulk-bar" count="0" item-name="row">
        <civ-action-button variant="secondary" label="Archive"></civ-action-button>
        <civ-action-button variant="secondary" danger label="Delete"></civ-action-button>
      </civ-bulk-actions>
      <script>
        (function () {
          const bar = document.getElementById('bulk-bar');
          if (!bar || bar.__wired) return;
          bar.__wired = true;
          document.getElementById('bulk-add').addEventListener('click', () => {
            bar.count = (bar.count || 0) + 1;
          });
          document.getElementById('bulk-reset').addEventListener('click', () => {
            bar.count = 0;
          });
          bar.addEventListener('civ-clear-selection', () => {
            bar.count = 0;
          });
        })();
      </script>
    </div>
  `,
};
