import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-fieldset.js';
import '../text-input/civds-text-input.js';

const meta: Meta = {
  title: 'Forms/Fieldset',
  component: 'civds-fieldset',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civds-fieldset legend="Personal information">
      <civds-text-input label="First name" name="first-name"></civds-text-input>
      <civds-text-input label="Last name" name="last-name"></civds-text-input>
    </civds-fieldset>
  `,
};

export const WithHintAndError: Story = {
  render: () => html`
    <civds-fieldset legend="Address" hint="Enter your mailing address" error="Address is incomplete" required>
      <civds-text-input label="Street" name="street"></civds-text-input>
      <civds-text-input label="City" name="city"></civds-text-input>
      <civds-text-input label="ZIP" name="zip" width="sm"></civds-text-input>
    </civds-fieldset>
  `,
};
