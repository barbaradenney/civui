import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-repeater.js';
import '@civui/inputs';
import '@civui/compound';

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
    <div class="civ-flex civ-flex-col civ-gap-8">
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
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-repeater legend="Dependents" name="dense-deps" item-label="dependent">
          <civ-text-input label="Full name" name="fullName"></civ-text-input>
        </civ-repeater>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-repeater legend="Dependents" name="default-deps" item-label="dependent">
          <civ-text-input label="Full name" name="fullName"></civ-text-input>
        </civ-repeater>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
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
      <civ-memorable-date label="Service start date" name="startDate" required hint="Enter your best estimate if unsure"></civ-memorable-date>
      <civ-memorable-date label="Service end date" name="endDate" required></civ-memorable-date>
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

// ── Wizard Mode ──────────────────────────────────────────────

export const WizardMode: Story = {
  name: 'Wizard Mode',
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      mode="wizard"
    >
      <div data-step-label="Name">
        <civ-text-input label="First name" name="firstName" required></civ-text-input>
        <civ-text-input label="Last name" name="lastName" required></civ-text-input>
      </div>
      <div data-step-label="Contact">
        <civ-text-input label="Email" name="email" type="email"></civ-text-input>
        <civ-text-input label="Phone" name="phone" type="tel"></civ-text-input>
      </div>
    </civ-repeater>
  `,
};

export const WizardWithRelationship: Story = {
  name: 'Wizard: VA Dependents',
  render: () => html`
    <civ-repeater
      legend="Your dependents"
      name="dependents"
      item-label="dependent"
      mode="wizard"
      max="10"
    >
      <div data-step-label="Name">
        <civ-name legend="Dependent's name" name="name" required></civ-name>
      </div>
      <div data-step-label="Relationship">
        <civ-relationship
          legend="Relationship details"
          name="rel"
          preset="va-dependent"
          show-name="false"
          show-adoption-date
          required
        ></civ-relationship>
      </div>
    </civ-repeater>
  `,
};

export const WizardWithMax: Story = {
  name: 'Wizard: Max 3 Items',
  render: () => html`
    <civ-repeater
      legend="Emergency contacts"
      name="contacts"
      item-label="contact"
      mode="wizard"
      max="3"
    >
      <div data-step-label="Contact info">
        <civ-text-input label="Full name" name="fullName" required></civ-text-input>
        <civ-text-input label="Phone number" name="phone" type="tel" required></civ-text-input>
        <civ-text-input label="Relationship" name="relationship" required></civ-text-input>
      </div>
    </civ-repeater>
  `,
};
