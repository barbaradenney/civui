import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/inputs';
import '@civui/controls';
import '../name/civ-name.js';
import './civ-deceased-person.js';

const meta: Meta = {
  title: 'Forms/Compound/Deceased Person',
  component: 'civ-deceased-person',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hideRelationship: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'About the person who died',
    name: 'deceased',
    required: false,
    disabled: false,
    hideRelationship: false,
  },
  render: (args) => html`
    <civ-deceased-person
      legend="${args.legend}"
      name="${args.name}"
      hint="${args.hint ?? ''}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      ?hide-relationship="${args.hideRelationship}"
    ></civ-deceased-person>
  `,
};

// ── VA burial benefit context ────────────────────────────────

export const ForVaBurialBenefit: Story = {
  name: 'For VA burial benefit (21P-530)',
  render: () => html`
    <civ-deceased-person
      legend="About the Veteran who died"
      name="veteran"
      hint="We'll use this information to confirm their eligibility for burial benefits."
      required
    ></civ-deceased-person>
  `,
};

// ── Prefilled value ──────────────────────────────────────────

export const Prefilled: Story = {
  render: () => html`
    <civ-deceased-person legend="About your spouse" name="spouse"></civ-deceased-person>
  `,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('civ-deceased-person') as any;
    el.personValue = {
      first: 'Jane',
      middle: 'A',
      last: 'Doe',
      suffix: '',
      dateOfBirth: '1950-06-15',
      dateOfDeath: '2024-03-08',
      relationship: 'spouse',
    };
  },
};

// ── Without the relationship field ───────────────────────────

export const WithoutRelationship: Story = {
  name: 'Without relationship (when captured elsewhere)',
  render: () => html`
    <civ-deceased-person
      legend="About your spouse"
      name="spouse"
      hide-relationship
    ></civ-deceased-person>
  `,
};

// ── With field-level errors ──────────────────────────────────

export const WithFieldErrors: Story = {
  render: () => html`
    <civ-deceased-person
      legend="About the person who died"
      name="deceased"
      name-error="Enter a first and last name"
      date-of-death-error="Enter the date of death"
      required
    ></civ-deceased-person>
  `,
};
