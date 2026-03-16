import type { Meta, StoryObj } from '@storybook/web-components';
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
      options: ['primary', 'secondary', 'outline', 'unstyled'],
    },
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

export const Default: Story = {
  args: {
    variant: 'info',
    alertStyle: 'secondary',
    heading: 'Informational status',
    label: 'This is an informational alert to provide general context.',
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

export const Primary: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
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

export const Secondary: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
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

export const Outline: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <civ-alert variant="info" alert-style="outline" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" alert-style="outline" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" alert-style="outline" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" alert-style="outline" heading="Success">
        Your form has been submitted.
      </civ-alert>
    </div>
  `,
};

export const Unstyled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <civ-alert variant="info" alert-style="unstyled" heading="Information">
        Routine maintenance is scheduled for this weekend.
      </civ-alert>
      <civ-alert variant="warning" alert-style="unstyled" heading="Warning">
        Your password will expire in 7 days.
      </civ-alert>
      <civ-alert variant="error" alert-style="unstyled" heading="Error">
        Unable to save changes. Check your connection.
      </civ-alert>
      <civ-alert variant="success" alert-style="unstyled" heading="Success">
        Your form has been submitted.
      </civ-alert>
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

export const Slim: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <civ-alert slim>Informational: Your profile was updated.</civ-alert>
      <civ-alert variant="warning" slim>Warning: Some fields are incomplete.</civ-alert>
      <civ-alert variant="error" slim>Error: File upload failed.</civ-alert>
      <civ-alert variant="success" slim>Success: Changes saved.</civ-alert>
    </div>
  `,
};

export const SlimPrimary: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <civ-alert alert-style="primary" slim>Informational: Your profile was updated.</civ-alert>
      <civ-alert variant="warning" alert-style="primary" slim>Warning: Some fields are incomplete.</civ-alert>
      <civ-alert variant="error" alert-style="primary" slim>Error: File upload failed.</civ-alert>
      <civ-alert variant="success" alert-style="primary" slim>Success: Changes saved.</civ-alert>
    </div>
  `,
};
