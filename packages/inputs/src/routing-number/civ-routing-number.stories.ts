import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-routing-number.js';

const meta: Meta = {
  title: 'Forms/Inputs/Routing Number',
  component: 'civ-routing-number',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: 'routing',
    value: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-routing-number
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-routing-number>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-routing-number name="routing" hint="Find this on the bottom left of a check"></civ-routing-number>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-routing-number name="routing" error="Enter a valid 9-digit routing number"></civ-routing-number>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-routing-number name="routing" required></civ-routing-number>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-routing-number name="routing" value="021000021" disabled></civ-routing-number>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-routing-number name="normal"></civ-routing-number>
      <civ-routing-number name="hint" hint="Find this on the bottom left of a check"></civ-routing-number>
      <civ-routing-number name="error" error="Enter a valid 9-digit routing number"></civ-routing-number>
      <civ-routing-number name="required" required></civ-routing-number>
      <civ-routing-number name="disabled" value="021000021" disabled></civ-routing-number>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Direct Deposit Setup</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Provide your bank routing number so we can deposit benefit
        payments directly into your account.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-routing-number name="routing" required></civ-routing-number>
      </div>
    </div>
  `,
};
