import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-email.js';

const meta: Meta = {
  title: 'Forms/Inputs/Email',
  component: 'civ-email',
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
    name: 'email',
    value: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-email
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-email>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-email name="email" hint="Use your work email if available"></civ-email>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-email name="email" error="Enter a valid email address"></civ-email>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-email name="email" required></civ-email>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-email name="email" value="user@example.gov" disabled></civ-email>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-email name="normal"></civ-email>
      <civ-email name="hint" hint="Use your work email if available"></civ-email>
      <civ-email name="error" error="Enter a valid email address"></civ-email>
      <civ-email name="required" required></civ-email>
      <civ-email name="disabled" value="user@example.gov" disabled></civ-email>
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
        We will send application updates and decision letters to this
        email address.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-email name="email" required></civ-email>
      </div>
    </div>
  `,
};
