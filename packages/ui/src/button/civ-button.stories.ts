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
    label: 'Default button',
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

export const Variants: Story = {
  name: 'Button Variants',
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button variant="primary">Primary</civ-button>
      <civ-button variant="secondary">Secondary</civ-button>
      <civ-button variant="tertiary">Tertiary</civ-button>
    </div>
  `,
};

export const DangerVariants: Story = {
  name: 'Danger Variants',
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button variant="primary" danger>Delete account</civ-button>
      <civ-button variant="secondary" danger>Remove</civ-button>
      <civ-button variant="tertiary" danger>Cancel</civ-button>
    </div>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
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

export const InForm: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        alert('Form submitted!');
      }}"
    >
      <p style="margin-bottom: 16px;">Click Submit to trigger form submission.</p>
      <div style="display: flex; gap: 12px;">
        <civ-button type="submit">Submit</civ-button>
        <civ-button variant="tertiary">Cancel</civ-button>
      </div>
    </form>
  `,
};
