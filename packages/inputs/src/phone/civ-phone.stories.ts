import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-phone.js';

const meta: Meta = {
  title: 'Forms/Inputs/Phone',
  component: 'civ-phone',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    error: { control: 'text' },
    international: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: 'phone',
    value: '',
    error: '',
    international: false,
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-phone
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?international="${args.international}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-phone>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-phone name="phone" hint="We may call this number to verify your identity"></civ-phone>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-phone name="phone" error="Enter a valid 10-digit phone number"></civ-phone>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-phone name="phone" required></civ-phone>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-phone name="phone" value="2025551234" disabled></civ-phone>
  `,
};

// ── Mode Variants ─────────────────────────────────────────────

export const InternationalMode: Story = {
  name: 'International',
  render: () => html`
    <civ-phone name="phone" international></civ-phone>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-phone name="normal"></civ-phone>
      <civ-phone name="hint" hint="We may call this number to verify your identity"></civ-phone>
      <civ-phone name="error" error="Enter a valid 10-digit phone number"></civ-phone>
      <civ-phone name="required" required></civ-phone>
      <civ-phone name="disabled" value="2025551234" disabled></civ-phone>
      <civ-phone name="intl" international></civ-phone>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  name: 'Government Form Example',
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Contact Information</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Provide a phone number where we can reach you about your application.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-phone name="phone" required></civ-phone>
      </div>
    </div>
  `,
};
