import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-us-state.js';

const meta: Meta = {
  title: 'Inputs/US State',
  component: 'civ-us-state',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'States + DC',
  render: () => html`<civ-us-state name="state" required></civ-us-state>`,
};

export const WithTerritories: Story = {
  name: 'States + DC + Territories',
  render: () => html`<civ-us-state name="state" include-territories required></civ-us-state>`,
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-us-state name="state" label="State of residence" required></civ-us-state>`,
};

export const WithError: Story = {
  name: 'With Error',
  render: () => html`<civ-us-state name="state" error="Select a state"></civ-us-state>`,
};
