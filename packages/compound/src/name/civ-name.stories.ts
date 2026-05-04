import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-name.js';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Compound/Name',
  component: 'civ-name',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showMiddle: { control: 'boolean' },
    showSuffix: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Your name',
    name: 'applicantName',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-name
      legend="${args.legend}"
      name="${args.name}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-name>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'With Prefilled Value',
  render: () => html`
    <civ-name legend="Your name" name="applicant"></civ-name>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.nameValue = { first: 'Jane', middle: 'A', last: 'Doe', suffix: '' };
  },
};

export const WithError: Story = {
  render: () => html`
    <civ-name
      legend="Your name"
      name="applicant"
      required
      first-error="Enter a first name"
      last-error="Enter a last name"
    ></civ-name>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-name legend="Veteran's name" name="veteran" required></civ-name>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-name legend="Your name" name="applicant" disabled></civ-name>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-name legend="Normal" name="normal"></civ-name>
      <civ-name legend="With errors" name="errors" required first-error="Enter a first name" last-error="Enter a last name"></civ-name>
      <civ-name legend="Required" name="required" required></civ-name>
      <civ-name legend="Disabled" name="disabled" disabled></civ-name>
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
        <civ-name legend="Your name" name="dense-name"></civ-name>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-name legend="Your name" name="default-name"></civ-name>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-name legend="Your name" name="spacious-name"></civ-name>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const WithoutMiddle: Story = {
  name: 'Without Middle Name',
  render: () => html`
    <civ-name legend="Spouse's name" name="spouse"></civ-name>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.showMiddle = false;
  },
};

export const WithoutSuffix: Story = {
  name: 'Without Suffix',
  render: () => html`
    <civ-name legend="Your name" name="n"></civ-name>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-name') as any;
    el.showSuffix = false;
  },
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentIdentitySection: Story = {
  name: 'Usage: Identity Section',
  render: () => html`
    <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Personal information</h3>
    <civ-name legend="Veteran's name" name="veteranName" required></civ-name>
    <civ-memorable-date
      label="Date of birth"
      name="dateOfBirth"
      required
      hint="For example: January 15 1990"
    ></civ-memorable-date>
  `,
};
