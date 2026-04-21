import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-direct-deposit.js';

const meta: Meta = {
  title: 'Forms/Compound/Direct Deposit',
  component: 'civ-direct-deposit',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
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
    legend: 'Direct deposit information',
    name: 'bank',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-direct-deposit
      legend="${args.legend}"
      name="${args.name}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-direct-deposit>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'Prefilled',
  render: () => html`
    <civ-direct-deposit legend="Direct deposit information" name="bank"></civ-direct-deposit>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-direct-deposit') as any;
    el.depositValue = { accountType: 'checking', routingNumber: '123456789', accountNumber: '9876543210' };
  },
};

export const WithError: Story = {
  render: () => html`
    <civ-direct-deposit
      legend="Direct deposit information"
      name="bank"
      type-error="Select an account type"
      routing-error="Enter a valid nine digit routing number"
      account-error="Enter a bank account number"
    ></civ-direct-deposit>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-direct-deposit
      legend="Direct deposit information"
      name="bank"
      required
    ></civ-direct-deposit>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-direct-deposit
      legend="Direct deposit information"
      name="bank"
      disabled
    ></civ-direct-deposit>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">Normal</h3>
        <civ-direct-deposit legend="Direct deposit" name="normal"></civ-direct-deposit>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">With errors</h3>
        <civ-direct-deposit legend="Direct deposit" name="errors" type-error="Select account type" routing-error="Enter routing number" account-error="Enter account number"></civ-direct-deposit>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">Required</h3>
        <civ-direct-deposit legend="Direct deposit" name="required" required></civ-direct-deposit>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">Disabled</h3>
        <civ-direct-deposit legend="Direct deposit" name="disabled" disabled></civ-direct-deposit>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-direct-deposit legend="Direct deposit" name="dense-bank"></civ-direct-deposit>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-direct-deposit legend="Direct deposit" name="default-bank"></civ-direct-deposit>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-direct-deposit legend="Direct deposit" name="spacious-bank"></civ-direct-deposit>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentPaymentSetup: Story = {
  name: 'Usage: Benefit Payment Setup',
  render: () => html`
    <h3 style="margin: 0 0 16px; font-size: 1.25rem;">Set up direct deposit for benefit payments</h3>
    <p style="margin: 0 0 16px; color: #565c65;">
      Provide your bank account information so we can deposit your benefit payments directly.
      You can find your routing and account numbers on a check or by contacting your bank.
    </p>
    <civ-direct-deposit
      legend="Bank account information"
      name="benefitDeposit"
      required
    ></civ-direct-deposit>
  `,
};
