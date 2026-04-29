import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-ein.js';

const meta: Meta = {
  title: 'Forms/Inputs/EIN',
  component: 'civ-ein',
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
    name: 'ein',
    value: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-ein
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-ein>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-ein name="ein" hint="Find this on your IRS determination letter"></civ-ein>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-ein name="ein" error="Enter a valid Employer Identification Number"></civ-ein>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-ein name="ein" required></civ-ein>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-ein name="ein" value="123456789" disabled></civ-ein>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-ein name="normal"></civ-ein>
      <civ-ein name="hint" hint="Find this on your IRS determination letter"></civ-ein>
      <civ-ein name="error" error="Enter a valid Employer Identification Number"></civ-ein>
      <civ-ein name="required" required></civ-ein>
      <civ-ein name="disabled" value="123456789" disabled></civ-ein>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  name: 'Government Form Example',
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Business Information</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Provide the Employer Identification Number assigned to your
        organization by the IRS.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-ein name="ein" required></civ-ein>
      </div>
    </div>
  `,
};
