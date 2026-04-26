import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-zip.js';

const meta: Meta = {
  title: 'Inputs/ZIP Code',
  component: 'civ-zip',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: '5-Digit ZIP',
  render: () => html`<civ-zip name="zip" required></civ-zip>`,
};

export const Extended: Story = {
  name: 'ZIP+4',
  render: () => html`<civ-zip name="zip" extended required></civ-zip>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-zip name="zip" error="Enter a valid ZIP code"></civ-zip>`,
};
