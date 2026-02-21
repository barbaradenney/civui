import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-date-input.js';
import './civ-memorable-date.js';

const meta: Meta = {
  title: 'Forms/Date Input',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const NativeDatePicker: Story = {
  render: () => html`
    <civ-date-input label="Appointment date" name="appointment" hint="Select a date"></civ-date-input>
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
