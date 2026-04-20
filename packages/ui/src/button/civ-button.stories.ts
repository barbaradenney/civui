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
      options: ['primary', 'secondary', 'tertiary', 'danger'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit'],
    },
    disabled: { control: 'boolean' },
    href: { control: 'text' },
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
    href: '',
  },
  render: (args) => html`
    <civ-button
      label="${args.label}"
      variant="${args.variant}"
      type="${args.type}"
      href="${args.href || ''}"
      ?disabled="${args.disabled}"
    ></civ-button>
  `,
};

export const Buttons: Story = {
  name: 'Button Variants',
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button variant="primary">Primary</civ-button>
      <civ-button variant="secondary">Secondary</civ-button>
      <civ-button variant="tertiary">Tertiary</civ-button>
      <civ-button variant="danger">Danger</civ-button>
    </div>
  `,
};

export const Links: Story = {
  name: 'Link Variants',
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <civ-button href="#" variant="primary">Primary link</civ-button>
      <civ-button href="#" variant="secondary">Secondary link</civ-button>
      <civ-button href="#" variant="tertiary">Tertiary link</civ-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button disabled>Disabled primary</civ-button>
      <civ-button variant="secondary" disabled>Disabled secondary</civ-button>
      <civ-button variant="tertiary" disabled>Disabled tertiary</civ-button>
      <civ-button variant="danger" disabled>Disabled danger</civ-button>
    </div>
  `,
};

export const DisabledLinks: Story = {
  name: 'Disabled Links',
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <civ-button href="#" disabled>Disabled primary</civ-button>
      <civ-button href="#" variant="secondary" disabled>Disabled secondary</civ-button>
      <civ-button href="#" variant="tertiary" disabled>Disabled tertiary</civ-button>
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
