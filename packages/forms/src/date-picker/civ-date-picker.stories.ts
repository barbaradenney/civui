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
    <div style="display: flex; flex-direction: column; gap: 24px;">
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
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-date-picker label="Appointment date" name="dense-date" hint="Select an available date"></civ-date-picker>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-date-picker label="Appointment date" name="default-date" hint="Select an available date"></civ-date-picker>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
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
      <h3 style="margin: 0 0 16px; font-size: 1.25rem;">Schedule your in-person appointment</h3>
      <civ-date-picker
        label="Preferred date"
        name="date"
        required
        min="2026-04-21"
        max="2026-06-30"
        hint="Appointments are available Monday through Friday, April 21 to June 30, 2026"
      ></civ-date-picker>
      <button type="submit" class="civ-mt-2 civ-px-4 civ-py-2 civ-bg-primary civ-text-white civ-rounded focus-visible:civ-focus-ring-inverse">Schedule appointment</button>
    </form>
  `,
};
