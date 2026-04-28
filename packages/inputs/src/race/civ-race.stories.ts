import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-race.js';

const meta: Meta = {
  title: 'Inputs/Race',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated checkbox group for OMB (Office of Management and Budget)
race categories. Allows multiple selections — individuals may identify
with more than one race, as required on federal forms.

**Categories (OMB Standard):**
- American Indian or Alaska Native
- Asian
- Black or African American
- Native Hawaiian or Other Pacific Islander
- White
- Prefer not to answer

Value is a comma-separated string of selected values.
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
    <civ-form-fieldset legend="Race" hint="Select one or more" required>
      <civ-race name="race" required></civ-race>
    </civ-form-fieldset>
  `,
};

export const WithPreselected: Story = {
  name: 'Pre-selected Values',
  render: () => html`
    <civ-form-fieldset legend="Race" hint="Select one or more">
      <civ-race name="race" value="asian,white"></civ-race>
    </civ-form-fieldset>
  `,
};

export const WithEthnicity: Story = {
  name: 'With Ethnicity (Federal Form Pattern)',
  render: () => html`
    <div style="max-width: 640px;">
      <civ-form-field label="Ethnicity" required>
        <civ-select name="ethnicity" preset="ethnicity" required></civ-select>
      </civ-form-field>

      <civ-form-fieldset legend="Race" hint="Select one or more" required>
        <civ-race name="race" required></civ-race>
      </civ-form-fieldset>
    </div>
  `,
};
