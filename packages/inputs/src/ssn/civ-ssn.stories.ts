import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-ssn.js';

const meta: Meta = {
  title: 'Forms/Inputs/SSN',
  component: 'civ-ssn',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    error: { control: 'text' },
    mode: { control: 'select', options: ['full', 'last4'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: 'ssn',
    value: '',
    error: '',
    mode: 'full',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-ssn
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      mode="${args.mode}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-ssn>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-ssn name="ssn" hint="This is used to verify your identity"></civ-ssn>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-ssn name="ssn" error="Enter a valid Social Security number"></civ-ssn>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-ssn name="ssn" required></civ-ssn>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-ssn name="ssn" value="123456789" disabled></civ-ssn>
  `,
};

// ── Mode Variants ─────────────────────────────────────────────

export const Last4Mode: Story = {
  name: 'Last 4 digits',
  render: () => html`
    <civ-ssn name="ssn" mode="last4"></civ-ssn>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-ssn name="normal"></civ-ssn>
      <civ-ssn name="hint" hint="This is used to verify your identity"></civ-ssn>
      <civ-ssn name="error" error="Enter a valid Social Security number"></civ-ssn>
      <civ-ssn name="required" required></civ-ssn>
      <civ-ssn name="disabled" value="123456789" disabled></civ-ssn>
      <civ-ssn name="last4" mode="last4"></civ-ssn>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Identity Verification</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        We need your Social Security number to verify your identity and
        process your benefits application.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-ssn name="ssn" required></civ-ssn>
      </div>
    </div>
  `,
};
