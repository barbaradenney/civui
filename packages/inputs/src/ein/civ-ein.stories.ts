import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-ein.js';

const meta: Meta = {
  title: 'Inputs/EIN',
  component: 'civ-ein',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-ein name="ein" required></civ-ein>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-ein name="ein" error="Enter a valid Employer Identification Number"></civ-ein>`,
};
