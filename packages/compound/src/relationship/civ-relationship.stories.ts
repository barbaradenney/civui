import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-relationship.js';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Forms/Compound/Relationship',
  component: 'civ-relationship',
  tags: ['autodocs'],
  argTypes: {
    preset: {
      control: 'select',
      options: ['general', 'va-dependent', 'va-survivor', 'ssa-survivor', 'immigration', 'tax'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    preset: 'general',
  },
  render: (args) => html`
    <civ-relationship
      legend="About the dependent"
      name="dependent"
      preset="${args.preset}"
    ></civ-relationship>
  `,
};

export const VADependent: Story = {
  name: 'VA Dependent (21-686c)',
  render: () => html`
    <civ-relationship
      legend="About the dependent"
      name="dependent"
      preset="va-dependent"
      show-adoption-date
    ></civ-relationship>
  `,
};

export const VASurvivor: Story = {
  name: 'VA Survivor (21P-530)',
  render: () => html`
    <civ-relationship
      legend="About the person who died"
      name="deceased"
      preset="va-survivor"
      deceased-assumed
    ></civ-relationship>
  `,
};

export const SSASurvivor: Story = {
  name: 'SSA Survivor Benefits',
  render: () => html`
    <civ-relationship
      legend="About the deceased worker"
      name="deceased"
      preset="ssa-survivor"
      deceased-assumed
      show-divorce-date
    ></civ-relationship>
  `,
};

export const Immigration: Story = {
  name: 'Immigration (I-130)',
  render: () => html`
    <civ-relationship
      legend="About the person you are petitioning for"
      name="beneficiary"
      preset="immigration"
      show-adoption-date
    ></civ-relationship>
  `,
};

export const Tax: Story = {
  name: 'Tax Filing (1040)',
  render: () => html`
    <civ-relationship
      legend="Dependent information"
      name="dependent"
      preset="tax"
    ></civ-relationship>
  `,
};

export const WithoutName: Story = {
  name: 'Without Name Fields',
  render: () => html`
    <civ-relationship
      legend="Relationship to veteran"
      name="rel"
      preset="va-survivor"
      show-name="false"
    ></civ-relationship>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-relationship
      legend="About the spouse"
      name="spouse"
      preset="general"
      required
    ></civ-relationship>
  `,
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => html`
    <civ-relationship
      legend="About the dependent"
      name="dep"
      preset="general"
      required
      name-error="Enter the person's name"
      relationship-error="Select a relationship"
    ></civ-relationship>
  `,
};

export const AllPresets: Story = {
  name: 'All Presets',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <p class="civ-font-semibold civ-mb-2">General</p>
        <civ-relationship legend="Person" name="gen" preset="general"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">VA Dependent</p>
        <civ-relationship legend="Dependent" name="va-dep" preset="va-dependent"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">VA Survivor</p>
        <civ-relationship legend="Deceased" name="va-surv" preset="va-survivor"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">SSA Survivor</p>
        <civ-relationship legend="Deceased worker" name="ssa" preset="ssa-survivor"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Immigration</p>
        <civ-relationship legend="Beneficiary" name="imm" preset="immigration"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Tax</p>
        <civ-relationship legend="Dependent" name="tax" preset="tax"></civ-relationship>
      </div>
    </div>
  `,
};
