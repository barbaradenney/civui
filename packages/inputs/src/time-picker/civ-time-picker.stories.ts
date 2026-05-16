import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-time-picker.js';

const meta: Meta = {
  title: 'Forms/Inputs/Time Picker',
  component: 'civ-time-picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Self-contained time input. Always stores its value in 24-hour ISO format
(\`HH:MM\`) regardless of display format or input mode.

**Two input modes:**

- **\`mode="combo"\` (default)** — a single typeable combobox with pre-built
  slots driven by \`minute-step\`. Users can type to filter (\`"230"\` →
  "2:30 AM"/"2:30 PM") or pick from the dropdown. Matches the [USWDS time
  picker](https://designsystem.digital.gov/components/time-picker/) pattern.
  Optional \`min\` / \`max\` bounds restrict slots to business hours. Best
  for scheduling — appointments, hearing times, callback windows.

- **\`mode="select"\`** — three selects (hour, minute, AM/PM) in a fieldset.
  Predictable, every-device-safe, no typing required. Use when slot-list
  filtering would be confusing (free-form precision) or when \`minute-step="1"\`
  would create an unwieldy combobox list.

For known past dates use \`civ-memorable-date\`; for future dates use
\`civ-date-picker\`.
        `,
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['combo', 'select'] },
    label: { control: 'text' },
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    format: { control: 'select', options: ['12', '24'] },
    minuteStep: { control: 'number' },
    min: { control: 'text' },
    max: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Combo mode (default, recommended) ──────────────────────────

export const Default: Story = {
  name: 'Default (combo mode)',
  render: () => html`
    <civ-time-picker
      label="Appointment time"
      name="appt_time"
      hint="Choose any 15-minute slot during the day"
    ></civ-time-picker>
  `,
};

export const BusinessHours: Story = {
  name: 'Business hours (min / max + 30-min step)',
  render: () => html`
    <civ-time-picker
      label="Schedule your appointment"
      name="appt"
      min="09:00"
      max="17:00"
      minute-step="30"
      hint="Available Monday–Friday, 9:00 AM to 5:00 PM"
      required
    ></civ-time-picker>
  `,
};

export const TwentyFourHour: Story = {
  name: '24-hour format',
  render: () => html`
    <civ-time-picker
      label="Hearing time"
      name="hearing_time"
      format="24"
      min="08:00"
      max="18:00"
      minute-step="15"
      hint="Times shown in 24-hour format (military time)"
    ></civ-time-picker>
  `,
};

export const Prefilled: Story = {
  name: 'Prefilled value',
  render: () => html`
    <civ-time-picker
      label="Departure time"
      name="departure"
      value="14:30"
      minute-step="15"
    ></civ-time-picker>
  `,
};

export const WithError: Story = {
  name: 'With error',
  render: () => html`
    <civ-time-picker
      label="Appointment time"
      name="appt"
      error="Please select a time during business hours (9 AM – 5 PM)"
      minute-step="15"
    ></civ-time-picker>
  `,
};

// ── Select mode (legacy variant for free-form precision) ───────

export const SelectMode: Story = {
  name: 'Select mode (three dropdowns)',
  render: () => html`
    <civ-time-picker
      mode="select"
      legend="Appointment time"
      name="appt_time"
      hint="Use the three dropdowns to pick a time"
      minute-step="30"
    ></civ-time-picker>
  `,
};

export const SelectModeFineGrained: Story = {
  name: 'Select mode — fine-grained (minute step = 1)',
  render: () => html`
    <civ-time-picker
      mode="select"
      legend="Exact time of incident"
      name="incident_time"
      minute-step="1"
      hint="Three dropdowns make minute-level precision more manageable than a 1,440-slot combobox"
    ></civ-time-picker>
  `,
};

export const SelectModeRequired: Story = {
  name: 'Select mode — required',
  render: () => html`
    <civ-time-picker
      mode="select"
      legend="When would you like to be contacted?"
      name="contact_time"
      hint="Required — we will call within 1 hour of this time"
      minute-step="30"
      required
    ></civ-time-picker>
  `,
};
