import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-email.js';

const meta: Meta = {
  title: 'Inputs/Email',
  component: 'civ-email',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-email name="email" required></civ-email>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-email name="email" label="Work email address"></civ-email>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-email name="email" error="Enter a valid email address"></civ-email>`,
};
