import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './civ-date-picker.js';

const meta: Meta = {
  title: 'Forms/Inputs/Date Picker',
  component: 'civ-date-picker',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    placeholder: { control: 'text' },
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
    hint: '',
    error: '',
    min: '',
    max: '',
    placeholder: 'mm/dd/yyyy',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-date-picker
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      min="${args.min}"
      max="${args.max}"
      placeholder="${args.placeholder}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-date-picker>
  `,
};

export const WithValue: Story = {
  render: () => html`
    <civ-date-picker
      label="Start date"
      name="start"
      value="2026-03-15"
    ></civ-date-picker>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-date-picker
      label="Event date"
      name="event"
      hint="Use the calendar button or type a date like 03/15/2026"
    ></civ-date-picker>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-date-picker
      label="Due date"
      name="due"
      error="Please select a valid date"
      required
    ></civ-date-picker>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-date-picker
      label="Delivery date"
      name="delivery"
      required
    ></civ-date-picker>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-date-picker
      label="Locked date"
      name="locked"
      value="2026-03-15"
      disabled
    ></civ-date-picker>
  `,
};

export const MinMaxRange: Story = {
  render: () => html`
    <civ-date-picker
      label="Booking date"
      name="booking"
      min="2026-03-01"
      max="2026-03-31"
      hint="Available dates: March 1-31, 2026"
    ></civ-date-picker>
  `,
};

export const InNativeForm: Story = {
  render: () => html`
    <form @submit=${(e: Event) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      alert('Selected date: ' + fd.get('date'));
    }}>
      <civ-date-picker
        label="Choose a date"
        name="date"
        required
      ></civ-date-picker>
      <button type="submit" class="civ-mt-2 civ-px-4 civ-py-2 civ-bg-primary civ-text-white civ-rounded focus-visible:civ-focus-ring-inverse">Submit</button>
    </form>
  `,
};
