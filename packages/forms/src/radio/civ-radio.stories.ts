import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-radio.js';
import './civ-radio-group.js';

const meta: Meta = {
  title: 'Forms/Radio',
  component: 'civ-radio-group',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    tile: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Color preference',
    name: 'color',
    value: '',
    hint: '',
    error: '',
    tile: false,
    required: false,
    disabled: false,
    orientation: 'vertical',
  },
  render: (args) => html`
    <civ-radio-group
      legend="${args.legend}"
      name="${args.name}"
      value="${args.value}"
      hint="${args.hint}"
      error="${args.error}"
      ?tile="${args.tile}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      orientation="${args.orientation}"
    >
      <civ-radio label="Red" value="red"></civ-radio>
      <civ-radio label="Blue" value="blue"></civ-radio>
      <civ-radio label="Green" value="green"></civ-radio>
    </civ-radio-group>
  `,
};

export const WithPreselection: Story = {
  render: () => html`
    <civ-radio-group legend="Size" name="size" value="medium">
      <civ-radio label="Small" value="small"></civ-radio>
      <civ-radio label="Medium" value="medium"></civ-radio>
      <civ-radio label="Large" value="large"></civ-radio>
    </civ-radio-group>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <civ-radio-group legend="Shipping method" name="shipping">
      <civ-radio
        label="Standard"
        value="standard"
        description="5-7 business days, free"
      ></civ-radio>
      <civ-radio
        label="Express"
        value="express"
        description="2-3 business days, $9.99"
      ></civ-radio>
      <civ-radio
        label="Overnight"
        value="overnight"
        description="Next business day, $24.99"
      ></civ-radio>
    </civ-radio-group>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-radio-group legend="Payment method" name="payment" error="Please select a payment method" required>
      <civ-radio label="Credit card" value="credit"></civ-radio>
      <civ-radio label="Debit card" value="debit"></civ-radio>
      <civ-radio label="Bank transfer" value="bank"></civ-radio>
    </civ-radio-group>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-radio-group legend="Contact preference" name="contact" hint="How should we reach you?">
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

export const TileVariant: Story = {
  render: () => html`
    <civ-radio-group legend="Plan" name="plan">
      <civ-radio
        label="Free"
        value="free"
        description="Basic features, community support"
        tile
      ></civ-radio>
      <civ-radio
        label="Pro"
        value="pro"
        description="All features, priority support, API access"
        tile
      ></civ-radio>
      <civ-radio
        label="Enterprise"
        value="enterprise"
        description="Custom solutions, dedicated account manager"
        tile
      ></civ-radio>
    </civ-radio-group>
  `,
};

export const Horizontal: Story = {
  render: () => html`
    <civ-radio-group legend="Contact preference" name="contact" orientation="horizontal">
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

export const DisabledOption: Story = {
  render: () => html`
    <civ-radio-group legend="Availability" name="time">
      <civ-radio label="Morning" value="morning"></civ-radio>
      <civ-radio label="Afternoon" value="afternoon"></civ-radio>
      <civ-radio label="Evening (unavailable)" value="evening" disabled></civ-radio>
    </civ-radio-group>
  `,
};

export const InNativeForm: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-radio-group legend="Favorite fruit" name="fruit" required>
        <civ-radio label="Apple" value="apple"></civ-radio>
        <civ-radio label="Banana" value="banana"></civ-radio>
        <civ-radio label="Cherry" value="cherry"></civ-radio>
      </civ-radio-group>
      <button
        type="submit"
        style="margin-top: 16px; padding: 8px 24px; background: #005ea2; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Submit
      </button>
    </form>
  `,
};
