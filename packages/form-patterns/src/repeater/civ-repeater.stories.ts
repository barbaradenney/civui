import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-repeater.js';
import '@civui/inputs';
import '@civui/compound';

const meta: Meta = {
  title: 'Forms/Form/Repeater',
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
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
    </civ-repeater>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-repeater legend="Normal" name="normal" item-label="item">
        <civ-form-field label="Name">
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </civ-repeater>
      <civ-repeater legend="With hint" name="hint" item-label="item" hint="Add items as needed">
        <civ-form-field label="Name">
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </civ-repeater>
      <civ-repeater legend="With error" name="error" item-label="item" error="Add at least one item" required>
        <civ-form-field label="Name">
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </civ-repeater>
      <civ-repeater legend="Disabled" name="disabled" item-label="item" disabled>
        <civ-form-field label="Name">
          <civ-text-input name="name"></civ-text-input>
        </civ-form-field>
      </civ-repeater>
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
        <civ-repeater legend="Dependents" name="dense-deps" item-label="dependent">
          <civ-form-field label="Full name">
            <civ-text-input name="fullName"></civ-text-input>
          </civ-form-field>
        </civ-repeater>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-repeater legend="Dependents" name="default-deps" item-label="dependent">
          <civ-form-field label="Full name">
            <civ-text-input name="fullName"></civ-text-input>
          </civ-form-field>
        </civ-repeater>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-repeater legend="Dependents" name="spacious-deps" item-label="dependent">
          <civ-form-field label="Full name">
            <civ-text-input name="fullName"></civ-text-input>
          </civ-form-field>
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
      <civ-form-field label="Full name">
        <civ-text-input name="fullName"></civ-text-input>
      </civ-form-field>
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
      <civ-form-field label="First name">
        <civ-text-input name="firstName"></civ-text-input>
      </civ-form-field>
      <civ-form-field label="Last name">
        <civ-text-input name="lastName"></civ-text-input>
      </civ-form-field>
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
      mode="form-steps"
      min="1"
      max="10"
      hint="Add each period of military service separately"
    >
      <div data-step-label="Branch">
        <civ-form-field label="Branch of service" required>
          <civ-text-input name="branch" required></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Dates">
        <civ-memorable-date legend="Service start date" required hint="Enter your best estimate if unsure" name="startDate"></civ-memorable-date>
        <civ-memorable-date legend="Service end date" required name="endDate"></civ-memorable-date>
      </div>
      <div data-step-label="Discharge">
        <civ-form-field label="Character of service" required>
          <civ-select name="discharge" required></civ-select>
        </civ-form-field>
      </div>
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

// ── Form Steps Mode ──────────────────────────────────────────

export const FormStepsMode: Story = {
  name: 'Form Steps Mode',
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      mode="form-steps"
    >
      <div data-step-label="Name">
        <civ-form-field label="First name" required>
          <civ-text-input name="firstName" required></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Last name" required>
          <civ-text-input name="lastName" required></civ-text-input>
        </civ-form-field>
      </div>
      <div data-step-label="Contact">
        <civ-form-field label="Email">
          <civ-text-input name="email" type="email"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Phone">
          <civ-text-input name="phone" type="tel"></civ-text-input>
        </civ-form-field>
      </div>
    </civ-repeater>
  `,
};

export const FormStepsWithRelationship: Story = {
  name: 'Form Steps: Dependents',
  render: () => html`
    <civ-repeater
      legend="Your dependents"
      name="dependents"
      item-label="dependent"
      mode="form-steps"
      max="10"
    >
      <div data-step-label="Name">
        <civ-name legend="Dependent's name" name="name" required></civ-name>
      </div>
      <div data-step-label="Relationship">
        <civ-relationship
          legend="Relationship details"
          name="rel"
          preset="dependent"
          show-name="false"
          show-adoption-date
          required
        ></civ-relationship>
      </div>
    </civ-repeater>
  `,
};

export const FormStepsWithMax: Story = {
  name: 'Form Steps: Max 3 Items',
  render: () => html`
    <civ-repeater
      legend="Emergency contacts"
      name="contacts"
      item-label="contact"
      mode="form-steps"
      max="3"
    >
      <div data-step-label="Contact info">
        <civ-form-field label="Full name" required>
          <civ-text-input name="fullName" required></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Phone number" required>
          <civ-text-input name="phone" type="tel" required></civ-text-input>
        </civ-form-field>
        <civ-form-field label="Relationship" required>
          <civ-text-input name="relationship" required></civ-text-input>
        </civ-form-field>
      </div>
    </civ-repeater>
  `,
};
