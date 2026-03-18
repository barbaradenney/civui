import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-checkbox.js';
import './civ-checkbox-group.js';

const meta: Meta = {
  title: 'Forms/Checkbox',
  component: 'civ-checkbox',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    description: { control: 'text' },
    checked: { control: 'boolean' },
    tile: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'I agree to the terms and conditions',
    name: 'agree',
  },
  render: (args) => html`
    <civ-checkbox
      label="${args.label}"
      name="${args.name}"
      ?checked="${args.checked}"
      ?tile="${args.tile}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-checkbox>
  `,
};

export const Checked: Story = {
  render: () => html`
    <civ-checkbox label="Already checked" name="checked" checked></civ-checkbox>
  `,
};

export const WithDescription: Story = {
  render: () => html`
    <civ-checkbox
      label="Email notifications"
      name="email-notifications"
      description="Receive weekly updates about your account activity"
    ></civ-checkbox>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-checkbox
      label="I agree to the terms"
      name="agree"
      error="You must agree to continue"
      required
    ></civ-checkbox>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-checkbox label="Cannot change" name="locked" disabled checked></civ-checkbox>
  `,
};

export const TileVariant: Story = {
  render: () => html`
    <civ-checkbox
      label="Standard shipping"
      name="shipping"
      value="standard"
      description="Arrives in 5-7 business days"
      tile
    ></civ-checkbox>
  `,
};

export const TileChecked: Story = {
  render: () => html`
    <civ-checkbox
      label="Express shipping"
      name="shipping"
      value="express"
      description="Arrives in 2-3 business days"
      tile
      checked
    ></civ-checkbox>
  `,
};

export const Group: Story = {
  render: () => html`
    <civ-checkbox-group legend="Notification preferences" hint="Select all that apply">
      <civ-checkbox label="Email" name="notifications" value="email"></civ-checkbox>
      <civ-checkbox label="SMS" name="notifications" value="sms"></civ-checkbox>
      <civ-checkbox label="Push notifications" name="notifications" value="push"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupWithError: Story = {
  render: () => html`
    <civ-checkbox-group legend="Notification preferences" error="Select at least one" required>
      <civ-checkbox label="Email" name="notifications" value="email"></civ-checkbox>
      <civ-checkbox label="SMS" name="notifications" value="sms"></civ-checkbox>
      <civ-checkbox label="Push notifications" name="notifications" value="push"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupTileVariant: Story = {
  render: () => html`
    <civ-checkbox-group legend="Choose your plan" hint="Select all features you need" tile>
      <civ-checkbox
        label="Basic"
        name="plan"
        value="basic"
        description="5 GB storage, email support"
      ></civ-checkbox>
      <civ-checkbox
        label="Pro"
        name="plan"
        value="pro"
        description="50 GB storage, priority support"
      ></civ-checkbox>
      <civ-checkbox
        label="Enterprise"
        name="plan"
        value="enterprise"
        description="Unlimited storage, dedicated support"
      ></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const Indeterminate: Story = {
  render: () => html`
    <civ-checkbox
      label="Select all items"
      name="select-all"
      indeterminate
    ></civ-checkbox>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-checkbox
      label="Subscribe to newsletter"
      name="newsletter"
      hint="We will send you a weekly digest of our best content"
    ></civ-checkbox>
  `,
};

export const GroupWithName: Story = {
  render: () => html`
    <civ-checkbox-group
      legend="Dietary restrictions"
      name="dietary"
      hint="Select all that apply to your household"
    >
      <civ-checkbox label="Vegetarian" value="vegetarian"></civ-checkbox>
      <civ-checkbox label="Vegan" value="vegan"></civ-checkbox>
      <civ-checkbox label="Gluten-free" value="gluten-free"></civ-checkbox>
      <civ-checkbox label="Dairy-free" value="dairy-free"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <civ-checkbox-group
      legend="Available days"
      name="days"
      orientation="horizontal"
    >
      <civ-checkbox label="Mon" value="mon"></civ-checkbox>
      <civ-checkbox label="Tue" value="tue"></civ-checkbox>
      <civ-checkbox label="Wed" value="wed"></civ-checkbox>
      <civ-checkbox label="Thu" value="thu"></civ-checkbox>
      <civ-checkbox label="Fri" value="fri"></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupDisabled: Story = {
  render: () => html`
    <civ-checkbox-group
      legend="Locked preferences"
      name="locked"
      disabled
    >
      <civ-checkbox label="Email" value="email" checked></civ-checkbox>
      <civ-checkbox label="SMS" value="sms"></civ-checkbox>
      <civ-checkbox label="Push" value="push" checked></civ-checkbox>
    </civ-checkbox-group>
  `,
};

export const GroupInForm: Story = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const values = fd.getAll('toppings');
        alert('Submitted toppings: ' + values.join(', '));
      }}
    >
      <civ-checkbox-group
        legend="Pizza toppings"
        name="toppings"
        hint="Pick your favorites"
        required
      >
        <civ-checkbox label="Cheese" value="cheese" checked></civ-checkbox>
        <civ-checkbox label="Pepperoni" value="pepperoni"></civ-checkbox>
        <civ-checkbox label="Mushrooms" value="mushrooms"></civ-checkbox>
        <civ-checkbox label="Olives" value="olives"></civ-checkbox>
      </civ-checkbox-group>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
      </div>
    </form>
  `,
};
