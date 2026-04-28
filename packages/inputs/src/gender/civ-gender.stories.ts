import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-gender.js';

const meta: Meta = {
  title: 'Inputs/Gender',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for gender using categories common across
government forms.

**Standard format (default):** Male, Female, Non-binary, Prefer not to answer, Other.

**Binary format (\`format="binary"\`):** Male, Female only — for forms that require it.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Standard: Story = {
  name: 'Standard (Default)',
  render: () => html`
    <civ-form-field label="Gender" required>
      <civ-gender name="gender" required></civ-gender>
    </civ-form-field>
  `,
};

export const Binary: Story = {
  name: 'Binary Format',
  render: () => html`
    <civ-form-field label="Gender" required>
      <civ-gender name="gender" format="binary" required></civ-gender>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Gender">
      <civ-gender name="gender" value="non-binary"></civ-gender>
    </civ-form-field>
  `,
};
