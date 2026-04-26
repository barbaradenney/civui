import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-memorable-date.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Memorable Date',
  component: 'civ-memorable-date',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
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
    legend: 'Date of birth',
    name: 'dob',
    value: '',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-memorable-date
      legend="${args.legend}"
      name="${args.name}"
      value="${args.value}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-memorable-date>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 15 1990"
    ></civ-memorable-date>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      error="Enter a valid date of birth"
      hint="For example: January 15 1990"
    ></civ-memorable-date>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      hint="For example: January 15 1990"
      required
    ></civ-memorable-date>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      value="1990-07-04"
      disabled
    ></civ-memorable-date>
  `,
};

export const Prefilled: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Date of birth"
      name="dob"
      value="1990-07-04"
    ></civ-memorable-date>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-memorable-date legend="Normal" name="normal"></civ-memorable-date>
      <civ-memorable-date legend="With hint" name="hint" hint="For example: January 15 1990"></civ-memorable-date>
      <civ-memorable-date legend="With error" name="error" error="Enter a valid date" hint="For example: January 15 1990"></civ-memorable-date>
      <civ-memorable-date legend="Required" name="required" required></civ-memorable-date>
      <civ-memorable-date legend="Disabled" name="disabled" value="1990-07-04" disabled></civ-memorable-date>
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
        <civ-memorable-date legend="Date of birth" name="dense-dob" hint="For example: January 15 1990"></civ-memorable-date>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-memorable-date legend="Date of birth" name="default-dob" hint="For example: January 15 1990"></civ-memorable-date>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-memorable-date legend="Date of birth" name="spacious-dob" hint="For example: January 15 1990"></civ-memorable-date>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const CustomLabels: Story = {
  render: () => html`
    <civ-memorable-date
      legend="Fecha de nacimiento"
      name="dob"
      month-label="Mes"
      day-label="Dia"
      year-label="Ano"
      hint="Por ejemplo: enero 15 1990"
    ></civ-memorable-date>
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
      <civ-memorable-date
        legend="Date of birth"
        name="dob"
        hint="For example: January 15 1990"
        required
      ></civ-memorable-date>
      <civ-memorable-date
        legend="Date of marriage (if applicable)"
        name="marriage-date"
        hint="For example: June 10 2015"
      ></civ-memorable-date>
      <civ-button type="submit" class="civ-mt-4">Verify</civ-button>
    </form>
  `,
};
