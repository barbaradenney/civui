import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-popover.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Overlays/Popover',
  component: 'civ-popover',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Headless popover primitive. Wires the slotted trigger with click + keyboard activation, manages ARIA (`aria-haspopup`, `aria-expanded`, `aria-controls`), auto-positions the panel against viewport edges, and handles click-outside / Escape / Tab close. Higher-level components (`civ-menu`, `civ-column-visibility`) compose this and add their own item rendering / keyboard model. The `panel-role` prop sets the panel\'s ARIA role; `triggerHaspopup` sets the trigger\'s `aria-haspopup` value.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-popover panel-role="dialog" label="Filters">
      <civ-button data-civ-popover-trigger label="Filters" icon-end="chevron-down"></civ-button>
      <div class="civ-p-4" style="min-width: 240px;">
        <p class="civ-m-0 civ-mb-2"><strong>Filter results</strong></p>
        <p class="civ-m-0 civ-text-sm">Panel content goes here. Slot whatever children the higher-level component needs — checkboxes, filter chips, a form.</p>
      </div>
    </civ-popover>
  `,
};

export const MenuRole: Story = {
  name: 'panel-role="menu" (composed by civ-menu)',
  render: () => html`
    <civ-popover panel-role="menu" trigger-haspopup="menu" label="Row actions">
      <civ-button data-civ-popover-trigger label="Actions" icon-end="chevron-down"></civ-button>
      <ul class="civ-m-0 civ-list-none civ-p-1" role="presentation">
        <li role="presentation"><button role="menuitem" class="civ-w-full civ-text-start civ-px-3 civ-py-2 civ-bg-transparent civ-border-0">Edit</button></li>
        <li role="presentation"><button role="menuitem" class="civ-w-full civ-text-start civ-px-3 civ-py-2 civ-bg-transparent civ-border-0">Duplicate</button></li>
        <li role="presentation"><button role="menuitem" class="civ-w-full civ-text-start civ-px-3 civ-py-2 civ-bg-transparent civ-border-0">Remove</button></li>
      </ul>
    </civ-popover>
  `,
};

export const NoTabClose: Story = {
  name: 'no-tab-close (panel has form controls)',
  render: () => html`
    <civ-popover panel-role="group" label="Column visibility" no-tab-close>
      <civ-button data-civ-popover-trigger label="Columns" icon-end="chevron-down"></civ-button>
      <div class="civ-p-3" style="min-width: 200px;">
        <label class="civ-flex civ-gap-2 civ-items-center civ-py-1"><input type="checkbox" checked /> Name</label>
        <label class="civ-flex civ-gap-2 civ-items-center civ-py-1"><input type="checkbox" checked /> Email</label>
        <label class="civ-flex civ-gap-2 civ-items-center civ-py-1"><input type="checkbox" /> Phone</label>
        <p class="civ-mt-2 civ-mb-0 civ-text-sm">Tab cycles between checkboxes without dismissing the popover.</p>
      </div>
    </civ-popover>
  `,
};

export const AlignStart: Story = {
  name: 'align="start" (left-anchored)',
  render: () => html`
    <civ-popover panel-role="dialog" label="Notes" align="start">
      <civ-button data-civ-popover-trigger label="Notes" icon-end="chevron-down"></civ-button>
      <div class="civ-p-3" style="min-width: 200px;">
        <p class="civ-m-0">Panel anchors to the trigger's left edge.</p>
      </div>
    </civ-popover>
  `,
};
