import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-address.js';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Forms/Compound/Address',
  component: 'civ-address',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showStreet2: { control: 'boolean' },
    showStreet3: { control: 'boolean' },
    showCountry: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Mailing address',
    name: 'mailing',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-address
      legend="${args.legend}"
      size="lg"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-address>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => html`
    <civ-address
      size="lg" legend="Mailing address"
      name="mailing"
      street-error="Enter a street address"
      city-error="Enter a city"
      state-error="Select a state"
      zip-error="Enter a ZIP code"
      required
    ></civ-address>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-address
      size="lg" legend="Home address"
      name="home"
      required
    ></civ-address>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-address
      size="lg" legend="Mailing address"
      name="mailing"
      disabled
    ></civ-address>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-address legend="\1" size="lg" name="normal"></civ-address>
      <civ-address legend="\1" size="lg" name="hint" hint="US addresses only"></civ-address>
      <civ-address legend="\1" size="lg" name="error" error="Enter a complete address" required></civ-address>
      <civ-address legend="\1" size="lg" name="required" required></civ-address>
      <civ-address legend="\1" size="lg" name="disabled" disabled></civ-address>
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
        <civ-address legend="\1" size="lg" name="dense-addr"></civ-address>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-address legend="\1" size="lg" name="default-addr"></civ-address>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-address legend="\1" size="lg" name="spacious-addr"></civ-address>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const Prefilled: Story = {
  render: () => html`
    <civ-address legend="\1" size="lg" name="mailing"></civ-address>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-address');
    if (el) {
      (el as any).addressValue = {
        country: 'US',
        street1: '1600 Pennsylvania Avenue NW',
        street2: '',
        street3: '',
        city: 'Washington',
        state: 'DC',
        zip: '20500',
      };
    }
  },
};

export const FullOptions: Story = {
  name: 'All Options Enabled',
  render: () => html`
    <civ-address
      size="lg" legend="Complete address"
      name="fullAddr"
      show-street3
      required
      hint="Enter your full mailing address including country"
    ></civ-address>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentMailingForm: Story = {
  name: 'Usage: Correspondence Address',
  render: () => html`
    <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Where should we send correspondence?</h3>
    <civ-address
      size="lg" legend="Mailing address"
      name="correspondence"
      required
    ></civ-address>
  `,
};
