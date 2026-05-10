import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import './civ-date-range-picker.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Date Range Picker',
  component: 'civ-date-range-picker',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    minRangeDays: { control: 'number' },
    maxRangeDays: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Stay dates',
    name: 'stay',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-date-range-picker
      label="${args.label}"
      name="${args.name}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-date-range-picker>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-date-range-picker
      label="Trip dates"
      name="trip"
      required
    ></civ-date-range-picker>
  `,
};

export const WithOuterBounds: Story = {
  name: 'With outer min / max',
  parameters: {
    docs: {
      description: {
        story:
          'Use `min` and `max` to constrain the entire range. The end picker\'s `min` is dynamically the later of (start value, outer min), and the start picker\'s `max` is dynamically the earlier of (end value, outer max).',
      },
    },
  },
  render: () => html`
    <civ-date-range-picker
      label="Filing date range"
      name="filing"
      min="2026-01-01"
      max="2026-12-31"
    ></civ-date-range-picker>
  `,
};

export const MinRangeDays: Story = {
  name: 'min-range-days (e.g. 2-night minimum)',
  render: () => html`
    <civ-date-range-picker
      label="Stay dates"
      name="stay"
      min-range-days="2"
      hint="Minimum 2-night stay"
    ></civ-date-range-picker>
  `,
};

export const MaxRangeDays: Story = {
  name: 'max-range-days (e.g. 30-day cap)',
  render: () => html`
    <civ-date-range-picker
      label="Leave dates"
      name="leave"
      max-range-days="30"
      hint="Max 30 consecutive days"
    ></civ-date-range-picker>
  `,
};

export const CustomLabels: Story = {
  render: () => html`
    <civ-date-range-picker
      label="Hospital stay"
      name="stay"
      start-label="Admission date"
      end-label="Discharge date"
      start-hint="When were you admitted?"
      end-hint="When were you discharged?"
    ></civ-date-range-picker>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-date-range-picker
      label="Stay dates"
      name="stay"
      value='{"start":"2026-05-01","end":"2026-05-08"}'
      disabled
    ></civ-date-range-picker>
  `,
};

export const GovernmentLeaveRequest: Story = {
  name: 'Usage: Federal leave request',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-date-range-picker
        label="Leave dates"
        name="leave"
        min-range-days="1"
        max-range-days="30"
        hint="Provide the first and last day you'll be on leave"
        required
      ></civ-date-range-picker>
      <civ-button type="submit" class="civ-mt-4">Submit request</civ-button>
    </form>
  `,
};
