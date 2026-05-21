import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-toggle.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Toggle',
  component: 'civ-toggle',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    description: { control: 'text' },
    checked: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Email notifications',
    name: 'email-notifications',
    checked: false,
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-toggle
      label="${args.label}"
      name="${args.name}"
      ?checked="${args.checked}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-toggle>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-toggle
      label="Auto-save drafts"
      name="autosave"
      hint="Automatically saves your form progress every 30 seconds"
    ></civ-toggle>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-toggle
      label="Accept terms of service"
      name="terms"
      error="You must accept the terms to continue"
      required
    ></civ-toggle>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-toggle
      label="Accept privacy policy"
      name="privacy"
      required
    ></civ-toggle>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-toggle label="System preference (locked)" name="locked" disabled checked></civ-toggle>
  `,
};

export const WithDescription: Story = {
  render: () => html`
    <civ-toggle
      label="Two-factor authentication"
      name="2fa"
      description="Adds an extra layer of security to your account by requiring a code from your phone"
    ></civ-toggle>
  `,
};

export const DescriptionVsHint: Story = {
  name: 'Description vs Hint',
  parameters: {
    docs: {
      description: {
        story:
          '`description` and `hint` are two distinct text affordances and read differently. ' +
          '**Description** is the expanded "what this setting actually does" narrative — darker color (base-dark) for stronger emphasis. ' +
          '**Hint** is a smaller clarification / format / availability cue — lighter color (base-default) and reads as secondary. ' +
          'Use description when the user needs explanation; use hint for short qualifiers (e.g. "Beta", "Requires sign-in").',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-toggle
        label="Description only"
        name="desc-only"
        description="Receive weekly summary emails about activity on your account, including new messages and benefits updates"
      ></civ-toggle>
      <civ-toggle
        label="Hint only"
        name="hint-only"
        hint="Beta feature"
      ></civ-toggle>
      <civ-toggle
        label="Both description and hint"
        name="both"
        description="Auto-saves your form progress every 30 seconds so you don't lose work if your session times out"
        hint="Stored locally — never sent to our servers"
      ></civ-toggle>
    </div>
  `,
};

export const Readonly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`readonly` is distinct from `disabled`. The toggle still shows its current value at full contrast and is announced to screen readers via `aria-readonly`. Click is suppressed and the cursor changes to the default arrow (instead of the pointer hand) to signal "this is informational, not interactive." Use for review / summary surfaces where the value should be visible but not editable.',
      },
    },
  },
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-toggle label="Notifications (off)" name="ro-off" readonly></civ-toggle>
      <civ-toggle label="Notifications (on)" name="ro-on" readonly checked></civ-toggle>
    </div>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-toggle label="Normal (off)" name="normal"></civ-toggle>
      <civ-toggle label="Checked (on)" name="checked" checked></civ-toggle>
      <civ-toggle label="With hint" name="hint" hint="Additional context about this setting"></civ-toggle>
      <civ-toggle label="With error" name="error" error="This setting is required" required></civ-toggle>
      <civ-toggle label="Disabled (off)" name="disabled-off" disabled></civ-toggle>
      <civ-toggle label="Disabled (on)" name="disabled-on" disabled checked></civ-toggle>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-toggle label="Email notifications" name="dense-notif" description="Receive weekly digest emails"></civ-toggle>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-toggle label="Email notifications" name="default-notif" description="Receive weekly digest emails"></civ-toggle>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-toggle label="Email notifications" name="spacious-notif" description="Receive weekly digest emails"></civ-toggle>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentNotificationSettings: Story = {
  name: 'Usage: Notification Preferences',
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const values = Array.from(fd.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        alert('Saved: ' + values);
      }}
    >
      <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Communication preferences</h3>
      <civ-toggle
        label="Application status updates"
        name="status-updates"
        description="Get notified when your application status changes"
        checked
      ></civ-toggle>
      <civ-toggle
        label="Appointment reminders"
        name="reminders"
        description="Receive reminders 24 hours before scheduled appointments"
        checked
      ></civ-toggle>
      <civ-toggle
        label="Policy change alerts"
        name="policy-alerts"
        description="Be notified when policies affecting your benefits change"
      ></civ-toggle>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <civ-button type="submit">Save preferences</civ-button>
      </div>
    </form>
  `,
};
