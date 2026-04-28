import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-discharge-type.js';

const meta: Meta = {
  title: 'Inputs/Discharge Type',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for US military discharge types.

**Options:** Honorable, General (under honorable conditions), Other than honorable,
Bad conduct, Dishonorable, Uncharacterized.

Used on veteran benefit and disability claim forms.
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
    <civ-form-field label="Type of discharge" required>
      <civ-discharge-type name="discharge" required></civ-discharge-type>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Type of discharge">
      <civ-discharge-type name="discharge" value="honorable"></civ-discharge-type>
    </civ-form-field>
  `,
};
