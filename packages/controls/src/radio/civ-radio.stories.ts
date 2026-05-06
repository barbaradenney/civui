import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-radio.js';
import './civ-radio-group.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Controls/Radio',
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
    required: false,
    disabled: false,
    orientation: 'vertical',
  },
  render: (args) => html`
    <civ-form-fieldset
      legend="${args.legend}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-radio-group
        name="${args.name}"
        value="${args.value}"
        ?tile="${args.tile}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
        orientation="${args.orientation}"
      >
        <civ-radio label="Email" value="email"></civ-radio>
        <civ-radio label="Phone" value="phone"></civ-radio>
        <civ-radio label="Mail" value="mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-fieldset legend="Preferred contact method" hint="How should we reach you about your application?">
      <civ-radio-group name="contact">
        <civ-radio label="Email" value="email"></civ-radio>
        <civ-radio label="Phone" value="phone"></civ-radio>
        <civ-radio label="U.S. Mail" value="mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-fieldset legend="Preferred contact method" error="Select a contact method to continue" required>
      <civ-radio-group name="contact" required>
        <civ-radio label="Email" value="email"></civ-radio>
        <civ-radio label="Phone" value="phone"></civ-radio>
        <civ-radio label="U.S. Mail" value="mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-fieldset legend="Preferred contact method" required>
      <civ-radio-group name="contact" required>
        <civ-radio label="Email" value="email"></civ-radio>
        <civ-radio label="Phone" value="phone"></civ-radio>
        <civ-radio label="U.S. Mail" value="mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-fieldset legend="Preferred contact method" disabled>
      <civ-radio-group name="contact" value="email" disabled>
        <civ-radio label="Email" value="email"></civ-radio>
        <civ-radio label="Phone" value="phone"></civ-radio>
        <civ-radio label="U.S. Mail" value="mail"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-form-fieldset legend="Normal">
        <civ-radio-group name="normal">
          <civ-radio label="Option A" value="a"></civ-radio>
          <civ-radio label="Option B" value="b"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With hint" hint="Select one option">
        <civ-radio-group name="hint">
          <civ-radio label="Option A" value="a"></civ-radio>
          <civ-radio label="Option B" value="b"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With error" error="Select an option" required>
        <civ-radio-group name="error" required>
          <civ-radio label="Option A" value="a"></civ-radio>
          <civ-radio label="Option B" value="b"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Disabled" disabled>
        <civ-radio-group name="disabled" value="a" disabled>
          <civ-radio label="Option A" value="a"></civ-radio>
          <civ-radio label="Option B" value="b"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>
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
        <civ-form-fieldset legend="Contact preference">
          <civ-radio-group name="dense-contact">
            <civ-radio label="Email" value="email"></civ-radio>
            <civ-radio label="Phone" value="phone"></civ-radio>
            <civ-radio label="Mail" value="mail"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-fieldset legend="Contact preference">
          <civ-radio-group name="default-contact">
            <civ-radio label="Email" value="email"></civ-radio>
            <civ-radio label="Phone" value="phone"></civ-radio>
            <civ-radio label="Mail" value="mail"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-fieldset legend="Contact preference">
          <civ-radio-group name="spacious-contact">
            <civ-radio label="Email" value="email"></civ-radio>
            <civ-radio label="Phone" value="phone"></civ-radio>
            <civ-radio label="Mail" value="mail"></civ-radio>
          </civ-radio-group>
        </civ-form-fieldset>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const TileVariant: Story = {
  render: () => html`
    <civ-form-fieldset legend="Account type">
      <civ-radio-group name="account-type">
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
    </civ-form-fieldset>
  `,
};

export const ListVariant: Story = {
  name: 'List variant (joined tiles)',
  parameters: {
    docs: {
      description: {
        story: `
Set \`variant="list"\` on the group to collapse the gap between tiles.
Adjacent tiles share a single 1px border and only the first / last tile
keep rounded corners — useful for dense option lists like ethnicity
selection or single-choice surveys.

Only takes effect with \`tile\` (the default) and vertical orientation.
        `,
      },
    },
  },
  render: () => html`
    <civ-form-fieldset legend="Ethnicity">
      <civ-radio-group name="ethnicity" variant="list">
        <civ-radio label="Hispanic or Latino" value="hispanic"></civ-radio>
        <civ-radio label="Not Hispanic or Latino" value="not-hispanic"></civ-radio>
        <civ-radio label="Prefer not to answer" value="skip"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const Horizontal: Story = {
  render: () => html`
    <civ-form-fieldset legend="Preferred language">
      <civ-radio-group name="language" orientation="horizontal">
        <civ-radio label="English" value="en"></civ-radio>
        <civ-radio label="Spanish" value="es"></civ-radio>
        <civ-radio label="Chinese" value="zh"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <civ-form-fieldset legend="Appointment type">
      <civ-radio-group name="appointment">
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
    </civ-form-fieldset>
  `,
};

// ── Trauma-informed: prefer-not-to-answer affordance ─────────

export const WithPreferNotToAnswer: Story = {
  name: 'With "Prefer not to answer" affordance',
  render: () => html`
    <civ-form-fieldset legend="Do you identify as Hispanic or Latino?" hint="This information is optional and used only for program reporting.">
      <civ-radio-group
        name="ethnicity"
        skip-label="Prefer not to answer"
        skip-value="prefer_not_to_say"
      >
        <civ-radio label="Yes" value="yes"></civ-radio>
        <civ-radio label="No" value="no"></civ-radio>
      </civ-radio-group>
    </civ-form-fieldset>
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
      <civ-form-fieldset legend="What is your relationship to the Veteran?" required>
        <civ-radio-group name="relationship" required>
          <civ-radio label="I am the Veteran" value="self"></civ-radio>
          <civ-radio label="Spouse" value="spouse"></civ-radio>
          <civ-radio label="Dependent child" value="child"></civ-radio>
          <civ-radio label="Caregiver" value="caregiver"></civ-radio>
        </civ-radio-group>
      </civ-form-fieldset>
      <civ-button type="submit" class="civ-mt-4">Continue</civ-button>
    </form>
  `,
};
