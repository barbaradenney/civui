import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-repeater.js';
import '@civui/inputs';

const meta: Meta = {
  title: 'Forms/Patterns/Repeater',
  component: 'civ-repeater',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    itemLabel: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Dependents',
    name: 'dependents',
    itemLabel: 'dependent',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-repeater
      legend="${args.legend}"
      name="${args.name}"
      item-label="${args.itemLabel}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      hint="Add each dependent you are claiming on this application"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      error="At least one dependent must be listed"
      required
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      required
      min="1"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      disabled
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <civ-repeater legend="Normal" name="normal" item-label="item">
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-repeater>
      <civ-repeater legend="With hint" name="hint" item-label="item" hint="Add items as needed">
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-repeater>
      <civ-repeater legend="With error" name="error" item-label="item" error="Add at least one item" required>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-repeater>
      <civ-repeater legend="Disabled" name="disabled" item-label="item" disabled>
        <civ-text-input label="Name" name="name"></civ-text-input>
      </civ-repeater>
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
        <civ-repeater legend="Dependents" name="dense-deps" item-label="dependent">
          <civ-text-input label="Full name" name="fullName"></civ-text-input>
        </civ-repeater>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-repeater legend="Dependents" name="default-deps" item-label="dependent">
          <civ-text-input label="Full name" name="fullName"></civ-text-input>
        </civ-repeater>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-repeater legend="Dependents" name="spacious-deps" item-label="dependent">
          <civ-text-input label="Full name" name="fullName"></civ-text-input>
        </civ-repeater>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const MinMax: Story = {
  name: 'Min/Max Rows',
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      min="1"
      max="5"
      hint="You must list at least 1 and no more than 5 dependents"
    >
      <civ-text-input label="Full name" name="fullName"></civ-text-input>
    </civ-repeater>
  `,
};

export const MultipleFields: Story = {
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
    >
      <civ-text-input label="First name" name="firstName"></civ-text-input>
      <civ-text-input label="Last name" name="lastName"></civ-text-input>
    </civ-repeater>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentServicePeriods: Story = {
  name: 'Usage: Service Periods',
  render: () => html`
    <civ-repeater
      legend="Service periods"
      name="servicePeriods"
      item-label="service period"
      mode="detail"
      min="1"
      max="10"
      hint="Add each period of military service separately"
    >
      <civ-text-input label="Branch of service" name="branch" required></civ-text-input>
      <civ-memorable-date legend="Service start date" name="startDate" required hint="Enter your best estimate if unsure"></civ-memorable-date>
      <civ-memorable-date legend="Service end date" name="endDate" required></civ-memorable-date>
      <civ-select label="Character of service" name="discharge" required></civ-select>
    </civ-repeater>
  `,
  play: async ({ canvasElement }) => {
    const selects = canvasElement.querySelectorAll('civ-select') as NodeListOf<any>;
    const options = [
      { value: 'honorable', label: 'Honorable' },
      { value: 'general', label: 'General (under honorable conditions)' },
      { value: 'other', label: 'Other than honorable' },
    ];
    selects.forEach(s => { s.options = options; });
  },
};
