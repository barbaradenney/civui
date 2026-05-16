import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-time-picker.js';

const meta: Meta = {
  title: 'Inputs/Time Picker',
  component: 'civ-time-picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Self-contained time input rendered as three selects (hour, minute, and
AM/PM). Always stores its value in 24-hour ISO format (\`HH:MM\`) — the
\`format\` prop controls display, not storage.

Use it for appointment scheduling, hearing times, and any "time of day"
question. For known past dates use \`civ-memorable-date\`; for future
dates use \`civ-date-picker\`.
        `,
      },
    },
  },
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    format: { control: 'select', options: ['12', '24'] },
    minuteStep: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-time-picker
      legend="Appointment time"
      name="appt_time"
      hint="Choose a 30-minute slot during business hours"
      minute-step="30"
    ></civ-time-picker>
  `,
};

export const TwentyFourHour: Story = {
  name: '24-hour format',
  render: () => html`
    <civ-time-picker
      legend="Hearing time"
      name="hearing_time"
      format="24"
      hint="Times shown in 24-hour format (military time)"
      minute-step="15"
    ></civ-time-picker>
  `,
};

export const FineGrained: Story = {
  name: 'Fine-grained (minute step = 1)',
  render: () => html`
    <civ-time-picker
      legend="Exact time of incident"
      name="incident_time"
      minute-step="1"
    ></civ-time-picker>
  `,
};

export const Prefilled: Story = {
  name: 'Prefilled value',
  render: () => html`
    <civ-time-picker
      legend="Departure time"
      name="departure"
      value="14:30"
      minute-step="15"
    ></civ-time-picker>
  `,
};

export const Required: Story = {
  name: 'Required field',
  render: () => html`
    <civ-time-picker
      legend="When would you like to be contacted?"
      name="contact_time"
      hint="Required — we'll call within 1 hour of this time"
      minute-step="30"
      required
    ></civ-time-picker>
  `,
};

export const WithError: Story = {
  name: 'With error',
  render: () => html`
    <civ-time-picker
      legend="Appointment time"
      name="appt"
      error="Please select a time during business hours (9 AM – 5 PM)"
      minute-step="15"
    ></civ-time-picker>
  `,
};
