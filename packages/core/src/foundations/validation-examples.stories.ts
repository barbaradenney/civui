import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-text-input label="Email" name="email" hint="We'll send your confirmation here" required validate="email"></civ-text-input>
      <civ-text-input label="Social Security number" name="ssn" required validate="ssn" mask="ssn" type="tel"></civ-text-input>
      <civ-text-input label="ZIP code" name="zip" required validate="zip" mask="zip" inputmode="numeric"></civ-text-input>
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
      <civ-text-input label="Full name" name="name" required required-message="Enter your full name"></civ-text-input>
      <civ-text-input label="Email" name="email" required type="email" validate="email"></civ-text-input>
      <civ-text-input label="Phone" name="phone" hint="US phone number" type="tel" validate="phone"></civ-text-input>

      <civ-button type="submit" label="Submit" class="civ-mt-4"></civ-button>
    </civ-form>
  `,
};
