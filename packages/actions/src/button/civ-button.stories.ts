import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-button.js';

const meta: Meta = {
  title: 'Actions/Button',
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
      emphasis="${args.emphasis}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?danger="${args.danger}"
    ></civ-button>
  `,
};

export const Primary: Story = {
  render: () => html`
    <civ-button emphasis="primary">Submit application</civ-button>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <civ-button emphasis="secondary">Save and continue later</civ-button>
  `,
};

export const Tertiary: Story = {
  render: () => html`
    <civ-button emphasis="tertiary">Cancel</civ-button>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Standard</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Primary</civ-button>
          <civ-button emphasis="secondary">Secondary</civ-button>
          <civ-button emphasis="tertiary">Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Danger</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary" danger>Primary</civ-button>
          <civ-button emphasis="secondary" danger>Secondary</civ-button>
          <civ-button emphasis="tertiary" danger>Tertiary</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary" disabled>Primary</civ-button>
          <civ-button emphasis="secondary" disabled>Secondary</civ-button>
          <civ-button emphasis="tertiary" disabled>Tertiary</civ-button>
        </div>
      </div>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button emphasis="primary" danger>Delete account</civ-button>
      <civ-button emphasis="secondary" danger>Remove dependent</civ-button>
      <civ-button emphasis="tertiary" danger>Cancel claim</civ-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
      <civ-button disabled>Disabled primary</civ-button>
      <civ-button emphasis="secondary" disabled>Disabled secondary</civ-button>
      <civ-button emphasis="tertiary" disabled>Disabled tertiary</civ-button>
      <civ-button emphasis="primary" danger disabled>Disabled danger</civ-button>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
      <civ-button icon-start="download">Download</civ-button>
      <civ-button icon-end="arrow-right" emphasis="primary">Continue</civ-button>
      <civ-button icon-start="edit" emphasis="secondary">Edit</civ-button>
      <civ-button icon-start="print" icon-end="external-link" emphasis="tertiary">Print form</civ-button>
      <civ-button icon-start="trash" emphasis="primary" danger>Delete</civ-button>
    </div>
  `,
};

export const AsLink: Story = {
  name: 'As Link (with href)',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <p class="civ-m-0 civ-text-sm">
        Setting <code>href</code> makes <code>civ-button</code> render as an
        <code>&lt;a&gt;</code> with the same button chrome, plus an underline so the
        link identity stays visible. Right-click "open in new tab", back-button
        history, and screen-reader role all behave as a real link.
      </p>
      <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
        <civ-button href="/dependents/new" emphasis="primary">Add dependent</civ-button>
        <civ-button href="/forms/21-526ez" emphasis="secondary" icon-start="plus">Start new claim</civ-button>
        <civ-button href="/help" emphasis="tertiary">Get help</civ-button>
      </div>
      <p class="civ-m-0 civ-text-sm">External links — pair with <code>new-tab</code> for the standard "open in new tab" treatment.</p>
      <div class="civ-flex civ-flex-wrap civ-gap-3 civ-items-center">
        <civ-button href="https://www.va.gov" emphasis="secondary" new-tab>VA.gov</civ-button>
        <civ-button href="https://www.benefits.va.gov" emphasis="tertiary" new-tab icon-end="external-link">Benefits site</civ-button>
      </div>
    </div>
  `,
};

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Submit</civ-button>
          <civ-button emphasis="secondary">Save</civ-button>
          <civ-button emphasis="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Submit</civ-button>
          <civ-button emphasis="secondary">Save</civ-button>
          <civ-button emphasis="tertiary">Cancel</civ-button>
        </div>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <div class="civ-flex civ-gap-3 civ-flex-wrap civ-items-center">
          <civ-button emphasis="primary">Submit</civ-button>
          <civ-button emphasis="secondary">Save</civ-button>
          <civ-button emphasis="tertiary">Cancel</civ-button>
        </div>
      </div>
    </div>
  `,
};

export const FormActions: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        alert('Form submitted!');
      }}"
    >
      <p class="civ-mb-4">Complete your VA benefits application and submit for review.</p>
      <div class="civ-button-row">
        <civ-button type="submit">Submit application</civ-button>
        <civ-button emphasis="secondary">Save and continue later</civ-button>
        <civ-button emphasis="tertiary">Cancel</civ-button>
      </div>
    </form>
  `,
};

export const FormActionsMobile: Story = {
  name: 'Form Actions (mobile)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => html`
    <p class="civ-mb-4 civ-text-sm">
      Below 481px viewports, <code>.civ-button-row</code> stacks the cluster vertically so
      every button picks up the design system's full-width-on-mobile rule. Compare to plain
      <code>civ-flex civ-gap-3</code>, which keeps the row horizontal at every width and
      shrinks each button to its share of the row.
    </p>
    <div class="civ-button-row">
      <civ-button>Save and continue</civ-button>
      <civ-button emphasis="tertiary">Back</civ-button>
    </div>
  `,
};

export const ClaimActions: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Upload evidence</p>
        <div class="civ-button-row">
          <civ-button emphasis="primary">Upload documents</civ-button>
          <civ-button emphasis="tertiary">Skip for now</civ-button>
        </div>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Manage dependents</p>
        <div class="civ-button-row">
          <civ-button emphasis="secondary">Add dependent</civ-button>
          <civ-button emphasis="tertiary" danger>Remove dependent</civ-button>
        </div>
      </div>
    </div>
  `,
};
