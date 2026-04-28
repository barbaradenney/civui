import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';

const meta: Meta = {
  title: 'Foundations/Input Masks',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const AllPresets: Story = {
  name: 'All Presets',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-form-field label="Phone number">
        <civ-text-input name="phone" mask="phone-us" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Social Security number">
        <civ-text-input name="ssn" mask="ssn" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="ZIP code">
        <civ-text-input name="zip" mask="zip" inputmode="numeric"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="ZIP+4">
        <civ-text-input name="zip4" mask="zip4" inputmode="numeric"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="EIN">
        <civ-text-input name="ein" mask="ein" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Annual income">
        <civ-text-input name="income" mask="currency" inputmode="numeric"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

export const CustomPatterns: Story = {
  name: 'Custom Patterns',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-form-field label="Case number" hint="For example: AB-1234">
        <civ-text-input name="case" mask-pattern="AA-####"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="License plate" hint="For example: ABC-1234">
        <civ-text-input name="plate" mask-pattern="AAA-####"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

export const MaskModes: Story = {
  name: 'Mask Modes',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-form-field label="Phone (blur mode — default)" hint="Type freely, formatted on blur">
        <civ-text-input name="phone1" mask="phone-us" type="tel"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Phone (live mode)" hint="Formatted as you type">
        <civ-text-input name="phone2" mask="phone-us" mask-mode="live" type="tel"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};
