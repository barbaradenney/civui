import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-input-chip.js';
import '../filter-chip/civ-filter-chip.js';

const meta: Meta = {
  title: 'Actions/Input Chip',
  component: 'civ-input-chip',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    spacing: { control: 'select', options: ['default', 'sm', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Display chip representing user-entered content with an always-present remove handle. Use for recipient lists on email composers, tags on a post, applied-filter readouts, typed keywords in a search bar. Distinct from civ-filter-chip because the chip represents data the user has already put in, not a toggleable option from a known list.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'alice@example.com',
    value: 'alice@example.com',
    disabled: false,
    spacing: 'default',
  },
  render: (args) => html`
    <civ-input-chip
      label="${args.label}"
      value="${args.value}"
      spacing="${args.spacing || 'default'}"
      ?disabled="${args.disabled}"
    ></civ-input-chip>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <civ-input-chip label="Default"></civ-input-chip>
      <civ-input-chip label="Disabled" disabled></civ-input-chip>
    </div>
  `,
};

export const RecipientList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A row of email recipients. Each chip represents user-entered content; the × removes the recipient from the list.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 32rem;">
      <label style="font-weight: 600;">To</label>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; padding: 0.5rem; border: 1px solid var(--civ-color-border); border-radius: 0.25rem;">
        <civ-input-chip label="alice@example.com" value="alice@example.com"></civ-input-chip>
        <civ-input-chip label="bob@example.com" value="bob@example.com"></civ-input-chip>
        <civ-input-chip label="carol@example.com" value="carol@example.com"></civ-input-chip>
        <span style="color: var(--civ-color-base-dark); font-size: 0.875rem;">Add more…</span>
      </div>
    </div>
  `,
};

export const TagInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Free-form tags applied to a post. The user typed each one; the × revokes the entry.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 32rem;">
      <label style="font-weight: 600;">Tags</label>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <civ-input-chip label="typescript" value="typescript"></civ-input-chip>
        <civ-input-chip label="accessibility" value="accessibility"></civ-input-chip>
        <civ-input-chip label="government" value="government"></civ-input-chip>
        <civ-input-chip label="forms" value="forms"></civ-input-chip>
      </div>
    </div>
  `,
};

export const AppliedFilterReadout: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Read-only summary of which filters are currently active, rendered above search results. The × removes the filter and re-fetches. (For interactive on/off filter selection — without a × handle — use civ-filter-chip instead.)',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 36rem;">
      <p style="margin: 0; font-weight: 600;">Active filters:</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <civ-input-chip label="Category: Healthcare" value="cat-healthcare"></civ-input-chip>
        <civ-input-chip label="State: California" value="state-CA"></civ-input-chip>
        <civ-input-chip label="Updated: Last 30 days" value="last-30"></civ-input-chip>
      </div>
    </div>
  `,
};

export const Spacing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes. `default` and `sm` both hit the WCAG 2.5.8 AA minimum target (24px). `lg` hits the WCAG 2.5.5 AAA Enhanced target (44px) for fingertip-heavy mobile placements like a recipient list on a touch device.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">default:</span>
        <civ-input-chip label="alice@example.com"></civ-input-chip>
        <civ-input-chip label="bob@example.com"></civ-input-chip>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">sm:</span>
        <civ-input-chip label="alice@example.com" spacing="sm"></civ-input-chip>
        <civ-input-chip label="bob@example.com" spacing="sm"></civ-input-chip>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 5rem;">lg (AAA):</span>
        <civ-input-chip label="alice@example.com" spacing="lg"></civ-input-chip>
        <civ-input-chip label="bob@example.com" spacing="lg"></civ-input-chip>
      </div>
    </div>
  `,
};

export const InputVsFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison: input chips represent user-entered content (no `selected` state, always removable via ×). Filter chips toggle a selection from a known list (no × handle — use input-chip if you need one).',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 32rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 7rem;">Input chips:</span>
        <civ-input-chip label="typescript"></civ-input-chip>
        <civ-input-chip label="accessibility"></civ-input-chip>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.875rem; min-width: 7rem;">Filter chips:</span>
        <civ-filter-chip label="Healthcare" selected></civ-filter-chip>
        <civ-filter-chip label="Education"></civ-filter-chip>
      </div>
    </div>
  `,
};
