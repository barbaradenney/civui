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
    heading: { control: 'text' },
    dismissible: { control: 'boolean' },
    slim: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Info: Story = {
  render: () => html`
    <civ-alert heading="Informational status">
      This is an informational alert to provide general context.
    </civ-alert>
  `,
};

export const Warning: Story = {
  render: () => html`
    <civ-alert variant="warning" heading="Before you continue">
      Your session will expire in 5 minutes. Save your progress.
    </civ-alert>
  `,
};

export const Error: Story = {
  render: () => html`
    <civ-alert variant="error" heading="There was a problem">
      We could not process your request. Please try again.
    </civ-alert>
  `,
};

export const Success: Story = {
  render: () => html`
    <civ-alert variant="success" heading="Application submitted">
      Your application has been submitted successfully. You will receive
      a confirmation email within 24 hours.
    </civ-alert>
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

export const AllVariants: Story = {
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
