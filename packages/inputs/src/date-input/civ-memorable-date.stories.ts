import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-memorable-date.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Memorable Date',
  component: 'civ-memorable-date',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
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

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Date of birth',
    name: 'dob',
    value: '',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-form-fieldset
      legend="${args.label}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-memorable-date
        name="${args.name}"
        value="${args.value}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990">
      <civ-memorable-date name="dob"></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-fieldset legend="Date of birth" error="Enter a valid date of birth" hint="For example: January 15 1990">
      <civ-memorable-date name="dob"></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990" required>
      <civ-memorable-date name="dob" required></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-fieldset legend="Date of birth" disabled>
      <civ-memorable-date name="dob" value="1990-07-04" disabled></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

export const Prefilled: Story = {
  render: () => html`
    <civ-form-fieldset legend="Date of birth">
      <civ-memorable-date name="dob" value="1990-07-04"></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-form-fieldset legend="Normal">
        <civ-memorable-date name="normal"></civ-memorable-date>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With hint" hint="For example: January 15 1990">
        <civ-memorable-date name="hint"></civ-memorable-date>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With error" error="Enter a valid date" hint="For example: January 15 1990">
        <civ-memorable-date name="error"></civ-memorable-date>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Required" required>
        <civ-memorable-date name="required" required></civ-memorable-date>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Disabled" disabled>
        <civ-memorable-date name="disabled" value="1990-07-04" disabled></civ-memorable-date>
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
        <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990">
          <civ-memorable-date name="dense-dob"></civ-memorable-date>
        </civ-form-fieldset>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990">
          <civ-memorable-date name="default-dob"></civ-memorable-date>
        </civ-form-fieldset>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990">
          <civ-memorable-date name="spacious-dob"></civ-memorable-date>
        </civ-form-fieldset>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const CustomLabels: Story = {
  render: () => html`
    <civ-form-fieldset legend="Fecha de nacimiento" hint="Por ejemplo: enero 15 1990">
      <civ-memorable-date
        name="dob"
        month-label="Mes"
        day-label="Dia"
        year-label="Ano"
      ></civ-memorable-date>
    </civ-form-fieldset>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentIdentityVerification: Story = {
  name: 'Usage: Identity Verification',
  render: () => html`
    <form
      @submit="${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data)));
      }}"
    >
      <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Verify your identity</h3>
      <civ-form-fieldset legend="Date of birth" hint="For example: January 15 1990" required>
        <civ-memorable-date name="dob" required></civ-memorable-date>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Date of marriage (if applicable)" hint="For example: June 10 2015">
        <civ-memorable-date name="marriage-date"></civ-memorable-date>
      </civ-form-fieldset>
      <civ-button type="submit" class="civ-mt-4">Verify</civ-button>
    </form>
  `,
};
