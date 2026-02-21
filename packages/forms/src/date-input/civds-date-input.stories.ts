import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-date-input.js';
import './civds-memorable-date.js';

const meta: Meta = {
  title: 'Forms/Date Input',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const NativeDatePicker: Story = {
  render: () => html`
    <civds-date-input label="Appointment date" name="appointment" hint="Select a date"></civds-date-input>
  `,
};

export const WithMinMax: Story = {
  render: () => html`
    <civds-date-input
      label="Event date"
      name="event"
      min="2025-01-01"
      max="2025-12-31"
      hint="Must be within 2025"
    ></civds-date-input>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-date-input label="Start date" name="start" error="Please select a valid date" required></civds-date-input>
  `,
};

export const MemorableDate: Story = {
  render: () => html`
    <civds-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 19 2000"
    ></civds-memorable-date>
  `,
};

export const MemorableDateWithError: Story = {
  render: () => html`
    <civds-memorable-date
      legend="Date of birth"
      name="dob"
      error="Please enter your date of birth"
      required
    ></civds-memorable-date>
  `,
};

export const MemorableDateDisabled: Story = {
  render: () => html`
    <civds-memorable-date
      legend="Date of birth"
      name="dob"
      value="2000-01-19"
      disabled
    ></civds-memorable-date>
  `,
};
