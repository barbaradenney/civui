import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-currency.js';

const meta: Meta = {
  title: 'Forms/Inputs/Currency',
  component: 'civ-currency',
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
    name: 'amount',
    value: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-currency
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-currency>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-currency name="amount" hint="Enter the total before taxes"></civ-currency>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-currency name="amount" error="Enter a valid dollar amount"></civ-currency>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-currency name="amount" required></civ-currency>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-currency name="amount" value="1250.00" disabled></civ-currency>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-currency name="normal"></civ-currency>
      <civ-currency name="hint" hint="Enter the total before taxes"></civ-currency>
      <civ-currency name="error" error="Enter a valid dollar amount"></civ-currency>
      <civ-currency name="required" required></civ-currency>
      <civ-currency name="disabled" value="1250.00" disabled></civ-currency>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  name: 'Government Form Example',
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Income Information</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Report your gross annual income from all sources. Include wages,
        salary, tips, and investment income.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-currency name="annual-income" label="Gross annual income" required></civ-currency>
        <civ-currency name="other-income" label="Other income"></civ-currency>
      </div>
    </div>
  `,
};
