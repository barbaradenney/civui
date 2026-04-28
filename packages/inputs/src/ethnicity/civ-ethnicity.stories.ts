import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-ethnicity.js';

const meta: Meta = {
  title: 'Inputs/Ethnicity',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for ethnicity using OMB (Office of Management
and Budget) categories required on federal forms.

**Options:** Hispanic or Latino, Not Hispanic or Latino, Prefer not to answer.
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
    <civ-form-field label="Ethnicity" required>
      <civ-ethnicity name="ethnicity" required></civ-ethnicity>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Ethnicity">
      <civ-ethnicity name="ethnicity" value="not-hispanic-latino"></civ-ethnicity>
    </civ-form-field>
  `,
};
