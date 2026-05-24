import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-relationship.js';
import '@civui/inputs';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Compound/Relationship',
  component: 'civ-relationship',
  tags: ['autodocs'],
  argTypes: {
    preset: {
      control: 'select',
      options: ['general', 'dependent', 'survivor', 'benefits-survivor', 'immigration', 'tax'],
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
      size="lg" legend="About the dependent"
      name="dependent"
      preset="${args.preset}"
    ></civ-relationship>
  `,
};

export const Dependent: Story = {
  render: () => html`
    <civ-relationship
      size="lg" legend="About the dependent"
      name="dependent"
      preset="dependent"
      show-adoption-date
    ></civ-relationship>
  `,
};

export const Survivor: Story = {
  render: () => html`
    <civ-relationship
      size="lg" legend="About the person who died"
      name="deceased"
      preset="survivor"
      deceased-assumed
    ></civ-relationship>
  `,
};

export const BenefitsSurvivor: Story = {
  name: 'Survivor (Benefits)',
  render: () => html`
    <civ-relationship
      size="lg" legend="About the deceased worker"
      name="deceased"
      preset="benefits-survivor"
      deceased-assumed
      show-divorce-date
    ></civ-relationship>
  `,
};

export const Immigration: Story = {
  render: () => html`
    <civ-relationship
      size="lg" legend="About the person you are petitioning for"
      name="beneficiary"
      preset="immigration"
      show-adoption-date
    ></civ-relationship>
  `,
};

export const Tax: Story = {
  name: 'Tax Filing',
  render: () => html`
    <civ-relationship
      size="lg" legend="Dependent information"
      name="dependent"
      preset="tax"
    ></civ-relationship>
  `,
};

export const WithoutName: Story = {
  name: 'Without Name Fields',
  render: () => html`
    <civ-relationship
      size="lg" legend="Relationship to veteran"
      name="rel"
      preset="survivor"
      show-name="false"
    ></civ-relationship>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-relationship
      size="lg" legend="About the spouse"
      name="spouse"
      preset="general"
      required
    ></civ-relationship>
  `,
};

export const WithErrors: Story = {
  render: () => html`
    <civ-relationship
      size="lg" legend="About the dependent"
      name="dep"
      preset="general"
      required
      first-error="Enter the dependent's first name"
      last-error="Enter the dependent's last name"
      relationship-error="Select a relationship"
    ></civ-relationship>
  `,
};

export const AllPresets: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <p class="civ-font-semibold civ-mb-2">General</p>
        <civ-relationship legend="Person" size="lg" name="gen" preset="general"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Dependent</p>
        <civ-relationship legend="Dependent" size="lg" name="dep" preset="dependent"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Survivor</p>
        <civ-relationship legend="Deceased" size="lg" name="surv" preset="survivor"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Benefits Survivor</p>
        <civ-relationship legend="Deceased worker" size="lg" name="ben-surv" preset="benefits-survivor"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Immigration</p>
        <civ-relationship legend="Beneficiary" size="lg" name="imm" preset="immigration"></civ-relationship>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Tax</p>
        <civ-relationship legend="Dependent" size="lg" name="tax" preset="tax"></civ-relationship>
      </div>
    </div>
  `,
};
