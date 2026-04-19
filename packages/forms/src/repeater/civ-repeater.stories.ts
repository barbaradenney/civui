import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-repeater.js';
import '../text-input/civ-text-input.js';
import '../date-input/civ-memorable-date.js';
import '../select/civ-select.js';

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

export const ServicePeriods: Story = {
  name: 'Service Periods (Detail Mode)',
  render: () => html`
    <civ-repeater
      legend="Service periods"
      name="servicePeriods"
      item-label="service period"
      mode="detail"
      min="1"
      max="10"
      hint="Add each period of service separately"
    >
      <civ-text-input label="Branch of service" name="branch" required></civ-text-input>
      <civ-memorable-date legend="Service start date" name="startDate" required hint="Enter your best estimate if unsure"></civ-memorable-date>
      <civ-memorable-date legend="Service end date" name="endDate" required></civ-memorable-date>
      <civ-select label="Character of service" name="discharge" required></civ-select>
    </civ-repeater>
  `,
  play: async ({ canvasElement }) => {
    const selects = canvasElement.querySelectorAll('civ-select') as NodeListOf<any>;
    const options = [
      { value: 'honorable', label: 'Honorable' },
      { value: 'general', label: 'General (under honorable conditions)' },
      { value: 'other', label: 'Other than honorable' },
    ];
    selects.forEach(s => { s.options = options; });
  },
};

export const PhoneNumbers: Story = {
  name: 'Additional Phone Numbers (Inline)',
  render: () => html`
    <civ-repeater
      legend="Additional phone numbers"
      name="phones"
      item-label="phone number"
      min="0"
      max="5"
    >
      <civ-text-input label="Phone number" name="phone" type="tel" mask="phone-us" validate="phone"></civ-text-input>
      <civ-text-input label="Label" name="phoneLabel" hint="For example: Work, Partner"></civ-text-input>
    </civ-repeater>
  `,
};
