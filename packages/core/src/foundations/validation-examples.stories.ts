import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';
import '@civui/actions';
import '@civui/form-patterns';

const meta: Meta = {
  title: 'Foundations/Validation',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const DeclarativeValidation: Story = {
  name: 'Declarative Validation',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-form-field label="Email" required hint="We'll send your confirmation here">
        <civ-text-input name="email" validate="email" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Social Security number" required>
        <civ-text-input name="ssn" validate="ssn" required mask="ssn" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="ZIP code" required>
        <civ-text-input name="zip" validate="zip" required mask="zip" inputmode="numeric"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

export const FormValidation: Story = {
  name: 'Form-Level Validation',
  render: () => html`
    <civ-form
      @civ-submit="${(e: CustomEvent) => alert('Valid! ' + JSON.stringify(e.detail.formData))}"
      @civ-invalid="${() => {}}"
    >
      <civ-form-field label="Full name" required required-message="Enter your full name">
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email" required>
        <civ-text-input name="email" type="email" required validate="email"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone" hint="US phone number">
        <civ-text-input name="phone" type="tel" validate="phone"></civ-text-input>
      </civ-form-field>

      <civ-button type="submit" label="Submit" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};
