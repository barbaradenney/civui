import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-zip.js';

const meta: Meta = {
  title: 'Forms/Inputs/ZIP Code',
  component: 'civ-zip',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    error: { control: 'text' },
    extended: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: 'zip',
    value: '',
    error: '',
    extended: false,
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-zip
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?extended="${args.extended}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-zip>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-zip name="zip" hint="Enter the ZIP code for your mailing address"></civ-zip>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-zip name="zip" error="Enter a valid 5-digit ZIP code"></civ-zip>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-zip name="zip" required></civ-zip>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-zip name="zip" value="20500" disabled></civ-zip>
  `,
};

// ── Mode Variants ─────────────────────────────────────────────

export const ExtendedMode: Story = {
  name: 'ZIP+4 (Extended)',
  render: () => html`
    <civ-zip name="zip" extended></civ-zip>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-zip name="normal"></civ-zip>
      <civ-zip name="hint" hint="Enter the ZIP code for your mailing address"></civ-zip>
      <civ-zip name="error" error="Enter a valid 5-digit ZIP code"></civ-zip>
      <civ-zip name="required" required></civ-zip>
      <civ-zip name="disabled" value="20500" disabled></civ-zip>
      <civ-zip name="extended" extended></civ-zip>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  name: 'Government Form Example',
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Mailing Address</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Enter the ZIP code where you receive mail. We use this to
        determine your regional office.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-zip name="zip" required></civ-zip>
      </div>
    </div>
  `,
};
