import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './civ-date-picker.js';
import '@civui/ui';

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

// ── Default ───────────────────────────────────────────────────

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

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-date-picker
      label="Preferred appointment date"
      name="appointment"
      hint="Use the calendar button or type a date like 03/15/2026"
    ></civ-date-picker>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-date-picker
      label="Appointment date"
      name="appointment"
      error="Select a valid appointment date"
      required
    ></civ-date-picker>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-date-picker
      label="Appointment date"
      name="appointment"
      required
    ></civ-date-picker>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-date-picker
      label="Appointment date"
      name="appointment"
      value="2026-03-15"
      disabled
    ></civ-date-picker>
  `,
};

export const WithMinMax: Story = {
  name: 'With Date Range',
  render: () => html`
    <civ-date-picker
      label="Appointment date"
      name="appointment"
      min="2026-04-01"
      max="2026-04-30"
      hint="Available dates: April 1-30, 2026"
    ></civ-date-picker>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-date-picker label="Normal" name="normal"></civ-date-picker>
      <civ-date-picker label="With hint" name="hint" hint="Use the calendar or type a date"></civ-date-picker>
      <civ-date-picker label="With error" name="error" error="Select a date" required></civ-date-picker>
      <civ-date-picker label="Required" name="required" required></civ-date-picker>
      <civ-date-picker label="Disabled" name="disabled" value="2026-03-15" disabled></civ-date-picker>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-date-picker label="Appointment date" name="dense-date" hint="Select an available date"></civ-date-picker>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-date-picker label="Appointment date" name="default-date" hint="Select an available date"></civ-date-picker>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-date-picker label="Appointment date" name="spacious-date" hint="Select an available date"></civ-date-picker>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentAppointmentScheduler: Story = {
  name: 'Usage: Schedule an Appointment',
  render: () => html`
    <form @submit=${(e: Event) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      alert('Appointment scheduled: ' + fd.get('date'));
    }}>
      <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Schedule your in-person appointment</h3>
      <civ-date-picker
        label="Preferred date"
        name="date"
        required
        min="2026-04-21"
        max="2026-06-30"
        hint="Appointments are available Monday through Friday, April 21 to June 30, 2026"
      ></civ-date-picker>
      <civ-button type="submit" class="civ-mt-2">Schedule appointment</civ-button>
    </form>
  `,
};

// ── Today button ──────────────────────────────────────────────

export const TodayButton: Story = {
  name: 'Today button (default)',
  parameters: {
    docs: {
      description: {
        story:
          'A "Today" button in the dialog footer selects today and closes the picker. Press `T` (or `Shift+T`) inside the calendar to jump focus to today without selecting — Enter/Space still required to commit.',
      },
    },
  },
  render: () => html`
    <civ-date-picker
      label="Date of report"
      name="reportDate"
    ></civ-date-picker>
  `,
};

export const TodayButtonHidden: Story = {
  name: 'Today button hidden (date of birth)',
  parameters: {
    docs: {
      description: {
        story:
          'For pickers where "today" makes no semantic sense (date of birth, document issue date, etc.), set `hide-today-button` to suppress the footer button. The `T` shortcut also no-ops since today is unreachable in the constraint window.',
      },
    },
  },
  render: () => html`
    <civ-date-picker
      label="Date of birth"
      name="dob"
      hide-today-button
      max="2026-04-26"
    ></civ-date-picker>
  `,
};

export const TodayButtonDisabled: Story = {
  name: 'Today button disabled (today outside min/max)',
  parameters: {
    docs: {
      description: {
        story:
          'When `min` or `max` excludes today, the Today button is automatically disabled — clicking does nothing.',
      },
    },
  },
  render: () => html`
    <civ-date-picker
      label="Future appointment"
      name="appt"
      min="2030-01-01"
      hint="Available January 1, 2030 onward"
    ></civ-date-picker>
  `,
};
