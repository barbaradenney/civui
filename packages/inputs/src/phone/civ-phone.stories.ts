import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-phone.js';

const meta: Meta = {
  title: 'Inputs/Phone',
  component: 'civ-phone',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'US Phone',
  render: () => html`<civ-phone name="phone" required></civ-phone>`,
};

export const International: Story = {
  name: 'International',
  render: () => html`<civ-phone name="phone" international required></civ-phone>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-phone name="phone" label="Mobile number"></civ-phone>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-phone name="phone" error="Enter a valid phone number"></civ-phone>`,
};
