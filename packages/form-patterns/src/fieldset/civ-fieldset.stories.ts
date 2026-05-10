import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-fieldset.js';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Form/Fieldset',
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
      <civ-form-field label="First name">
        <civ-text-input name="first-name"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Last name">
        <civ-text-input name="last-name"></civ-text-input>
      </civ-form-field>
    </civ-fieldset>
  `,
};

export const WithHintAndError: Story = {
  render: () => html`
    <civ-fieldset legend="Address" hint="Enter your mailing address" error="Address is incomplete" required>
      <civ-form-field label="Street">
        <civ-text-input name="street"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="City">
        <civ-text-input name="city"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="ZIP">
        <civ-text-input name="zip" width="sm"></civ-text-input>
      </civ-form-field>
    </civ-fieldset>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-fieldset legend="Spouse information" disabled>
      <civ-form-field label="First name" disabled>
        <civ-text-input name="spouse-first" disabled></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Last name" disabled>
        <civ-text-input name="spouse-last" disabled></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Date of birth" hint="For example: 01/15/1990" disabled>
        <civ-text-input name="spouse-dob" disabled></civ-text-input>
      </civ-form-field>
    </civ-fieldset>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-fieldset legend="Emergency contact" required>
      <civ-form-field label="Contact name">
        <civ-text-input name="emergency-name"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone number" hint="For example: (555) 123-4567">
        <civ-text-input name="emergency-phone"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Relationship">
        <civ-text-input name="emergency-relationship"></civ-text-input>
      </civ-form-field>
    </civ-fieldset>
  `,
};

export const Nested: Story = {
  render: () => html`
    <civ-fieldset legend="Household members">
      <civ-fieldset legend="Primary applicant" required>
        <civ-form-field label="First name">
          <civ-text-input name="primary-first"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Last name">
          <civ-text-input name="primary-last"></civ-text-input>
        </civ-form-field>
      </civ-fieldset>

      <civ-fieldset legend="Secondary applicant">
        <civ-form-field label="First name">
          <civ-text-input name="secondary-first"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Last name">
          <civ-text-input name="secondary-last"></civ-text-input>
        </civ-form-field>
      </civ-fieldset>
    </civ-fieldset>
  `,
};
