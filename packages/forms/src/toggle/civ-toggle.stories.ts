import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-toggle.js';

const meta: Meta = {
  title: 'Forms/Inputs/Toggle',
  component: 'civ-toggle',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    description: { control: 'text' },
    hint: { control: 'text' },
    checked: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Dark mode',
    name: 'darkmode',
  },
  render: (args) => html`
    <civ-toggle
      label="${args.label}"
      name="${args.name}"
      ?checked="${args.checked}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-toggle>
  `,
};

export const Checked: Story = {
  render: () => html`
    <civ-toggle label="Notifications enabled" name="notifications" checked></civ-toggle>
  `,
};

export const WithDescription: Story = {
  render: () => html`
    <civ-toggle
      label="Email notifications"
      name="email-notif"
      description="Receive weekly updates about your account activity"
    ></civ-toggle>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-toggle
      label="Auto-save"
      name="autosave"
      hint="Automatically saves your work every 30 seconds"
    ></civ-toggle>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-toggle
      label="Accept terms"
      name="terms"
      error="You must accept the terms to continue"
      required
    ></civ-toggle>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-toggle label="Feature locked" name="locked" disabled checked></civ-toggle>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const values = Array.from(fd.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        alert('Submitted: ' + values);
      }}
    >
      <civ-toggle
        label="Dark mode"
        name="darkmode"
        description="Use dark color scheme throughout the application"
      ></civ-toggle>
      <civ-toggle
        label="Notifications"
        name="notifications"
        description="Receive push notifications for important updates"
        checked
      ></civ-toggle>
      <civ-toggle
        label="Auto-save"
        name="autosave"
        description="Automatically save your work every 30 seconds"
      ></civ-toggle>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <button type="submit" class="civ-bg-primary civ-text-white civ-px-4 civ-py-2 civ-rounded">Submit</button>
      </div>
    </form>
  `,
};
