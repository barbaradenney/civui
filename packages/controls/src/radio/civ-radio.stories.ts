import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-radio.js';
import './civ-radio-group.js';
import '@civui/ui';

const meta: Meta = {
  title: 'Forms/Inputs/Radio',
  component: 'civ-radio-group',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    tile: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Contact preference',
    name: 'contact',
    value: '',
    hint: '',
    error: '',
    tile: false,
    required: false,
    disabled: false,
    orientation: 'vertical',
  },
  render: (args) => html`
    <civ-radio-group
      legend="${args.legend}"
      name="${args.name}"
      value="${args.value}"
      hint="${args.hint}"
      error="${args.error}"
      ?tile="${args.tile}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      orientation="${args.orientation}"
    >
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-radio-group legend="Preferred contact method" name="contact" hint="How should we reach you about your application?">
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="U.S. Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-radio-group legend="Preferred contact method" name="contact" error="Select a contact method to continue" required>
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="U.S. Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-radio-group legend="Preferred contact method" name="contact" required>
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="U.S. Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-radio-group legend="Preferred contact method" name="contact" value="email" disabled>
      <civ-radio label="Email" value="email"></civ-radio>
      <civ-radio label="Phone" value="phone"></civ-radio>
      <civ-radio label="U.S. Mail" value="mail"></civ-radio>
    </civ-radio-group>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <civ-radio-group legend="Normal" name="normal">
        <civ-radio label="Option A" value="a"></civ-radio>
        <civ-radio label="Option B" value="b"></civ-radio>
      </civ-radio-group>
      <civ-radio-group legend="With hint" name="hint" hint="Select one option">
        <civ-radio label="Option A" value="a"></civ-radio>
        <civ-radio label="Option B" value="b"></civ-radio>
      </civ-radio-group>
      <civ-radio-group legend="With error" name="error" error="Select an option" required>
        <civ-radio label="Option A" value="a"></civ-radio>
        <civ-radio label="Option B" value="b"></civ-radio>
      </civ-radio-group>
      <civ-radio-group legend="Disabled" name="disabled" value="a" disabled>
        <civ-radio label="Option A" value="a"></civ-radio>
        <civ-radio label="Option B" value="b"></civ-radio>
      </civ-radio-group>
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
        <civ-radio-group legend="Contact preference" name="dense-contact">
          <civ-radio label="Email" value="email"></civ-radio>
          <civ-radio label="Phone" value="phone"></civ-radio>
          <civ-radio label="Mail" value="mail"></civ-radio>
        </civ-radio-group>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-radio-group legend="Contact preference" name="default-contact">
          <civ-radio label="Email" value="email"></civ-radio>
          <civ-radio label="Phone" value="phone"></civ-radio>
          <civ-radio label="Mail" value="mail"></civ-radio>
        </civ-radio-group>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-radio-group legend="Contact preference" name="spacious-contact">
          <civ-radio label="Email" value="email"></civ-radio>
          <civ-radio label="Phone" value="phone"></civ-radio>
          <civ-radio label="Mail" value="mail"></civ-radio>
        </civ-radio-group>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const TileVariant: Story = {
  render: () => html`
    <civ-radio-group legend="Account type" name="account-type" tile>
      <civ-radio
        label="Checking"
        value="checking"
        description="For everyday transactions and direct deposit"
      ></civ-radio>
      <civ-radio
        label="Savings"
        value="savings"
        description="For long-term savings with interest"
      ></civ-radio>
    </civ-radio-group>
  `,
};

export const Horizontal: Story = {
  render: () => html`
    <civ-radio-group legend="Preferred language" name="language" orientation="horizontal">
      <civ-radio label="English" value="en"></civ-radio>
      <civ-radio label="Spanish" value="es"></civ-radio>
      <civ-radio label="Chinese" value="zh"></civ-radio>
    </civ-radio-group>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <civ-radio-group legend="Appointment type" name="appointment">
      <civ-radio
        label="In person"
        value="in-person"
        description="Visit your local office for a face-to-face meeting"
      ></civ-radio>
      <civ-radio
        label="Phone call"
        value="phone"
        description="We will call you at your listed phone number"
      ></civ-radio>
      <civ-radio
        label="Video conference"
        value="video"
        description="Join a secure video call from any device"
      ></civ-radio>
    </civ-radio-group>
  `,
};

// ── Trauma-informed: prefer-not-to-answer affordance ─────────

export const WithPreferNotToAnswer: Story = {
  name: 'With "Prefer not to answer" affordance',
  render: () => html`
    <civ-radio-group
      legend="Do you identify as Hispanic or Latino?"
      name="ethnicity"
      skip-label="Prefer not to answer"
      skip-value="prefer_not_to_say"
      hint="This information is optional and used only for program reporting."
    >
      <civ-radio label="Yes" value="yes"></civ-radio>
      <civ-radio label="No" value="no"></civ-radio>
    </civ-radio-group>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentEligibilityForm: Story = {
  name: 'Usage: Eligibility Questions',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <civ-radio-group legend="What is your relationship to the Veteran?" name="relationship" required>
        <civ-radio label="I am the Veteran" value="self"></civ-radio>
        <civ-radio label="Spouse" value="spouse"></civ-radio>
        <civ-radio label="Dependent child" value="child"></civ-radio>
        <civ-radio label="Caregiver" value="caregiver"></civ-radio>
      </civ-radio-group>
      <civ-button type="submit" class="civ-mt-4">Continue</civ-button>
    </form>
  `,
};
