import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import './civ-form-fieldset.js';

const meta: Meta = {
  title: 'Forms/Form/FormFieldset',
  component: 'civ-form-fieldset',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: 'select',
      options: [undefined, 'sm', 'md', 'lg', 'xl'],
    },
    headingLevel: {
      control: 'select',
      options: [undefined, 1, 2, 3, 4, 5, 6],
    },
    tightHint: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Mailing address',
  },
  render: (args) => html`
    <civ-form-fieldset
      legend="${args.legend}"
      hint="${args.hint ?? ''}"
      error="${args.error ?? ''}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      .size="${args.size as any}"
      .headingLevel="${args.headingLevel as any}"
      ?tight-hint="${args.tightHint}"
    >
      <civ-text-input label="Street" name="street" required></civ-text-input>
      <civ-text-input label="City" name="city" required></civ-text-input>
      <civ-text-input label="State" name="state" required></civ-text-input>
      <civ-text-input label="ZIP" name="zip" required></civ-text-input>
    </civ-form-fieldset>
  `,
};

export const WithHint: Story = {
  args: {
    legend: 'Mailing address',
    hint: 'We use this address for all official correspondence.',
  },
  render: Default.render,
};

export const WithError: Story = {
  args: {
    legend: 'Mailing address',
    error: 'Enter a complete mailing address.',
  },
  render: Default.render,
};

export const Required: Story = {
  args: {
    legend: 'Mailing address',
    required: true,
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    legend: 'Mailing address',
    disabled: true,
  },
  render: Default.render,
};

export const PromotedHeading: Story = {
  name: 'Promoted to heading (level 2)',
  args: {
    legend: 'Mailing address',
    headingLevel: 2,
    size: 'lg',
  },
  render: Default.render,
};
