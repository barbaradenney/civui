import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-ssn.js';

const meta: Meta = {
  title: 'Inputs/SSN',
  component: 'civ-ssn',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Full SSN',
  render: () => html`<civ-ssn name="ssn" required></civ-ssn>`,
};

export const Last4: Story = {
  name: 'Last 4 Digits',
  render: () => html`<civ-ssn name="ssn" mode="last4" required></civ-ssn>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-ssn name="ssn" error="Enter a valid Social Security number"></civ-ssn>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-ssn name="ssn" label="Veteran's Social Security number" required></civ-ssn>`,
};

export const Disabled: Story = {
  render: () => html`<civ-ssn name="ssn" value="123456789" disabled></civ-ssn>`,
};
