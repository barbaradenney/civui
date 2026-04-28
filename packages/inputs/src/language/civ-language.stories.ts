import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-language.js';

const meta: Meta = {
  title: 'Inputs/Language',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for preferred language, using common languages
for US government services ordered by frequency of use.

**Options:** English, Spanish, Chinese, Tagalog, Vietnamese, Arabic,
French, Korean, Russian, Portuguese, Haitian Creole, German, Japanese,
Hindi, Other.
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
    <civ-form-field label="Preferred language" required>
      <civ-language name="language" required></civ-language>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Preferred language">
      <civ-language name="language" value="es"></civ-language>
    </civ-form-field>
  `,
};
