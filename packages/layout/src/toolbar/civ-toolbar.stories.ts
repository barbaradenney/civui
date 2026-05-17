import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-toolbar.js';
import '@civui/inputs/text-input';
import '@civui/actions/button';
import '@civui/actions/filter-chip';
import '@civui/actions/filter-chip-group';

const meta: Meta = {
  title: 'Layout/Toolbar',
  component: 'civ-toolbar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal layout container for the row of controls above a list, grid, or filtered collection. Children land on the leading edge by default; add data-civ-toolbar-end to align trailing actions. Stacks vertically on viewports ≤480px.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-toolbar label="Applications toolbar">
      <civ-text-input label="Search" type="search"></civ-text-input>
      <civ-button data-civ-toolbar-end variant="primary" label="Add application"></civ-button>
    </civ-toolbar>
  `,
};

export const WithFilters: Story = {
  name: 'With Filter Chips',
  render: () => html`
    <civ-toolbar label="Filtered applications">
      <civ-text-input label="Search" type="search"></civ-text-input>
      <civ-filter-chip-group label="Status filters">
        <civ-filter-chip label="In review"></civ-filter-chip>
        <civ-filter-chip label="Approved" selected></civ-filter-chip>
        <civ-filter-chip label="Denied"></civ-filter-chip>
      </civ-filter-chip-group>
      <civ-button data-civ-toolbar-end variant="primary" label="Add application"></civ-button>
    </civ-toolbar>
  `,
};

export const ActionsOnly: Story = {
  render: () => html`
    <civ-toolbar label="Quick actions">
      <civ-button data-civ-toolbar-end variant="tertiary" icon-start="download" label="Export"></civ-button>
      <civ-button data-civ-toolbar-end variant="primary" label="Add new"></civ-button>
    </civ-toolbar>
  `,
};

export const StartOnly: Story = {
  render: () => html`
    <civ-toolbar label="Search only">
      <civ-text-input label="Search" type="search"></civ-text-input>
    </civ-toolbar>
  `,
};

export const Empty: Story = {
  render: () => html`<civ-toolbar label="Empty toolbar"></civ-toolbar>`,
};
