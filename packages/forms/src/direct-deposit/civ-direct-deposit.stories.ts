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
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { legend: 'Direct deposit information', name: 'bank' },
  render: (args) => html`<civ-direct-deposit legend="${args.legend}" name="${args.name}" ?required="${args.required}" ?disabled="${args.disabled}"></civ-direct-deposit>`,
};

export const Required: Story = {
  render: () => html`<civ-direct-deposit legend="Direct deposit" name="bank" required></civ-direct-deposit>`,
};

export const WithErrors: Story = {
  render: () => html`<civ-direct-deposit legend="Direct deposit" type-error="Select an account type" routing-error="Enter a valid nine digit routing number" account-error="Enter a bank account number"></civ-direct-deposit>`,
};

export const Disabled: Story = {
  render: () => html`<civ-direct-deposit legend="Direct deposit" disabled></civ-direct-deposit>`,
};

export const Prefilled: Story = {
  render: () => html`<civ-direct-deposit legend="Direct deposit" name="bank"></civ-direct-deposit>`,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-direct-deposit') as any;
    el.depositValue = { accountType: 'checking', routingNumber: '123456789', accountNumber: '9876543210' };
  },
};
