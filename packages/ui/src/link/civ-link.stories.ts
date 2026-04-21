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
      options: ['primary', 'secondary', 'tertiary', 'back'],
    },
    danger: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Learn more about VA benefits',
    href: '#',
    variant: 'tertiary',
    disabled: false,
  },
  render: (args) => html`
    <civ-link
      label="${args.label}"
      href="${args.href}"
      variant="${args.variant}"
      ?disabled="${args.disabled}"
    ></civ-link>
  `,
};

export const Primary: Story = {
  render: () => html`
    <civ-link href="#" variant="primary">View your claim status</civ-link>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <civ-link href="#" variant="secondary">Download your benefit letter</civ-link>
  `,
};

export const Tertiary: Story = {
  render: () => html`
    <civ-link href="#" variant="tertiary">Learn more</civ-link>
  `,
};

export const Back: Story = {
  render: () => html`
    <civ-link href="#/hub" variant="back" label="Back to task list"></civ-link>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Standard</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary">Primary link</civ-link>
          <civ-link href="#" variant="secondary">Secondary link</civ-link>
          <civ-link href="#" variant="tertiary">Tertiary link</civ-link>
          <civ-link href="#" variant="back" label="Back"></civ-link>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Danger</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary" danger>Primary danger</civ-link>
          <civ-link href="#" variant="secondary" danger>Secondary danger</civ-link>
          <civ-link href="#" variant="tertiary" danger>Tertiary danger</civ-link>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Disabled</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary" disabled>Primary disabled</civ-link>
          <civ-link href="#" variant="secondary" disabled>Secondary disabled</civ-link>
          <civ-link href="#" variant="tertiary" disabled>Tertiary disabled</civ-link>
        </div>
      </div>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <civ-link href="#" variant="primary" danger>Delete account</civ-link>
      <civ-link href="#" variant="secondary" danger>Remove item</civ-link>
      <civ-link href="#" variant="tertiary" danger>Cancel request</civ-link>
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

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
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

export const BenefitsNavigation: Story = {
  name: 'Benefits Navigation',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <civ-link href="#/hub" variant="back" label="Back to VA benefits hub"></civ-link>
      <div style="margin-top: 16px;">
        <p style="margin: 0 0 8px;">Related links:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <civ-link href="#/disability" variant="primary">Disability compensation</civ-link>
          <civ-link href="#/healthcare" variant="primary">Health care benefits</civ-link>
          <civ-link href="#/education" variant="primary">Education benefits</civ-link>
        </div>
      </div>
    </div>
  `,
};
