import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-button.js';

const meta: Meta = {
  title: 'UI/Button',
  component: 'civ-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger', 'unstyled'],
    },
    size: {
      control: 'select',
      options: ['default', 'big'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    disabled: { control: 'boolean' },
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-button>Default button</civ-button>`,
};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button variant="primary">Primary</civ-button>
      <civ-button variant="secondary">Secondary</civ-button>
      <civ-button variant="outline">Outline</civ-button>
      <civ-button variant="danger">Danger</civ-button>
      <civ-button variant="unstyled">Unstyled</civ-button>
    </div>
  `,
};

export const BigSize: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button size="big">Big primary</civ-button>
      <civ-button variant="secondary" size="big">Big secondary</civ-button>
      <civ-button variant="outline" size="big">Big outline</civ-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button disabled>Disabled primary</civ-button>
      <civ-button variant="secondary" disabled>Disabled secondary</civ-button>
      <civ-button variant="danger" disabled>Disabled danger</civ-button>
    </div>
  `,
};

export const AsLink: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <civ-button href="/dashboard">Go to dashboard</civ-button>
      <civ-button href="/login" variant="outline">Sign in</civ-button>
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
        <civ-button type="reset" variant="outline">Reset</civ-button>
        <civ-button variant="secondary">Cancel</civ-button>
      </div>
    </form>
  `,
};
