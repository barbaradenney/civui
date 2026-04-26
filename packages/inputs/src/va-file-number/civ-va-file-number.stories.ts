import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-va-file-number.js';

const meta: Meta = {
  title: 'Inputs/VA File Number',
  component: 'civ-va-file-number',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-va-file-number name="vaFile" required></civ-va-file-number>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-va-file-number name="vaFile" label="Sponsor's VA file number" required></civ-va-file-number>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-va-file-number name="vaFile" error="Enter a valid VA file number (8 or 9 digits)"></civ-va-file-number>`,
};

export const Disabled: Story = {
  render: () => html`<civ-va-file-number name="vaFile" value="123456789" disabled></civ-va-file-number>`,
};
