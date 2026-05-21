import type { Meta, StoryObj } from '@storybook/web-components-vite';
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

export const WholeDollars: Story = {
  name: 'Whole dollars (decimals="0")',
  parameters: {
    docs: {
      description: {
        story:
          'For tax-style fields that ask for whole-dollar amounts (W-4 line 4c, partial FAFSA income lines, VA benefit applications). The decimal key is rejected during typing, blur rounds to the nearest dollar, and the display omits the `.00` suffix.',
      },
    },
  },
  render: () => html`
    <civ-currency
      name="extra-withholding"
      label="Extra withholding per pay period"
      hint="Whole dollar amount, no cents"
      decimals="0"
    ></civ-currency>
  `,
};

export const WithMinMax: Story = {
  name: 'With min / max bounds',
  parameters: {
    docs: {
      description: {
        story:
          'Inline bounds validation. Out-of-range values surface an error on blur rather than waiting for a server round-trip. Use for wage caps, contribution limits, grant ranges.',
      },
    },
  },
  render: () => html`
    <civ-currency
      name="annual-contribution"
      label="Annual FSA contribution"
      hint="Federal limit: $500 – $3,300"
      min="500"
      max="3300"
      required
    ></civ-currency>
  `,
};

export const AllowNegative: Story = {
  name: 'Allow negative (refunds / adjustments)',
  parameters: {
    docs: {
      description: {
        story:
          'For refund, adjustment, and expense-report fields where a debit makes sense. The input accepts a leading minus sign and the locale display shows "-$1,234.56".',
      },
    },
  },
  render: () => html`
    <civ-currency
      name="adjustment"
      label="Adjustment to prior return"
      hint="Use a minus sign for refunds (e.g. -125.00)"
      allow-negative
    ></civ-currency>
  `,
};
