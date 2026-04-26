import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-routing-number.js';

const meta: Meta = {
  title: 'Inputs/Routing Number',
  component: 'civ-routing-number',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-routing-number name="routing" required></civ-routing-number>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-routing-number name="routing" error="Enter a valid 9-digit routing number"></civ-routing-number>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-routing-number name="routing" label="Bank routing number" required></civ-routing-number>`,
};
