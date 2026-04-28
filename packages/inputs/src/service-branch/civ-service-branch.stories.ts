import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-service-branch.js';

const meta: Meta = {
  title: 'Inputs/Service Branch',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Pre-populated select for US military branches of service.

**Tiers:**
- **Default** — 6 active branches (Army, Navy, Air Force, Marine Corps, Coast Guard, Space Force)
- **\`show-reserve\`** — adds 7 reserve and National Guard components
- **\`show-historical\`** — adds 5 historical branches (Army Air Corps, WAC, NOAA Corps, USPHS)

Use the tier props to match your form's requirements. VA disability forms
typically need all tiers; simple contact forms may only need active branches.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const ActiveBranches: Story = {
  name: 'Active Branches (Default)',
  render: () => html`
    <civ-form-field label="Branch of service" required>
      <civ-service-branch name="branch" required></civ-service-branch>
    </civ-form-field>
  `,
};

export const WithReserve: Story = {
  name: 'With Reserve & National Guard',
  render: () => html`
    <civ-form-field label="Branch of service" hint="Include reserve and National Guard" required>
      <civ-service-branch name="branch" show-reserve required></civ-service-branch>
    </civ-form-field>
  `,
};

export const WithHistorical: Story = {
  name: 'With Historical Branches',
  render: () => html`
    <civ-form-field label="Branch of service" hint="For veteran records and disability claims" required>
      <civ-service-branch name="branch" show-historical required></civ-service-branch>
    </civ-form-field>
  `,
};

export const AllTiers: Story = {
  name: 'All Tiers (VA Disability)',
  render: () => html`
    <civ-form-field label="Branch of service" hint="Select the branch you served in" required>
      <civ-service-branch name="branch" show-reserve show-historical required></civ-service-branch>
    </civ-form-field>
  `,
};

export const WithPreselectedValue: Story = {
  name: 'Pre-selected Value',
  render: () => html`
    <civ-form-field label="Branch of service">
      <civ-service-branch name="branch" value="marine-corps"></civ-service-branch>
    </civ-form-field>
  `,
};
