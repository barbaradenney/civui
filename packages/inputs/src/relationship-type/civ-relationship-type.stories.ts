import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-relationship-type.js';

const meta: Meta = {
  title: 'Inputs/Relationship Type',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for relationship types with context-specific presets.

**Presets:**
- **\`general\`** (default) — Spouse, Child, Parent, Sibling, Other
- **\`va-dependent\`** — Spouse, Biological child, Adopted child, Stepchild, Parent
- **\`va-survivor\`** — Surviving spouse, Surviving child, Surviving parent, Executor of estate, Funeral director

Use the \`preset\` attribute to match your form's context.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const General: Story = {
  name: 'General (Default)',
  render: () => html`
    <civ-form-field label="Relationship" required>
      <civ-relationship-type name="relationship" required></civ-relationship-type>
    </civ-form-field>
  `,
};

export const VaDependent: Story = {
  name: 'VA Dependent',
  render: () => html`
    <civ-form-field label="Relationship to Veteran" hint="Select the dependent's relationship" required>
      <civ-relationship-type name="relationship" preset="va-dependent" required></civ-relationship-type>
    </civ-form-field>
  `,
};

export const VaSurvivor: Story = {
  name: 'VA Survivor',
  render: () => html`
    <civ-form-field label="Relationship to Veteran" hint="For survivor benefit claims" required>
      <civ-relationship-type name="relationship" preset="va-survivor" required></civ-relationship-type>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Relationship">
      <civ-relationship-type name="relationship" value="spouse"></civ-relationship-type>
    </civ-form-field>
  `,
};
