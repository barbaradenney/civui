import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-link.js';

const meta: Meta = {
  title: 'UI/Link',
  component: 'civ-link',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    href: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    danger: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Learn more',
    href: '#',
    variant: 'tertiary',
    danger: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-link
      label="${args.label}"
      href="${args.href}"
      variant="${args.variant}"
      ?danger="${args.danger}"
      ?disabled="${args.disabled}"
    ></civ-link>
  `,
};

export const Variants: Story = {
  name: 'Link Variants',
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <civ-link href="#" variant="primary">Primary link</civ-link>
      <civ-link href="#" variant="secondary">Secondary link</civ-link>
      <civ-link href="#" variant="tertiary">Tertiary link</civ-link>
    </div>
  `,
};

export const DangerVariants: Story = {
  name: 'Danger Variants',
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <civ-link href="#" variant="primary" danger>Delete account</civ-link>
      <civ-link href="#" variant="secondary" danger>Remove item</civ-link>
      <civ-link href="#" variant="tertiary" danger>Cancel</civ-link>
    </div>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary">Primary</civ-link>
          <civ-link href="#" variant="secondary">Secondary</civ-link>
          <civ-link href="#" variant="tertiary">Tertiary</civ-link>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Danger</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary" danger>Primary</civ-link>
          <civ-link href="#" variant="secondary" danger>Secondary</civ-link>
          <civ-link href="#" variant="tertiary" danger>Tertiary</civ-link>
        </div>
      </div>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <civ-link href="#" variant="primary" disabled>Disabled primary</civ-link>
      <civ-link href="#" variant="secondary" disabled>Disabled secondary</civ-link>
      <civ-link href="#" variant="tertiary" disabled>Disabled tertiary</civ-link>
    </div>
  `,
};

export const InContext: Story = {
  name: 'In Context',
  render: () => html`
    <p>
      You can <civ-link href="#">view your claim status</civ-link> online.
      If you need help, <civ-link href="#" variant="secondary">contact us</civ-link>.
    </p>
  `,
};
