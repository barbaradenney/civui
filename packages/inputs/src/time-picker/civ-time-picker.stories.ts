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

**Three input modes:**

- **\`mode="combo"\` (default)** — a single typeable combobox with pre-built
  slots driven by \`minute-step\`. Users can type to filter (\`"230"\` →
  "2:30 AM"/"2:30 PM") or pick from the dropdown. Matches the [USWDS time
  picker](https://designsystem.digital.gov/components/time-picker/) pattern.
  Optional \`min\` / \`max\` bounds restrict slots to business hours. Best
  for scheduling — appointments, hearing times, callback windows.

- **\`mode="select"\`** — hour + minute selects plus an AM/PM segmented
  control. Predictable picking for discrete time choices.

- **\`mode="text"\`** — a single masked text input (\`HH:MM\`) plus the
  AM/PM segmented control. Best for arbitrary precision — incident
  reports, medical event times, "exactly when did this happen"
  prompts where the user knows the time and a slot grid would slow
  them down. \`minute-step\` is ignored.

For known past dates use \`civ-memorable-date\`; for future dates use
\`civ-date-picker\`.
        `,
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['combo', 'select', 'text'] },
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

// ── Text mode (arbitrary precision: incident times, exact event times) ──

export const TextMode: Story = {
  name: 'Text mode (free-form HH:MM)',
  render: () => html`
    <civ-time-picker
      mode="text"
      label="Time of incident"
      name="incident_time"
      hint="Type the time as accurately as you remember (e.g. 2:34)"
    ></civ-time-picker>
  `,
};

export const TextMode24Hour: Story = {
  name: 'Text mode — 24-hour (no AM/PM)',
  render: () => html`
    <civ-time-picker
      mode="text"
      label="Event timestamp"
      name="event_time"
      format="24"
      hint="Enter the time in 24-hour format (e.g. 14:34)"
    ></civ-time-picker>
  `,
};

export const TextModeRequired: Story = {
  name: 'Text mode — required',
  render: () => html`
    <civ-time-picker
      mode="text"
      label="Exact time of fall"
      name="fall_time"
      hint="Required — used to calculate symptom onset"
      required
    ></civ-time-picker>
  `,
};

export const BookedSlots: Story = {
  name: 'Booked slots (disabled-slots)',
  render: () => html`
    <civ-time-picker
      label="Appointment time"
      name="appt_time"
      min="09:00"
      max="12:00"
      minute-step="30"
      .disabledSlots=${['09:00', '09:30', '11:00']}
      hint="Greyed times are already booked. Type to filter or pick from the list."
      required
    ></civ-time-picker>
  `,
};

export const MinNow: Story = {
  name: 'min="now" — no past times today',
  render: () => html`
    <civ-time-picker
      label="Callback time"
      name="callback_time"
      min="now"
      minute-step="30"
      hint="Only future times are offered. The list updates relative to your device clock."
    ></civ-time-picker>
  `,
};

export const WithNowButton: Story = {
  name: 'With "Now" quick-button (show-now-button)',
  parameters: {
    docs: {
      description: {
        story:
          'The Now quick-button is **opt-in** via `show-now-button`. Use it on forms where "current time" is a meaningful starting point — incident reports, callback scheduling, or paired with `min="now"` to bias the picker toward "right now-ish".',
      },
    },
  },
  render: () => html`
    <civ-time-picker
      label="When did the incident occur?"
      name="incident_time"
      mode="text"
      hint="Tap Now to anchor to the current time, then adjust as needed."
      show-now-button
    ></civ-time-picker>
  `,
};

