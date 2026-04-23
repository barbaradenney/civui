import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-fieldset.js';
import '../text-input/civ-text-input.js';

const meta: Meta = {
  title: 'Forms/Layout/Fieldset',
  component: 'civ-fieldset',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Personal information',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-fieldset
      legend="${args.legend}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-text-input label="First name" name="first-name"></civ-text-input>
      <civ-text-input label="Last name" name="last-name"></civ-text-input>
    </civ-fieldset>
  `,
};

export const WithHintAndError: Story = {
  render: () => html`
    <civ-fieldset legend="Address" hint="Enter your mailing address" error="Address is incomplete" required>
      <civ-text-input label="Street" name="street"></civ-text-input>
      <civ-text-input label="City" name="city"></civ-text-input>
      <civ-text-input label="ZIP" name="zip" width="sm"></civ-text-input>
    </civ-fieldset>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-fieldset legend="Spouse information" disabled>
      <civ-text-input label="First name" name="spouse-first"></civ-text-input>
      <civ-text-input label="Last name" name="spouse-last"></civ-text-input>
      <civ-text-input label="Date of birth" name="spouse-dob" hint="For example: 01/15/1990"></civ-text-input>
    </civ-fieldset>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-fieldset legend="Emergency contact" required>
      <civ-text-input label="Contact name" name="emergency-name"></civ-text-input>
      <civ-text-input label="Phone number" name="emergency-phone" hint="For example: (555) 123-4567"></civ-text-input>
      <civ-text-input label="Relationship" name="emergency-relationship"></civ-text-input>
    </civ-fieldset>
  `,
};

export const Nested: Story = {
  render: () => html`
    <civ-fieldset legend="Household members">
      <civ-fieldset legend="Primary applicant" required>
        <civ-text-input label="First name" name="primary-first"></civ-text-input>
        <civ-text-input label="Last name" name="primary-last"></civ-text-input>
      </civ-fieldset>

      <civ-fieldset legend="Secondary applicant">
        <civ-text-input label="First name" name="secondary-first"></civ-text-input>
        <civ-text-input label="Last name" name="secondary-last"></civ-text-input>
      </civ-fieldset>
    </civ-fieldset>
  `,
};
