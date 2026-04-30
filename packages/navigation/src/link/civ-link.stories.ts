import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-link.js';

const meta: Meta = {
  title: 'Navigation/Link',
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
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
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
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Standard</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">Primary link</civ-link>
          <civ-link href="#" variant="secondary">Secondary link</civ-link>
          <civ-link href="#" variant="tertiary">Tertiary link</civ-link>
          <civ-link href="#" variant="back" label="Back"></civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Danger</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary" danger>Primary danger</civ-link>
          <civ-link href="#" variant="secondary" danger>Secondary danger</civ-link>
          <civ-link href="#" variant="tertiary" danger>Tertiary danger</civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
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
    <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
      <civ-link href="#" variant="primary" danger>Delete account</civ-link>
      <civ-link href="#" variant="secondary" danger>Remove item</civ-link>
      <civ-link href="#" variant="tertiary" danger>Cancel request</civ-link>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
      <civ-link href="#" variant="primary" disabled>Disabled primary</civ-link>
      <civ-link href="#" variant="secondary" disabled>Disabled secondary</civ-link>
      <civ-link href="#" variant="tertiary" disabled>Disabled tertiary</civ-link>
    </div>
  `,
};

export const WithCustomIcons: Story = {
  name: 'With Custom Icons',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link href="#" icon-start="download">Download your form</civ-link>
      <civ-link href="#" icon-end="external-link">Visit VA.gov</civ-link>
      <civ-link href="#" icon-start="print" icon-end="external-link">Print and mail</civ-link>
      <civ-link href="#" variant="secondary" icon-end="arrow-right">Continue to next step</civ-link>
      <civ-link href="#" variant="back" icon-start="home">Back to homepage</civ-link>
    </div>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
          <civ-link href="#" variant="primary">View claim</civ-link>
          <civ-link href="#" variant="secondary">Download letter</civ-link>
          <civ-link href="#" variant="tertiary">Learn more</civ-link>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-4 civ-flex-wrap civ-items-center">
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
    <div class="civ-flex civ-flex-col civ-gap-3">
      <civ-link href="#/hub" variant="back" label="Back to VA benefits hub"></civ-link>
      <div class="civ-mt-4">
        <p class="civ-m-0 civ-mb-2">Related links:</p>
        <div class="civ-flex civ-flex-col civ-gap-2">
          <civ-link href="#/disability" variant="primary">Disability compensation</civ-link>
          <civ-link href="#/healthcare" variant="primary">Health care benefits</civ-link>
          <civ-link href="#/education" variant="primary">Education benefits</civ-link>
        </div>
      </div>
    </div>
  `,
};
