import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-memorable-date.js';

const meta: Meta = {
  title: 'Forms/Memorable Date',
  component: 'civ-memorable-date',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    monthLabel: { control: 'text' },
    dayLabel: { control: 'text' },
    yearLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    legend: 'Date of birth',
    name: 'dob',
    value: '',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-memorable-date
      legend="${args.legend}"
      name="${args.name}"
      value="${args.value}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-memorable-date>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 15 1990"
    ></civ-memorable-date>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      error="Enter a valid date of birth"
      hint="For example: January 15 1990"
    ></civ-memorable-date>
  `,
};

export const Prefilled: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      value="1990-07-04"
    ></civ-memorable-date>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 15 1990"
      required
    ></civ-memorable-date>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      value="1990-07-04"
      disabled
    ></civ-memorable-date>
  `,
};

export const CustomLabels: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Fecha de nacimiento"
      name="dob"
      month-label="Mes"
      day-label="Día"
      year-label="Año"
      hint="Por ejemplo: enero 15 1990"
    ></civ-memorable-date>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-memorable-date
        legend="Date of birth"
        name="dob"
        hint="For example: January 15 1990"
        required
      ></civ-memorable-date>
      <button
        type="submit"
        style="margin-top: 16px; padding: 8px 24px; background: #005ea2; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Submit
      </button>
    </form>
  `,
};
