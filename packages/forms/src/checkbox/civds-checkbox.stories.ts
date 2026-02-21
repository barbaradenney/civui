import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-checkbox.js';
import './civds-checkbox-group.js';

const meta: Meta = {
  title: 'Forms/Checkbox',
  component: 'civds-checkbox',
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
    <civds-checkbox
      label="${args.label}"
      name="${args.name}"
      ?checked="${args.checked}"
      ?tile="${args.tile}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civds-checkbox>
  `,
};

export const Checked: Story = {
  render: () => html`
    <civds-checkbox label="Already checked" name="checked" checked></civds-checkbox>
  `,
};

export const WithDescription: Story = {
  render: () => html`
    <civds-checkbox
      label="Email notifications"
      name="email-notifications"
      description="Receive weekly updates about your account activity"
    ></civds-checkbox>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-checkbox
      label="I agree to the terms"
      name="agree"
      error="You must agree to continue"
      required
    ></civds-checkbox>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civds-checkbox label="Cannot change" name="locked" disabled checked></civds-checkbox>
  `,
};

export const TileVariant: Story = {
  render: () => html`
    <civds-checkbox
      label="Standard shipping"
      name="shipping"
      value="standard"
      description="Arrives in 5-7 business days"
      tile
    ></civds-checkbox>
  `,
};

export const TileChecked: Story = {
  render: () => html`
    <civds-checkbox
      label="Express shipping"
      name="shipping"
      value="express"
      description="Arrives in 2-3 business days"
      tile
      checked
    ></civds-checkbox>
  `,
};

export const Group: Story = {
  render: () => html`
    <civds-checkbox-group legend="Notification preferences" hint="Select all that apply">
      <civds-checkbox label="Email" name="notifications" value="email"></civds-checkbox>
      <civds-checkbox label="SMS" name="notifications" value="sms"></civds-checkbox>
      <civds-checkbox label="Push notifications" name="notifications" value="push"></civds-checkbox>
    </civds-checkbox-group>
  `,
};

export const GroupWithError: Story = {
  render: () => html`
    <civds-checkbox-group legend="Notification preferences" error="Select at least one" required>
      <civds-checkbox label="Email" name="notifications" value="email"></civds-checkbox>
      <civds-checkbox label="SMS" name="notifications" value="sms"></civds-checkbox>
      <civds-checkbox label="Push notifications" name="notifications" value="push"></civds-checkbox>
    </civds-checkbox-group>
  `,
};

export const GroupTileVariant: Story = {
  render: () => html`
    <civds-checkbox-group legend="Choose your plan" hint="Select all features you need">
      <civds-checkbox
        label="Basic"
        name="plan"
        value="basic"
        description="5 GB storage, email support"
        tile
      ></civds-checkbox>
      <civds-checkbox
        label="Pro"
        name="plan"
        value="pro"
        description="50 GB storage, priority support"
        tile
      ></civds-checkbox>
      <civds-checkbox
        label="Enterprise"
        name="plan"
        value="enterprise"
        description="Unlimited storage, dedicated support"
        tile
      ></civds-checkbox>
    </civds-checkbox-group>
  `,
};

export const Indeterminate: Story = {
  render: () => html`
    <civds-checkbox
      label="Select all items"
      name="select-all"
      indeterminate
    ></civds-checkbox>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civds-checkbox
      label="Subscribe to newsletter"
      name="newsletter"
      hint="We will send you a weekly digest of our best content"
    ></civds-checkbox>
  `,
};

export const GroupWithName: Story = {
  render: () => html`
    <civds-checkbox-group
      legend="Dietary restrictions"
      name="dietary"
      hint="Select all that apply to your household"
    >
      <civds-checkbox label="Vegetarian" value="vegetarian"></civds-checkbox>
      <civds-checkbox label="Vegan" value="vegan"></civds-checkbox>
      <civds-checkbox label="Gluten-free" value="gluten-free"></civds-checkbox>
      <civds-checkbox label="Dairy-free" value="dairy-free"></civds-checkbox>
    </civds-checkbox-group>
  `,
};

export const GroupHorizontal: Story = {
  render: () => html`
    <civds-checkbox-group
      legend="Available days"
      name="days"
      orientation="horizontal"
    >
      <civds-checkbox label="Mon" value="mon"></civds-checkbox>
      <civds-checkbox label="Tue" value="tue"></civds-checkbox>
      <civds-checkbox label="Wed" value="wed"></civds-checkbox>
      <civds-checkbox label="Thu" value="thu"></civds-checkbox>
      <civds-checkbox label="Fri" value="fri"></civds-checkbox>
    </civds-checkbox-group>
  `,
};

export const GroupDisabled: Story = {
  render: () => html`
    <civds-checkbox-group
      legend="Locked preferences"
      name="locked"
      disabled
    >
      <civds-checkbox label="Email" value="email" checked></civds-checkbox>
      <civds-checkbox label="SMS" value="sms"></civds-checkbox>
      <civds-checkbox label="Push" value="push" checked></civds-checkbox>
    </civds-checkbox-group>
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
      <civds-checkbox-group
        legend="Pizza toppings"
        name="toppings"
        hint="Pick your favorites"
        required
      >
        <civds-checkbox label="Cheese" value="cheese" checked></civds-checkbox>
        <civds-checkbox label="Pepperoni" value="pepperoni"></civds-checkbox>
        <civds-checkbox label="Mushrooms" value="mushrooms"></civds-checkbox>
        <civds-checkbox label="Olives" value="olives"></civds-checkbox>
      </civds-checkbox-group>
      <div class="civds-flex civds-gap-2 civds-mt-4">
        <button type="submit" class="civds-bg-primary civds-text-white civds-px-4 civds-py-2 civds-rounded">Submit</button>
        <button type="reset" class="civds-border civds-px-4 civds-py-2 civds-rounded">Reset</button>
      </div>
    </form>
  `,
};
