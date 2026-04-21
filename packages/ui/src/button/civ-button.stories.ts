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
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Standard</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <civ-button variant="primary">Primary</civ-button>
          <civ-button variant="secondary">Secondary</civ-button>
          <civ-button variant="tertiary">Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Danger</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <civ-button variant="primary" danger>Primary</civ-button>
          <civ-button variant="secondary" danger>Secondary</civ-button>
          <civ-button variant="tertiary" danger>Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Disabled</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
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
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button variant="primary" danger>Delete account</civ-button>
      <civ-button variant="secondary" danger>Remove dependent</civ-button>
      <civ-button variant="tertiary" danger>Cancel claim</civ-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button disabled>Disabled primary</civ-button>
      <civ-button variant="secondary" disabled>Disabled secondary</civ-button>
      <civ-button variant="tertiary" disabled>Disabled tertiary</civ-button>
      <civ-button variant="primary" danger disabled>Disabled danger</civ-button>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <civ-button variant="primary">Submit</civ-button>
          <civ-button variant="secondary">Save</civ-button>
          <civ-button variant="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <civ-button variant="primary">Submit</civ-button>
          <civ-button variant="secondary">Save</civ-button>
          <civ-button variant="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
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
      <p style="margin-bottom: 16px;">Complete your VA benefits application and submit for review.</p>
      <div style="display: flex; gap: 12px;">
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
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Upload evidence</p>
        <div style="display: flex; gap: 12px;">
          <civ-button variant="primary">Upload documents</civ-button>
          <civ-button variant="tertiary">Skip for now</civ-button>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Manage dependents</p>
        <div style="display: flex; gap: 12px;">
          <civ-button variant="secondary">Add dependent</civ-button>
          <civ-button variant="tertiary" danger>Remove dependent</civ-button>
        </div>
      </div>
    </div>
  `,
};
