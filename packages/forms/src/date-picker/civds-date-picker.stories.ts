import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './civds-date-picker.js';

const meta: Meta = {
  title: 'Forms/DatePicker',
  component: 'civds-date-picker',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civds-date-picker
      label="Appointment date"
      name="appointment"
    ></civds-date-picker>
  `,
};

export const WithValue: Story = {
  render: () => html`
    <civds-date-picker
      label="Start date"
      name="start"
      value="2026-03-15"
    ></civds-date-picker>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civds-date-picker
      label="Event date"
      name="event"
      hint="Use the calendar button or type a date like 03/15/2026"
    ></civds-date-picker>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-date-picker
      label="Due date"
      name="due"
      error="Please select a valid date"
      required
    ></civds-date-picker>
  `,
};

export const Required: Story = {
  render: () => html`
    <civds-date-picker
      label="Delivery date"
      name="delivery"
      required
    ></civds-date-picker>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civds-date-picker
      label="Locked date"
      name="locked"
      value="2026-03-15"
      disabled
    ></civds-date-picker>
  `,
};

export const MinMaxRange: Story = {
  render: () => html`
    <civds-date-picker
      label="Booking date"
      name="booking"
      min="2026-03-01"
      max="2026-03-31"
      hint="Available dates: March 1-31, 2026"
    ></civds-date-picker>
  `,
};

export const InNativeForm: Story = {
  render: () => html`
    <form @submit=${(e: Event) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      alert('Selected date: ' + fd.get('date'));
    }}>
      <civds-date-picker
        label="Choose a date"
        name="date"
        required
      ></civds-date-picker>
      <button type="submit" class="civds-mt-2 civds-px-4 civds-py-2 civds-bg-primary civds-text-white civds-rounded">Submit</button>
    </form>
  `,
};
