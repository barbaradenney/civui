import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-repeater.js';
import '../text-input/civ-text-input.js';

const meta: Meta = {
  title: 'Forms/Repeater',
  component: 'civ-repeater',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    itemLabel: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Dependents',
    name: 'dependents',
    itemLabel: 'dependent',
  },
  render: (args) => html`
    <civ-repeater
      legend="${args.legend}"
      name="${args.name}"
      item-label="${args.itemLabel}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const MinRows: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      min="3"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const MaxRows: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      max="3"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      hint="Add each dependent you are claiming on this application"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      error="At least one dependent must be listed"
      required
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      disabled
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const MultipleFields: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
    >
      <civ-text-input label="First name" name="firstName"></civ-text-input>
      <civ-text-input label="Last name" name="lastName"></civ-text-input>
    </civ-repeater>
  `,
};
