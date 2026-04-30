import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-badge.js';
import '@civui/feedback/count';

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
    dot: { control: 'boolean' },
    overlay: { control: 'boolean' },
    withIcon: { control: 'boolean', name: 'with-icon' },
    iconStart: { control: 'text', name: 'icon-start' },
    iconEnd: { control: 'text', name: 'icon-end' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A compact status indicator. Use for state ("Approved", "Pending"), severity, or as a notification dot. For numeric counts use `civ-count`. For categorization use `civ-tag`.',
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
      icon-start="${args.iconStart || ''}"
      icon-end="${args.iconEnd || ''}"
      ?with-icon="${args.withIcon}"
      ?dot="${args.dot}"
      ?overlay="${args.overlay}"
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

export const WithIcon: Story = {
  name: 'With Icon (auto by variant)',
  parameters: {
    docs: {
      description: {
        story:
          'Set `with-icon` to render the variant\'s semantic icon at the start: success → check-circle, warning → warning, error → error, info → info. Neutral has no auto-icon. The icon is decorative (`aria-hidden`); the label remains the accessible name.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <civ-badge variant="info" label="Info" with-icon></civ-badge>
      <civ-badge variant="success" label="Approved" with-icon></civ-badge>
      <civ-badge variant="warning" label="Pending" with-icon></civ-badge>
      <civ-badge variant="error" label="Denied" with-icon></civ-badge>
      <civ-badge variant="neutral" label="Draft" with-icon></civ-badge>
    </div>
  `,
};

export const ExplicitIcons: Story = {
  name: 'Explicit Icons (start + end)',
  parameters: {
    docs: {
      description: {
        story:
          'Use `icon-start` / `icon-end` for explicit icons. `icon-start` overrides the `with-icon` variant default.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.5rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <civ-badge variant="success" label="Approved" icon-start="star"></civ-badge>
        <civ-badge variant="info" label="Read more" icon-end="chevron-right"></civ-badge>
        <civ-badge variant="success" label="Verified" with-icon icon-end="lock"></civ-badge>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <civ-badge variant="success" label="Approved" badge-style="primary" with-icon></civ-badge>
        <civ-badge variant="warning" label="Action needed" badge-style="primary" with-icon></civ-badge>
        <civ-badge variant="error" label="Denied" badge-style="primary" with-icon></civ-badge>
      </div>
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
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Compact (sm)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <civ-badge variant="success" spacing="sm" label="Approved"></civ-badge>
          <civ-badge variant="error" badge-style="primary" spacing="sm" label="Denied"></civ-badge>
        </div>
      </div>
    </div>
  `,
};

export const Overlay: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Overlay mode pins a badge to the top-end corner of a relatively-positioned parent — useful for "new" or "online" indicators on icons. Wrap the parent in `.civ-badge-anchor` (or set `position: relative` yourself). For numeric notification counters (e.g. "3 unread"), use `civ-count` instead.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 1.5rem; align-items: center;">
      <span class="civ-badge-anchor">
        <civ-icon name="mail" size="lg"></civ-icon>
        <civ-badge overlay dot label="New mail" variant="error"></civ-badge>
      </span>
      <span class="civ-badge-anchor">
        <civ-icon name="settings" size="lg"></civ-icon>
        <civ-badge overlay dot label="Updates available" variant="info"></civ-badge>
      </span>
      <span class="civ-badge-anchor">
        <civ-icon name="person" size="lg"></civ-icon>
        <civ-badge overlay label="New" variant="success" badge-style="primary"></civ-badge>
      </span>
    </div>
  `,
};

export const VsTagAndCount: Story = {
  name: 'Badge vs Tag vs Count',
  parameters: {
    docs: {
      description: {
        story:
          '**Badge** = status text or dot (semantic colors, role="status"). **Tag** = categorization label (non-semantic palette, no role). **Count** = numeric annotation (lighter chrome, no role by default).',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>Badge (status): <civ-badge variant="success" label="Approved"></civ-badge></div>
      <div>Tag (category): <civ-tag variant="purple" label="Healthcare"></civ-tag></div>
      <div>Count (number): Inbox <civ-count count="12"></civ-count></div>
    </div>
  `,
};
