import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-va-file-number.js';

const meta: Meta = {
  title: 'Forms/Inputs/VA File Number',
  component: 'civ-va-file-number',
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
    name: 'vaFileNumber',
    value: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-va-file-number
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-va-file-number>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-va-file-number name="vaFileNumber" hint="This may be the same as your Social Security number"></civ-va-file-number>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-va-file-number name="vaFileNumber" error="Enter a valid VA file number (8 or 9 digits)"></civ-va-file-number>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-va-file-number name="vaFileNumber" required></civ-va-file-number>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-va-file-number name="vaFileNumber" value="123456789" disabled></civ-va-file-number>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-va-file-number name="normal"></civ-va-file-number>
      <civ-va-file-number name="hint" hint="This may be the same as your Social Security number"></civ-va-file-number>
      <civ-va-file-number name="error" error="Enter a valid VA file number (8 or 9 digits)"></civ-va-file-number>
      <civ-va-file-number name="required" required></civ-va-file-number>
      <civ-va-file-number name="disabled" value="123456789" disabled></civ-va-file-number>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  name: 'Government Form Example',
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Veteran Identification</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Your VA file number helps us locate your records. It is usually
        the same as your Social Security number, but not always.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-va-file-number name="vaFileNumber" required></civ-va-file-number>
      </div>
    </div>
  `,
};
