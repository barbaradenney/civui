import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-text-input label="Phone number" name="phone" mask="phone-us" type="tel"></civ-text-input>
      <civ-text-input label="Social Security number" name="ssn" mask="ssn" type="tel"></civ-text-input>
      <civ-text-input label="ZIP code" name="zip" mask="zip" inputmode="numeric"></civ-text-input>
      <civ-text-input label="ZIP+4" name="zip4" mask="zip4" inputmode="numeric"></civ-text-input>
      <civ-text-input label="EIN" name="ein" mask="ein" type="tel"></civ-text-input>
      <civ-text-input label="Annual income" name="income" mask="currency" inputmode="numeric"></civ-text-input>
    </div>
  `,
};

export const CustomPatterns: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-text-input label="Case number" name="case" hint="For example: AB-1234" mask-pattern="AA-####"></civ-text-input>
      <civ-text-input label="License plate" name="plate" hint="For example: ABC-1234" mask-pattern="AAA-####"></civ-text-input>
    </div>
  `,
};

export const MaskModes: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4 civ-max-w-lg">
      <civ-text-input label="Phone (blur mode — default)" name="phone1" hint="Type freely, formatted on blur" mask="phone-us" type="tel"></civ-text-input>
      <civ-text-input label="Phone (live mode)" name="phone2" hint="Formatted as you type" mask="phone-us" mask-mode="live" type="tel"></civ-text-input>
    </div>
  `,
};
