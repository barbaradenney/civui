import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-suffix.js';

const meta: Meta = {
  title: 'Inputs/Suffix',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for name suffixes.

**Options:** Jr., Sr., II, III, IV, V.

Typically used alongside name fields in government forms.
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
    <civ-form-field label="Suffix">
      <civ-suffix name="suffix"></civ-suffix>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Suffix">
      <civ-suffix name="suffix" value="III"></civ-suffix>
    </civ-form-field>
  `,
};
