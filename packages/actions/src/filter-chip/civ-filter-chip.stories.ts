import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-filter-chip.js';
import '@civui/layout/tag';
import '@civui/feedback/badge';

const meta: Meta = {
  title: 'Actions/Filter Chip',
  component: 'civ-filter-chip',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    selected: { control: 'boolean' },
    removable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    chipStyle: {
      control: 'select',
      options: ['primary', 'secondary'],
      name: 'chip-style',
    },
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An interactive, button-like control for filter selection. Click to toggle `selected`; in `removable` mode, click the trailing `×` to dismiss. Use horizontal rows of chips for filter sets in search results, list views, or faceted browse. Not for status (use `civ-badge`) or static categorization labels (use `civ-tag`).',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Healthcare',
    value: 'healthcare',
    selected: false,
    removable: false,
    disabled: false,
    chipStyle: 'secondary',
    spacing: 'default',
  },
  render: (args) => html`
    <civ-filter-chip
      label="${args.label}"
      value="${args.value}"
      chip-style="${args.chipStyle || 'secondary'}"
      spacing="${args.spacing || 'default'}"
      ?selected="${args.selected}"
      ?removable="${args.removable}"
      ?disabled="${args.disabled}"
    ></civ-filter-chip>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-filter-chip label="Default"></civ-filter-chip>
      <civ-filter-chip label="Selected" selected></civ-filter-chip>
      <civ-filter-chip label="Disabled" disabled></civ-filter-chip>
      <civ-filter-chip label="Selected + disabled" selected disabled></civ-filter-chip>
    </div>
  `,
};

export const FilterRow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A typical filter row on a results page. Each chip toggles independently. Wire up `civ-change` events to update the displayed results.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <civ-filter-chip label="Healthcare" value="healthcare" selected></civ-filter-chip>
      <civ-filter-chip label="Education" value="education"></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing"></civ-filter-chip>
      <civ-filter-chip label="Disability" value="disability" selected></civ-filter-chip>
      <civ-filter-chip label="Employment" value="employment"></civ-filter-chip>
    </div>
  `,
};

export const Removable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Removable chips show currently-applied filters. The `×` fires `civ-remove` (without toggling); the chip body still fires `civ-change`.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.5rem;">
      <p style="margin: 0; font-weight: 600;">Applied filters:</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <civ-filter-chip label="Healthcare" value="healthcare" selected removable></civ-filter-chip>
        <civ-filter-chip label="Disability" value="disability" selected removable></civ-filter-chip>
        <civ-filter-chip label="VA Form 21-526EZ" value="form-21-526ez" selected removable></civ-filter-chip>
      </div>
    </div>
  `,
};

export const Styles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two emphasis levels for the **selected** state. Secondary (default) tints the chip with light primary; primary fills it with the brand color and white text. Unselected chips look the same in both modes.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Secondary (default)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-filter-chip label="Healthcare" value="healthcare"></civ-filter-chip>
          <civ-filter-chip label="Education" value="education" selected></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing" selected></civ-filter-chip>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Primary</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-filter-chip label="Healthcare" value="healthcare" chip-style="primary"></civ-filter-chip>
          <civ-filter-chip label="Education" value="education" chip-style="primary" selected></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing" chip-style="primary" selected></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const Spacing: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default and compact (`sm`) padding for dense filter rows.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-filter-chip label="Healthcare" value="healthcare" selected></civ-filter-chip>
          <civ-filter-chip label="Education" value="education"></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing"></civ-filter-chip>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Compact (sm)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-filter-chip label="Healthcare" value="healthcare" spacing="sm" selected></civ-filter-chip>
          <civ-filter-chip label="Education" value="education" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing" spacing="sm"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const VsTagAndBadge: Story = {
  name: 'Filter chip vs Tag vs Badge',
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison: filter chip is interactive (a button), tag is a static categorization label (a span), badge is a status indicator with `role="status"`.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>Filter chip (interactive): <civ-filter-chip label="Healthcare" selected></civ-filter-chip></div>
      <div>Tag (static category): <civ-tag label="Healthcare" variant="blue"></civ-tag></div>
      <div>Badge (status): <civ-badge label="Approved" variant="success"></civ-badge></div>
    </div>
  `,
};
