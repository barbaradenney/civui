import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-alert.js';

const meta: Meta = {
  title: 'Feedback/Alert',
  component: 'civ-alert',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
    },
    alertStyle: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      name: 'alert-style',
    },
    label: { control: 'text' },
    heading: { control: 'text' },
    headingLevel: {
      control: 'select',
      options: [2, 3, 4, 5, 6],
    },
    dismissible: { control: 'boolean' },
    slim: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    variant: 'info',
    alertStyle: 'secondary',
    heading: 'Informational status',
    label: 'This is an informational alert to provide general context about the page or process.',
  },
  render: (args) => html`
    <civ-alert
      variant="${args.variant}"
      alert-style="${args.alertStyle}"
      heading="${args.heading}"
      label="${args.label}"
      ?dismissible="${args.dismissible}"
      ?slim="${args.slim}"
    ></civ-alert>
  `,
};

// ── Individual Variants ───────────────────────────────────────

export const Info: Story = {
  render: () => html`
    <civ-alert variant="info" heading="Information">
      Your application is being processed. You will receive a decision within 30 days.
    </civ-alert>
  `,
};

export const Warning: Story = {
  render: () => html`
    <civ-alert variant="warning" heading="Warning">
      Your session will expire in 5 minutes. Save your progress to avoid losing data.
    </civ-alert>
  `,
};

export const Error: Story = {
  render: () => html`
    <civ-alert variant="error" heading="There is a problem">
      We could not save your information. Check your internet connection and try again.
    </civ-alert>
  `,
};

export const Success: Story = {
  render: () => html`
    <civ-alert variant="success" heading="Application submitted">
      Your application was submitted successfully. Your confirmation number is APP-2026-04-19-0042.
    </civ-alert>
  `,
};

// ── All Variants ──────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert variant="info" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

// ── Style Variants ────────────────────────────────────────────

export const PrimaryStyle: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert variant="info" alert-style="primary" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" alert-style="primary" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" alert-style="primary" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" alert-style="primary" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

export const TertiaryStyle: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-alert variant="info" alert-style="tertiary" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" alert-style="tertiary" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" alert-style="tertiary" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" alert-style="tertiary" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

export const Slim: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-2">
      <civ-alert slim>Informational: Your profile was updated.</civ-alert>
      <civ-alert variant="warning" slim>Warning: Some fields are incomplete.</civ-alert>
      <civ-alert variant="error" slim>Error: File upload failed.</civ-alert>
      <civ-alert variant="success" slim>Success: Changes saved.</civ-alert>
    </div>
  `,
};

export const Dismissible: Story = {
  render: () => html`
    <civ-alert heading="Optional notice" dismissible>
      This alert can be dismissed by clicking the close button.
    </civ-alert>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentFormValidation: Story = {
  name: 'Usage: Form Validation Feedback',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-alert variant="error" heading="There is a problem with your application">
        <ul class="civ-mt-2 civ-mb-0 civ-ps-5">
          <li><a href="#name" style="color: inherit;">Enter your full name</a></li>
          <li><a href="#email" style="color: inherit;">Enter a valid email address</a></li>
          <li><a href="#ssn" style="color: inherit;">Enter a valid Social Security number</a></li>
        </ul>
      </civ-alert>

      <civ-alert variant="success" heading="Application submitted">
        We received your application on April 19, 2026. Your confirmation number is APP-2026-04-19-0042.
        We will review your application and notify you of our decision within 30 days.
      </civ-alert>

      <civ-alert variant="warning" heading="Your session is about to expire">
        For your security, we will sign you out in 5 minutes due to inactivity.
        Select "Continue session" to keep working.
      </civ-alert>
    </div>
  `,
};

// ── Compact ──────────────────────────────────────────────────

export const Compact: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div>
        <p class="civ-font-semibold civ-mb-2">Default</p>
        <civ-alert variant="info" heading="Information">
          Your application is being reviewed.
        </civ-alert>
      </div>
      <div>
        <p class="civ-font-semibold civ-mb-2">Compact (sm)</p>
        <civ-alert variant="info" heading="Information" spacing="sm">
          Your application is being reviewed.
        </civ-alert>
      </div>
    </div>
  `,
};
