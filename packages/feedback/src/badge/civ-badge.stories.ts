import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-badge.js';

const meta: Meta = {
  title: 'Feedback/Badge',
  component: 'civ-badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success', 'neutral'],
    },
    badgeStyle: {
      control: 'select',
      options: ['primary', 'secondary'],
      name: 'badge-style',
    },
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
    label: { control: 'text' },
    count: { control: 'number' },
    max: { control: 'number' },
    dot: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A compact status or count indicator. Use for state ("Approved", "Pending"), severity, or numeric counts. For categorization, use `civ-tag` instead.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    variant: 'success',
    badgeStyle: 'secondary',
    spacing: 'default',
    label: 'Approved',
  },
  render: (args) => html`
    <civ-badge
      variant="${args.variant}"
      badge-style="${args.badgeStyle || 'secondary'}"
      spacing="${args.spacing || 'default'}"
      label="${args.label}"
      count="${args.count ?? ''}"
      max="${args.max ?? 99}"
      ?dot="${args.dot}"
    ></civ-badge>
  `,
};

export const StatusVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <civ-badge variant="info" label="Info"></civ-badge>
      <civ-badge variant="success" label="Approved"></civ-badge>
      <civ-badge variant="warning" label="Pending"></civ-badge>
      <civ-badge variant="error" label="Denied"></civ-badge>
      <civ-badge variant="neutral" label="Draft"></civ-badge>
    </div>
  `,
};

export const Counts: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-badge variant="info" count="3"></civ-badge>
      <civ-badge variant="warning" count="42"></civ-badge>
      <civ-badge variant="error" count="150"></civ-badge>
      <civ-badge variant="error" count="9" max="9"></civ-badge>
    </div>
  `,
};

export const Dots: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
      <span>Messages <civ-badge dot label="Unread messages" variant="error"></civ-badge></span>
      <span>Tasks <civ-badge dot label="New tasks" variant="info"></civ-badge></span>
      <span>Status <civ-badge dot label="Online" variant="success"></civ-badge></span>
    </div>
  `,
};

export const Styles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two emphasis levels. **Secondary** (default) is a light tint with dark text — quieter, suited to inline use. **Primary** is a filled dark surface with light text — louder, for prominent state callouts.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Secondary (default)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-badge variant="info" label="Info"></civ-badge>
          <civ-badge variant="success" label="Approved"></civ-badge>
          <civ-badge variant="warning" label="Pending"></civ-badge>
          <civ-badge variant="error" label="Denied"></civ-badge>
          <civ-badge variant="neutral" label="Draft"></civ-badge>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Primary</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-badge variant="info" badge-style="primary" label="Info"></civ-badge>
          <civ-badge variant="success" badge-style="primary" label="Approved"></civ-badge>
          <civ-badge variant="warning" badge-style="primary" label="Pending"></civ-badge>
          <civ-badge variant="error" badge-style="primary" label="Denied"></civ-badge>
          <civ-badge variant="neutral" badge-style="primary" label="Draft"></civ-badge>
        </div>
      </div>
    </div>
  `,
};

export const Spacing: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default and compact (`sm`) padding for dense layouts.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-badge variant="success" label="Approved"></civ-badge>
          <civ-badge variant="error" badge-style="primary" label="Denied"></civ-badge>
          <civ-badge variant="info" count="12"></civ-badge>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Compact (sm)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-badge variant="success" spacing="sm" label="Approved"></civ-badge>
          <civ-badge variant="error" badge-style="primary" spacing="sm" label="Denied"></civ-badge>
          <civ-badge variant="info" spacing="sm" count="12"></civ-badge>
        </div>
      </div>
    </div>
  `,
};

export const VsTag: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side: `civ-badge` (semantic state) vs `civ-tag` (categorization). Both use hard edges; badges restrict to semantic colors.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>Badge (status): <civ-badge variant="success" label="Approved"></civ-badge></div>
      <div>Tag (category): <civ-tag variant="purple" label="Healthcare"></civ-tag></div>
    </div>
  `,
};
