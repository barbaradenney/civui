import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-direct-deposit.js';
import '@civui/inputs';
import '@civui/controls';

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
    <civ-direct-deposit legend="Direct deposit information" size="lg" name="bank"></civ-direct-deposit>
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
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Normal</h3>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="normal"></civ-direct-deposit>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With errors</h3>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="errors" type-error="Select account type" routing-error="Enter routing number" account-error="Enter account number"></civ-direct-deposit>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Required</h3>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="required" required></civ-direct-deposit>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</h3>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="disabled" disabled></civ-direct-deposit>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="dense-bank"></civ-direct-deposit>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="default-bank"></civ-direct-deposit>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-direct-deposit legend="Direct deposit" size="lg" name="spacious-bank"></civ-direct-deposit>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentPaymentSetup: Story = {
  name: 'Usage: Benefit Payment Setup',
  render: () => html`
    <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Set up direct deposit for benefit payments</h3>
    <p class="civ-m-0 civ-mb-4 civ-text-muted">
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

// ── Routing-number checksum (built-in) ────────────────────────

export const RoutingNumberValidation: Story = {
  name: 'Routing-number checksum',
  parameters: {
    docs: {
      description: {
        story:
          'The routing-number sub-input has `validate="routing"` set internally, so checksum-failing numbers (typos) are caught on blur with a "Enter a valid 9-digit bank routing number" message. Try `121000247` (off by one) for an error, or `121000248` (Wells Fargo SF) for valid.',
      },
    },
  },
  render: () => html`
    <civ-direct-deposit
      legend="Direct deposit"
      name="deposit"
    ></civ-direct-deposit>
  `,
};
