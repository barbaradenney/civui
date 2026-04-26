import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-country.js';

const meta: Meta = {
  title: 'Inputs/Country',
  component: 'civ-country',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'US First (Default)',
  render: () => html`<civ-country name="country" required></civ-country>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-country name="country" label="Country of birth" required></civ-country>`,
};

export const NorthAmericaOnly: Story = {
  name: 'North America Only',
  render: () => html`<civ-country name="country" include="US,CA,MX" required></civ-country>`,
};

export const WithExclusions: Story = {
  name: 'With Exclusions',
  render: () => html`<civ-country name="country" exclude="KP,IR,SY,CU" required></civ-country>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-country name="country" error="Select a country"></civ-country>`,
};
