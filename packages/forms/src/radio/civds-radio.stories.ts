import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-radio.js';
import './civds-radio-group.js';

const meta: Meta = {
  title: 'Forms/Radio',
  component: 'civds-radio',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    description: { control: 'text' },
    checked: { control: 'boolean' },
    tile: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civds-radio-group legend="Color preference" name="color">
      <civds-radio label="Red" value="red"></civds-radio>
      <civds-radio label="Blue" value="blue"></civds-radio>
      <civds-radio label="Green" value="green"></civds-radio>
    </civds-radio-group>
  `,
};

export const WithPreselection: Story = {
  render: () => html`
    <civds-radio-group legend="Size" name="size" value="medium">
      <civds-radio label="Small" value="small"></civds-radio>
      <civds-radio label="Medium" value="medium"></civds-radio>
      <civds-radio label="Large" value="large"></civds-radio>
    </civds-radio-group>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <civds-radio-group legend="Shipping method" name="shipping">
      <civds-radio
        label="Standard"
        value="standard"
        description="5-7 business days, free"
      ></civds-radio>
      <civds-radio
        label="Express"
        value="express"
        description="2-3 business days, $9.99"
      ></civds-radio>
      <civds-radio
        label="Overnight"
        value="overnight"
        description="Next business day, $24.99"
      ></civds-radio>
    </civds-radio-group>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-radio-group legend="Payment method" name="payment" error="Please select a payment method" required>
      <civds-radio label="Credit card" value="credit"></civds-radio>
      <civds-radio label="Debit card" value="debit"></civds-radio>
      <civds-radio label="Bank transfer" value="bank"></civds-radio>
    </civds-radio-group>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civds-radio-group legend="Contact preference" name="contact" hint="How should we reach you?">
      <civds-radio label="Email" value="email"></civds-radio>
      <civds-radio label="Phone" value="phone"></civds-radio>
      <civds-radio label="Mail" value="mail"></civds-radio>
    </civds-radio-group>
  `,
};

export const TileVariant: Story = {
  render: () => html`
    <civds-radio-group legend="Plan" name="plan">
      <civds-radio
        label="Free"
        value="free"
        description="Basic features, community support"
        tile
      ></civds-radio>
      <civds-radio
        label="Pro"
        value="pro"
        description="All features, priority support, API access"
        tile
      ></civds-radio>
      <civds-radio
        label="Enterprise"
        value="enterprise"
        description="Custom solutions, dedicated account manager"
        tile
      ></civds-radio>
    </civds-radio-group>
  `,
};

export const DisabledOption: Story = {
  render: () => html`
    <civds-radio-group legend="Availability" name="time">
      <civds-radio label="Morning" value="morning"></civds-radio>
      <civds-radio label="Afternoon" value="afternoon"></civds-radio>
      <civds-radio label="Evening (unavailable)" value="evening" disabled></civds-radio>
    </civds-radio-group>
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
      <civds-radio-group legend="Favorite fruit" name="fruit" required>
        <civds-radio label="Apple" value="apple"></civds-radio>
        <civds-radio label="Banana" value="banana"></civds-radio>
        <civds-radio label="Cherry" value="cherry"></civds-radio>
      </civds-radio-group>
      <button
        type="submit"
        style="margin-top: 16px; padding: 8px 24px; background: #005ea2; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Submit
      </button>
    </form>
  `,
};
