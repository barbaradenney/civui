import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-button.js';

const meta: Meta = {
  title: 'UI/Button',
  component: 'civ-button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    danger: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit'],
    },
    disabled: { control: 'boolean' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Continue',
    variant: 'primary',
    type: 'button',
    disabled: false,
    danger: false,
  },
  render: (args) => html`
    <civ-button
      label="${args.label}"
      variant="${args.variant}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?danger="${args.danger}"
    ></civ-button>
  `,
};

export const Primary: Story = {
  render: () => html`
    <civ-button variant="primary">Submit application</civ-button>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <civ-button variant="secondary">Save and continue later</civ-button>
  `,
};

export const Tertiary: Story = {
  render: () => html`
    <civ-button variant="tertiary">Cancel</civ-button>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Standard</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button variant="primary">Primary</civ-button>
          <civ-button variant="secondary">Secondary</civ-button>
          <civ-button variant="tertiary">Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Danger</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button variant="primary" danger>Primary</civ-button>
          <civ-button variant="secondary" danger>Secondary</civ-button>
          <civ-button variant="tertiary" danger>Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button variant="primary" disabled>Primary</civ-button>
          <civ-button variant="secondary" disabled>Secondary</civ-button>
          <civ-button variant="tertiary" disabled>Tertiary</civ-button>
        </div>
      </div>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button variant="primary" danger>Delete account</civ-button>
      <civ-button variant="secondary" danger>Remove dependent</civ-button>
      <civ-button variant="tertiary" danger>Cancel claim</civ-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button disabled>Disabled primary</civ-button>
      <civ-button variant="secondary" disabled>Disabled secondary</civ-button>
      <civ-button variant="tertiary" disabled>Disabled tertiary</civ-button>
      <civ-button variant="primary" danger disabled>Disabled danger</civ-button>
    </div>
  `,
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => html`
    <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
      <civ-button icon-start="download">Download</civ-button>
      <civ-button icon-end="arrow-right" variant="primary">Continue</civ-button>
      <civ-button icon-start="edit" variant="secondary">Edit</civ-button>
      <civ-button icon-start="print" icon-end="external-link" variant="tertiary">Print form</civ-button>
      <civ-button icon-start="trash" variant="primary" danger>Delete</civ-button>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button variant="primary">Submit</civ-button>
          <civ-button variant="secondary">Save</civ-button>
          <civ-button variant="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button variant="primary">Submit</civ-button>
          <civ-button variant="secondary">Save</civ-button>
          <civ-button variant="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button variant="primary">Submit</civ-button>
          <civ-button variant="secondary">Save</civ-button>
          <civ-button variant="tertiary">Cancel</civ-button>
        </div>
      </div>
    </div>
  `,
};

export const FormActions: Story = {
  name: 'Form Actions',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        alert('Form submitted!');
      }}"
    >
      <p class="civ-mb-4">Complete your VA benefits application and submit for review.</p>
      <div class="civ-flex civ-gap-3">
        <civ-button type="submit">Submit application</civ-button>
        <civ-button variant="secondary">Save and continue later</civ-button>
        <civ-button variant="tertiary">Cancel</civ-button>
      </div>
    </form>
  `,
};

export const ClaimActions: Story = {
  name: 'Claim Actions',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Upload evidence</p>
        <div class="civ-flex civ-gap-3">
          <civ-button variant="primary">Upload documents</civ-button>
          <civ-button variant="tertiary">Skip for now</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Manage dependents</p>
        <div class="civ-flex civ-gap-3">
          <civ-button variant="secondary">Add dependent</civ-button>
          <civ-button variant="tertiary" danger>Remove dependent</civ-button>
        </div>
      </div>
    </div>
  `,
};
