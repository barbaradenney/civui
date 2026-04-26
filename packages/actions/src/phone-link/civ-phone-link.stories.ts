import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-phone-link.js';

const meta: Meta = {
  title: 'Actions/Phone Link',
  component: 'civ-phone-link',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Auto-Formatted',
  render: () => html`<civ-phone-link number="8005551234"></civ-phone-link>`,
};

export const WithLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-phone-link number="8005551234" label="Call the help desk"></civ-phone-link>`,
};

export const International: Story = {
  render: () => html`<civ-phone-link number="+44 20 7946 0958"></civ-phone-link>`,
};
