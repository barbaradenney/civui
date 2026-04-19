import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-address.js';

const meta: Meta = {
  title: 'Forms/Address',
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
    showMilitary: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Mailing address',
    name: 'mailing',
  },
  render: (args) => html`
    <civ-address
      legend="${args.legend}"
      name="${args.name}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-address>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      hint="US addresses only"
    ></civ-address>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-address
      legend="Home address"
      name="home"
      required
    ></civ-address>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      error="Please enter a complete address"
      required
    ></civ-address>
  `,
};

export const FieldErrors: Story = {
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      street-error="Enter a street address"
      city-error="Enter a city"
      state-error="Select a state"
      zip-error="Enter a ZIP code"
      required
    ></civ-address>
  `,
};

export const WithoutStreet2: Story = {
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
    ></civ-address>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-address');
    if (el) {
      (el as any).showStreet2 = false;
    }
  },
};

export const Disabled: Story = {
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      disabled
    ></civ-address>
  `,
};

export const Prefilled: Story = {
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
    ></civ-address>
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
        military: false,
      };
    }
  },
};

export const International: Story = {
  name: 'International (With Country)',
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      show-country
    ></civ-address>
  `,
};

export const MilitaryAddress: Story = {
  name: 'Military Address',
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      show-military
    ></civ-address>
  `,
};

export const WithStreet3: Story = {
  name: 'With Street Line 3',
  render: () => html`
    <civ-address
      legend="Mailing address"
      name="mailing"
      show-street3
    ></civ-address>
  `,
};

export const FullOptions: Story = {
  name: 'All Options Enabled',
  render: () => html`
    <civ-address
      legend="Complete address"
      name="fullAddr"
      show-country
      show-military
      show-street3
      required
      hint="Enter your full mailing address including country"
    ></civ-address>
  `,
};
