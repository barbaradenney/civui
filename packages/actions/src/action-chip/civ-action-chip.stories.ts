import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-action-chip.js';
import '../filter-chip/civ-filter-chip.js';

const meta: Meta = {
  title: 'Actions/Action Chip',
  component: 'civ-action-chip',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    spacing: { control: 'select', options: ['default', 'sm', 'lg'] },
    iconStart: { control: 'text', name: 'icon-start' },
    iconEnd: { control: 'text', name: 'icon-end' },
    count: { control: 'number' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Fire-and-forget rounded chip button. Same outlined pill chrome as civ-filter-chip but no toggle state and no check icon — clicking it dispatches `civ-click` and the chip stays unchanged. Use for suggestion chips, quick filters that immediately re-fetch, and secondary CTAs that need less prominence than civ-button. For toggleable on/off selection use civ-filter-chip; for user-entered tokens use civ-input-chip.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Last 30 days',
    value: 'last-30',
    disabled: false,
    spacing: 'default',
  },
  render: (args) => html`
    <civ-action-chip
      label="${args.label}"
      value="${args.value}"
      spacing="${args.spacing || 'default'}"
      icon-start="${args.iconStart || ''}"
      icon-end="${args.iconEnd || ''}"
      .count="${args.count ?? null}"
      ?disabled="${args.disabled}"
    ></civ-action-chip>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-action-chip label="Default"></civ-action-chip>
      <civ-action-chip label="Disabled" disabled></civ-action-chip>
    </div>
  `,
};

export const QuickFilters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A row of suggestion chips that immediately re-fetch when clicked. Unlike civ-filter-chip these don\'t accumulate a selection — picking one fires the action and the chip stays visually unchanged.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-action-chip label="Today" value="today"></civ-action-chip>
      <civ-action-chip label="Last 7 days" value="last-7"></civ-action-chip>
      <civ-action-chip label="Last 30 days" value="last-30"></civ-action-chip>
      <civ-action-chip label="Last 90 days" value="last-90"></civ-action-chip>
      <civ-action-chip label="Custom range…" value="custom"></civ-action-chip>
    </div>
  `,
};

export const SuggestionChips: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Suggestion chips in a chat composer or empty-state. Clicking pre-fills an input or fires a search action.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 32rem;">
      <p style="margin: 0;">Try one of these:</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <civ-action-chip label="Show me unread messages" value="unread" icon-start="email"></civ-action-chip>
        <civ-action-chip label="Schedule a meeting" value="schedule" icon-start="event"></civ-action-chip>
        <civ-action-chip label="Find a contact" value="contact" icon-start="search"></civ-action-chip>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-action-chip label="Add filter" icon-start="add"></civ-action-chip>
      <civ-action-chip label="Sort" icon-end="arrow-down"></civ-action-chip>
      <civ-action-chip label="Refresh" icon-start="refresh"></civ-action-chip>
    </div>
  `,
};

export const WithCount: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Optional count rendered after the label. Useful when the chip\'s action targets a subset and the consumer wants to preview how many items will be affected.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-action-chip label="Show unread" .count="${4}"></civ-action-chip>
      <civ-action-chip label="Archive read" .count="${127}"></civ-action-chip>
    </div>
  `,
};

export const Spacing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes. `default` and `sm` both hit the WCAG 2.5.8 AA minimum target (24px). `lg` hits the WCAG 2.5.5 AAA Enhanced target (44px) for fingertip-heavy mobile placements.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">default:</span>
        <civ-action-chip label="Today"></civ-action-chip>
        <civ-action-chip label="This week"></civ-action-chip>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">sm:</span>
        <civ-action-chip label="Today" spacing="sm"></civ-action-chip>
        <civ-action-chip label="This week" spacing="sm"></civ-action-chip>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">lg (AAA):</span>
        <civ-action-chip label="Today" spacing="lg"></civ-action-chip>
        <civ-action-chip label="This week" spacing="lg"></civ-action-chip>
      </div>
    </div>
  `,
};

export const ActionVsFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison: action chips fire and forget; filter chips toggle a selected state with a check icon.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 32rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 7rem;">Action chips:</span>
        <civ-action-chip label="Today"></civ-action-chip>
        <civ-action-chip label="Last 7 days"></civ-action-chip>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 7rem;">Filter chips:</span>
        <civ-filter-chip label="Healthcare" selected></civ-filter-chip>
        <civ-filter-chip label="Education"></civ-filter-chip>
      </div>
    </div>
  `,
};
