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
