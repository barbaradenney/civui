import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '@civui/core';
import './civ-date-picker.js';
import '@civui/actions';

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
    <civ-form-field
      label="${args.label}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-date-picker
        name="${args.name}"
        min="${args.min}"
        max="${args.max}"
        placeholder="${args.placeholder}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-date-picker>
    </civ-form-field>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-field label="Preferred appointment date" hint="Use the calendar button or type a date like 03/15/2026">
      <civ-date-picker name="appointment"></civ-date-picker>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-field label="Appointment date" error="Select a valid appointment date" required>
      <civ-date-picker name="appointment" required></civ-date-picker>
    </civ-form-field>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-field label="Appointment date" required>
      <civ-date-picker name="appointment" required></civ-date-picker>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-field label="Appointment date" disabled>
      <civ-date-picker name="appointment" value="2026-03-15" disabled></civ-date-picker>
    </civ-form-field>
  `,
};

export const WithMinMax: Story = {
  name: 'With Date Range',
  render: () => html`
    <civ-form-field label="Appointment date" hint="Available dates: April 1-30, 2026">
      <civ-date-picker name="appointment" min="2026-04-01" max="2026-04-30"></civ-date-picker>
    </civ-form-field>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-form-field label="Normal">
        <civ-date-picker name="normal"></civ-date-picker>
      </civ-form-field>
      <civ-form-field label="With hint" hint="Use the calendar or type a date">
        <civ-date-picker name="hint"></civ-date-picker>
      </civ-form-field>
      <civ-form-field label="With error" error="Select a date" required>
        <civ-date-picker name="error" required></civ-date-picker>
      </civ-form-field>
      <civ-form-field label="Required" required>
        <civ-date-picker name="required" required></civ-date-picker>
      </civ-form-field>
      <civ-form-field label="Disabled" disabled>
        <civ-date-picker name="disabled" value="2026-03-15" disabled></civ-date-picker>
      </civ-form-field>
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
        <civ-form-field label="Appointment date" hint="Select an available date">
          <civ-date-picker name="dense-date"></civ-date-picker>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-field label="Appointment date" hint="Select an available date">
          <civ-date-picker name="default-date"></civ-date-picker>
        </civ-form-field>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-field label="Appointment date" hint="Select an available date">
          <civ-date-picker name="spacious-date"></civ-date-picker>
        </civ-form-field>
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
      <civ-form-field
        label="Preferred date"
        hint="Appointments are available Monday through Friday, April 21 to June 30, 2026"
        required
      >
        <civ-date-picker
          name="date"
          required
          min="2026-04-21"
          max="2026-06-30"
        ></civ-date-picker>
      </civ-form-field>
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
    <civ-form-field label="Date of report">
      <civ-date-picker name="reportDate"></civ-date-picker>
    </civ-form-field>
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
    <civ-form-field label="Date of birth">
      <civ-date-picker name="dob" hide-today-button max="2026-04-26"></civ-date-picker>
    </civ-form-field>
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
    <civ-form-field label="Future appointment" hint="Available January 1, 2030 onward">
      <civ-date-picker name="appt" min="2030-01-01"></civ-date-picker>
    </civ-form-field>
  `,
};

// ── Year jump (DOB pickers) ───────────────────────────────────

export const YearJump: Story = {
  name: 'Year jump (DOB picker)',
  parameters: {
    docs: {
      description: {
        story:
          'The dialog header has month and year `<select>` elements that let users jump anywhere in the calendar in a single click — critical for date-of-birth pickers where the user might need to scroll back 50+ years. The year range honors `min`/`max` when set, otherwise defaults to today − 120 through today + 10. Months outside `min`/`max` for the boundary year are disabled.',
      },
    },
  },
  render: () => html`
    <civ-form-field label="Date of birth" hint="Use the year dropdown to jump to your birth year.">
      <civ-date-picker name="dob" hide-today-button max="2026-04-26"></civ-date-picker>
    </civ-form-field>
  `,
};
