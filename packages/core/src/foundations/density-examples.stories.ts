import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs';


const meta: Meta = {
  title: 'Foundations/Density Examples',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SpacousScale: Story = {
  name: 'Spacious Scale',
  render: () => html`
    <div data-civ-scale="spacious">
      <h2 class="civ-heading-lg">Welcome to the Department of Labor</h2>
      <p class="civ-text-body civ-mb-4">Find resources, file claims, and access services.</p>
      <civ-form-field label="Search" hint="Enter a keyword or topic">
        <civ-text-input name="search"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

export const DefaultScale: Story = {
  name: 'Default Scale',
  render: () => html`
    <div>
      <h2 class="civ-heading-lg">Apply for benefits</h2>
      <p class="civ-text-body civ-mb-4">Complete the form below to apply.</p>
      <civ-form-field label="Full name" required>
        <civ-text-input name="name" required></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Email">
        <civ-text-input name="email" type="email" class="civ-mt-4"></civ-text-input>
      </civ-form-field>
    </div>
  `,
};

export const DenseScale: Story = {
  name: 'Dense Scale',
  render: () => html`
    <div data-civ-scale="dense">
      <h2 class="civ-heading-lg">Case dashboard</h2>
      <p class="civ-text-body civ-mb-4">Review and manage active cases.</p>
      <div class="civ-flex civ-gap-4">
        <civ-form-field label="Case ID">
          <civ-text-input name="caseId" width="sm"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Claimant">
          <civ-text-input name="claimant" width="sm"></civ-text-input>
        </civ-form-field>
      </div>
    </div>
  `,
};

export const SideBySide: Story = {
  name: 'All Scales Compared',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div data-civ-scale="spacious">
        <p class="civ-text-caption civ-mb-2">Spacious (1.5x spacing)</p>
        <civ-form-field label="Full name" hint="Public-facing, large touch targets">
          <civ-text-input name="spacious"></civ-text-input>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-text-caption civ-mb-2">Default (1x spacing)</p>
        <civ-form-field label="Full name" hint="Standard forms and applications">
          <civ-text-input name="default"></civ-text-input>
        </civ-form-field>
      </div>
      <div data-civ-scale="dense">
        <p class="civ-text-caption civ-mb-2">Dense (0.75x spacing)</p>
        <civ-form-field label="Full name" hint="Dashboards and admin panels">
          <civ-text-input name="dense"></civ-text-input>
        </civ-form-field>
      </div>
    </div>
  `,
};
