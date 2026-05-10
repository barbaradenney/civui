import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-count.js';
import '@civui/actions/filter-chip';

const meta: Meta = {
  title: 'Feedback/Count',
  component: 'civ-count',
  tags: ['autodocs'],
  argTypes: {
    count: { control: 'number' },
    max: { control: 'number' },
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success', 'neutral'],
    },
    countStyle: {
      control: 'select',
      options: ['primary', 'secondary'],
      name: 'count-style',
    },
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
    overlay: { control: 'boolean' },
    live: {
      control: 'select',
      options: ['off', 'polite', 'assertive'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Numeric annotation for filter chips, list items, navigation, and notification overlays. Lighter chrome than `civ-badge` so it composes inside other components without competing visually. Use `civ-badge` for status text/dots; use `civ-count` for numbers.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    count: 24,
    variant: 'neutral',
    countStyle: 'secondary',
    spacing: 'default',
    overlay: false,
  },
  render: (args) => html`
    <civ-count
      count="${args.count}"
      max="${args.max ?? 99}"
      variant="${args.variant}"
      count-style="${args.countStyle || 'secondary'}"
      spacing="${args.spacing || 'default'}"
      live="${args.live || 'off'}"
      ?overlay="${args.overlay}"
    ></civ-count>
  `,
};

export const Styles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Secondary** (default) is bare colored text — sits inside other components without adding chrome. **Primary** is a filled pill — for standalone or notification counters.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Secondary (default — text only)</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <span>Inbox <civ-count count="12"></civ-count></span>
          <span>Errors <civ-count count="3" variant="error"></civ-count></span>
          <span>Approved <civ-count count="42" variant="success"></civ-count></span>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Primary (filled pill)</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <civ-count count="5" variant="info" count-style="primary"></civ-count>
          <civ-count count="3" variant="error" count-style="primary"></civ-count>
          <civ-count count="42" variant="success" count-style="primary"></civ-count>
          <civ-count count="150" max="99" variant="error" count-style="primary"></civ-count>
        </div>
      </div>
    </div>
  `,
};

export const Spacing: Story = {
  parameters: {
    docs: {
      description: { story: 'Default and compact (`sm`) sizing for both styles.' },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <span>Inbox <civ-count count="12" variant="info"></civ-count></span>
          <span>Errors <civ-count count="3" variant="error"></civ-count></span>
          <civ-count count="12" count-style="primary" variant="info"></civ-count>
          <civ-count count="42" count-style="primary" variant="error"></civ-count>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 0.25rem; font-weight: 600;">Compact (sm)</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <span>Inbox <civ-count count="12" variant="info" spacing="sm"></civ-count></span>
          <span>Errors <civ-count count="3" variant="error" spacing="sm"></civ-count></span>
          <civ-count count="12" count-style="primary" variant="info" spacing="sm"></civ-count>
          <civ-count count="42" count-style="primary" variant="error" spacing="sm"></civ-count>
        </div>
      </div>
    </div>
  `,
};

export const Overflow: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <civ-count count="9" max="9" count-style="primary" variant="error"></civ-count>
      <civ-count count="99" count-style="primary" variant="error"></civ-count>
      <civ-count count="150" count-style="primary" variant="error"></civ-count>
      <civ-count count="9999" max="999" count-style="primary" variant="error"></civ-count>
    </div>
  `,
};

export const NotificationOverlay: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Overlay mode pins the count to the top-end corner of a relatively-positioned parent — the classic notification badge over an icon. Wrap the parent in `.civ-badge-anchor` (or set `position: relative` yourself).',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 1.5rem; align-items: center;">
      <span class="civ-badge-anchor">
        <civ-icon name="mail" size="2xl"></civ-icon>
        <civ-count overlay count="3" variant="error" count-style="primary"></civ-count>
      </span>
    </div>
  `,
};

export const InlineInChips: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'civ-filter-chip uses civ-count internally for its `count` prop. The result blends with the chip color and inherits its emphasis.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <civ-filter-chip label="Healthcare" value="health" count="24"></civ-filter-chip>
      <civ-filter-chip label="Education" value="education" count="12" selected></civ-filter-chip>
      <civ-filter-chip label="Housing" value="housing" count="8"></civ-filter-chip>
    </div>
  `,
};
