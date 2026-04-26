import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-currency.js';

const meta: Meta = {
  title: 'Inputs/Currency',
  component: 'civ-currency',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-currency name="amount" required></civ-currency>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-currency name="income" label="Monthly income" required></civ-currency>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-currency name="amount" error="Enter a valid dollar amount"></civ-currency>`,
};
