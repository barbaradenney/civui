import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-marital-status.js';

const meta: Meta = {
  title: 'Inputs/Marital Status',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for marital status using standard federal
government form categories.

**Options:** Never married, Married, Separated, Divorced, Widowed.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Default',
  render: () => html`
    <civ-form-field label="Marital status" required>
      <civ-marital-status name="maritalStatus" required></civ-marital-status>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Marital status">
      <civ-marital-status name="maritalStatus" value="married"></civ-marital-status>
    </civ-form-field>
  `,
};
