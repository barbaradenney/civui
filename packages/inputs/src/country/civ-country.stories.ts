import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-country.js';

const meta: Meta = {
  title: 'Forms/Inputs/Country',
  component: 'civ-country',
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    value: { control: 'text' },
    error: { control: 'text' },
    'us-first': { control: 'boolean' },
    include: { control: 'text' },
    exclude: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    name: 'country',
    value: '',
    error: '',
    'us-first': true,
    include: '',
    exclude: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-country
      name="${args.name}"
      value="${args.value}"
      error="${args.error}"
      ?us-first="${args['us-first']}"
      include="${args.include}"
      exclude="${args.exclude}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-country>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-country name="country" hint="Select your country of citizenship"></civ-country>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-country name="country" error="Select a country"></civ-country>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-country name="country" required></civ-country>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-country name="country" value="US" disabled></civ-country>
  `,
};

// ── Filter Variants ───────────────────────────────────────────

export const ExcludeSanctions: Story = {
  name: 'Exclude Sanctioned Countries',
  render: () => html`
    <civ-country name="country" exclude="KP,IR,SY"></civ-country>
  `,
};

export const LimitedSet: Story = {
  name: 'Limited Set (US, CA, MX, GB)',
  render: () => html`
    <civ-country name="country" include="US,CA,MX,GB"></civ-country>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6" style="max-width: 480px;">
      <civ-country name="normal"></civ-country>
      <civ-country name="hint" hint="Select your country of citizenship"></civ-country>
      <civ-country name="error" error="Select a country"></civ-country>
      <civ-country name="required" required></civ-country>
      <civ-country name="disabled" value="US" disabled></civ-country>
      <civ-country name="limited" include="US,CA,MX,GB" label="Country (limited)"></civ-country>
    </div>
  `,
};

// ── Government Form Example ──────────────────────────────────

export const GovernmentFormExample: Story = {
  name: 'Government Form Example',
  render: () => html`
    <div style="max-width: 480px;">
      <h3 class="civ-text-lg civ-font-semibold civ-mb-4">Country of Citizenship</h3>
      <p class="civ-text-sm civ-text-secondary civ-mb-6">
        Select the country where you hold citizenship. If you hold dual
        citizenship, select your primary country.
      </p>
      <div class="civ-flex civ-flex-col civ-gap-4">
        <civ-country name="country" required exclude="KP,IR,SY"></civ-country>
      </div>
    </div>
  `,
};
