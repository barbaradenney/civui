import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
    disabled: { control: 'boolean' },
    emphasis: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    spacing: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An interactive, button-like control for filter selection. Click to toggle `selected`. Use horizontal rows of chips for filter sets in search results, list views, or faceted browse. For removable user-entered tokens use `civ-input-chip`. Not for status (use `civ-badge`) or static categorization labels (use `civ-tag`).',
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
    disabled: false,
    emphasis: 'secondary',
    spacing: 'default',
  },
  render: (args) => html`
    <civ-filter-chip
      label="${args.label}"
      value="${args.value}"
      emphasis="${args.emphasis || 'secondary'}"
      spacing="${args.spacing || 'default'}"
      ?selected="${args.selected}"
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
          <civ-filter-chip label="Healthcare" value="healthcare" emphasis="primary"></civ-filter-chip>
          <civ-filter-chip label="Education" value="education" emphasis="primary" selected></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing" emphasis="primary" selected></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const Spacing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes. `default` and `sm` both hit the WCAG 2.5.8 AA minimum target (24px). `lg` hits the WCAG 2.5.5 AAA Enhanced target (44px) for AAA-conscious surfaces or fingertip-heavy mobile placements.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Default (24px, AA)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <civ-filter-chip label="Healthcare" value="healthcare" selected></civ-filter-chip>
          <civ-filter-chip label="Education" value="education"></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing"></civ-filter-chip>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Compact (sm, 24px floor)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <civ-filter-chip label="Healthcare" value="healthcare" spacing="sm" selected></civ-filter-chip>
          <civ-filter-chip label="Education" value="education" spacing="sm"></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing" spacing="sm"></civ-filter-chip>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Large (lg, 44px AAA)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <civ-filter-chip label="Healthcare" value="healthcare" spacing="lg" selected></civ-filter-chip>
          <civ-filter-chip label="Education" value="education" spacing="lg"></civ-filter-chip>
          <civ-filter-chip label="Housing" value="housing" spacing="lg"></civ-filter-chip>
        </div>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Add a leading icon via `icon-start` to reinforce category meaning. The icon swaps to a check on selection so the visual treatment of selected vs unselected is consistent across icon and non-icon chips.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <civ-filter-chip label="Personal" value="personal" icon-start="person"></civ-filter-chip>
      <civ-filter-chip label="Important" value="important" icon-start="star" selected></civ-filter-chip>
      <civ-filter-chip label="Mailed" value="mail" icon-start="mail"></civ-filter-chip>
      <civ-filter-chip label="Recent" value="recent" icon-start="calendar"></civ-filter-chip>
    </div>
  `,
};

export const WithCounts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `count` to show how many results match each filter — common in faceted search and benefit-finder UIs.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <civ-filter-chip label="Healthcare" value="health" count="24"></civ-filter-chip>
      <civ-filter-chip label="Education" value="education" count="12" selected></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing" count="8"></civ-filter-chip>
      <civ-filter-chip label="Employment" value="employment" count="3"></civ-filter-chip>
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
      <div>Tag (static category): <civ-tag label="Healthcare" color="blue"></civ-tag></div>
      <div>Badge (status): <civ-badge label="Approved" intent="success"></civ-badge></div>
    </div>
  `,
};
