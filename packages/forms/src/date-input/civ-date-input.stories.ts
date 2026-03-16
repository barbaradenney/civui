import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-date-input.js';
import './civ-memorable-date.js';

const meta: Meta = {
  title: 'Forms/Date Input',
  component: 'civ-date-input',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Appointment date',
    name: 'appointment',
    hint: 'Select a date',
    error: '',
    min: '',
    max: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-date-input
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      min="${args.min}"
      max="${args.max}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-date-input>
  `,
};

export const WithMinMax: Story = {
  render: () => html`
    <civ-date-input
      label="Event date"
      name="event"
      min="2025-01-01"
      max="2025-12-31"
      hint="Must be within 2025"
    ></civ-date-input>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-date-input label="Start date" name="start" error="Please select a valid date" required></civ-date-input>
  `,
};

export const MemorableDate: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 19 2000"
    ></civ-memorable-date>
  `,
};

export const MemorableDateWithError: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      error="Please enter your date of birth"
      required
    ></civ-memorable-date>
  `,
};

export const MemorableDateDisabled: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      value="2000-01-19"
      disabled
    ></civ-memorable-date>
  `,
};
