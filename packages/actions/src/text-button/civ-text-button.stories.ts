import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-text-button.js';

const meta: Meta = {
  title: 'Actions/Text Button',
  component: 'civ-text-button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    emphasis: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
    spacing: { control: 'select', options: ['default', 'sm'] },
    iconStart: { control: 'text', name: 'icon-start' },
    iconEnd: { control: 'text', name: 'icon-end' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The small button primitive — a thin element wrapping the shared `civ-text-btn` chrome that `civ-disclosure`, `civ-read-more`, `civ-confirm-button`, and `civ-toggle-button` all compose. Reach for `civ-text-button` when you need a click affordance with the text-btn visual idiom but none of the state-machine behaviors of the confirm / toggle siblings. For heavier page-level CTAs use `civ-button`; for toolbar / row actions use `civ-action-button`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Show more',
    emphasis: 'secondary',
    spacing: 'default',
    disabled: false,
  },
  render: (args) => html`
    <civ-text-button
      label="${args.label}"
      emphasis="${args.emphasis || 'secondary'}"
      spacing="${args.spacing || 'default'}"
      icon-start="${args.iconStart || ''}"
      icon-end="${args.iconEnd || ''}"
      ?disabled="${args.disabled}"
    ></civ-text-button>
  `,
};

export const Emphasis: Story = {
  name: 'Emphasis levels',
  parameters: {
    docs: {
      description: {
        story:
          'Three emphasis levels mirror the `civ-button` family at text-btn scale. `secondary` (default) is the gray pill — the common case. `primary` is a filled brand pill for the rare inline CTA. `tertiary` is the transparent text-link style for quiet shortcuts.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
      <civ-text-button label="Generate" emphasis="primary"></civ-text-button>
      <civ-text-button label="Show more" emphasis="secondary"></civ-text-button>
      <civ-text-button label="Today" emphasis="tertiary"></civ-text-button>
    </div>
  `,
};

export const Spacing: Story = {
  name: 'Spacing (default vs sm)',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">default:</span>
        <civ-text-button label="Show more"></civ-text-button>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">sm:</span>
        <civ-text-button label="Show more" spacing="sm"></civ-text-button>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
      <civ-text-button label="Today" emphasis="tertiary" icon-start="today"></civ-text-button>
      <civ-text-button label="Show details" emphasis="secondary" icon-end="chevron-down"></civ-text-button>
      <civ-text-button label="Generate" emphasis="primary" icon-start="refresh"></civ-text-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
      <civ-text-button label="Show more" disabled></civ-text-button>
      <civ-text-button label="Generate" emphasis="primary" disabled></civ-text-button>
      <civ-text-button label="Today" emphasis="tertiary" disabled></civ-text-button>
    </div>
  `,
};

export const InsideHelperRow: Story = {
  name: 'Inside an input helper row',
  parameters: {
    docs: {
      description: {
        story:
          'The text-btn family was designed for this placement — a small affordance that sits in `.civ-input-helper-row` directly below an input. For a copy/scan/generate action with a transient receipt, reach for `civ-confirm-button` instead — it owns the success-state machine.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 24rem;">
      <label class="civ-label" for="text-btn-helper-demo">Search</label>
      <div class="civ-input-icon-wrap"><input id="text-btn-helper-demo" class="civ-input" placeholder="Type to search…" /></div>
      <div class="civ-input-helper-row">
        <civ-text-button label="Clear" emphasis="tertiary"></civ-text-button>
        <civ-text-button label="Recent searches" emphasis="tertiary"></civ-text-button>
      </div>
    </div>
  `,
};

export const Loading: Story = {
  name: 'Loading state',
  parameters: {
    docs: {
      description: {
        story:
          'Async-in-flight state for the rare text-button case that hits the network (Generate / Scan that wraps an API call). Swaps the leading icon for an `xs` `civ-spinner`, sets `aria-busy="true"`, disables the button, and swaps the accessible name to `loading-label`. For Copy with a transient ✓ receipt — use `civ-confirm-button` instead.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
      <civ-text-button label="Generate" emphasis="primary" loading loading-label="Generating…"></civ-text-button>
      <civ-text-button label="Scan" emphasis="secondary" icon-start="refresh" loading loading-label="Scanning…"></civ-text-button>
      <civ-text-button label="Refresh" emphasis="tertiary" loading loading-label="Refreshing…"></civ-text-button>
    </div>
  `,
};
