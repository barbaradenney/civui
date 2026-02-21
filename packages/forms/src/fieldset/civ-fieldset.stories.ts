import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-fieldset.js';
import '../text-input/civ-text-input.js';

const meta: Meta = {
  title: 'Forms/Fieldset',
  component: 'civ-fieldset',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-fieldset legend="Personal information">
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
