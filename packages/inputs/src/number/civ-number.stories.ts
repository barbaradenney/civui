import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-number.js';

const meta: Meta = {
  title: 'Inputs/Number',
  component: 'civ-number',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Generic numeric input for quantities, counts, ages, and other non-currency
numbers. Renders \`<input type="text" inputmode="numeric">\` for accessibility
(avoids the known issues with native \`type="number"\`: scroll-wheel mutation,
locale-specific decimal separators, missing iOS spinners).

For dollar amounts use \`civ-currency\`; for SSN, ZIP, EIN, phone, etc. use
the dedicated preset components.
        `,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    allowDecimal: { control: 'boolean' },
    allowNegative: { control: 'boolean' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    width: { control: 'select', options: ['default', 'tiny', 'small', 'medium', 'large'] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-number label="Number of dependents" name="dependents"></civ-number>
  `,
};

export const WithRange: Story = {
  name: 'With min/max range',
  render: () => html`
    <civ-number
      label="Age"
      name="age"
      min="0"
      max="120"
      hint="Enter a whole number between 0 and 120"
      required
    ></civ-number>
  `,
};

export const Decimal: Story = {
  name: 'Decimal values',
  render: () => html`
    <civ-number
      label="Weight (kg)"
      name="weight"
      allow-decimal
      min="0"
      hint="Decimal values allowed"
      width="small"
    ></civ-number>
  `,
};

export const WithSuffix: Story = {
  name: 'With suffix unit',
  render: () => html`
    <civ-number
      label="Discount applied"
      name="discount"
      suffix="%"
      min="0"
      max="100"
      width="small"
    ></civ-number>
  `,
};

export const WithPrefix: Story = {
  name: 'With prefix',
  render: () => html`
    <civ-number
      label="Item code"
      name="item"
      prefix="#"
      width="small"
    ></civ-number>
  `,
};

export const Negative: Story = {
  name: 'Allows negative values',
  render: () => html`
    <civ-number
      label="Temperature (°C)"
      name="temp"
      allow-decimal
      allow-negative
      hint="Negative values allowed"
      width="small"
    ></civ-number>
  `,
};

export const HouseholdSize: Story = {
  name: 'Government form example — household size',
  render: () => html`
    <civ-number
      label="How many people live in your household?"
      name="household_size"
      hint="Include yourself, your spouse or partner, and any dependents."
      min="1"
      max="20"
      required
      width="small"
    ></civ-number>
  `,
};

export const WithError: Story = {
  name: 'With error',
  render: () => html`
    <civ-number
      label="Age"
      name="age"
      value="200"
      min="0"
      max="120"
      error="Age must be between 0 and 120"
    ></civ-number>
  `,
};
