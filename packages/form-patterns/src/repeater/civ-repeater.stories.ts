import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-repeater.js';
import '@civui/inputs';
import '@civui/compound';
import '@civui/storybook-utils/demo-frame';
import '@civui/storybook-utils/demo-frame.css';

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
    disabled: false,
  },
  render: (args) => html`
    <civ-repeater
      legend="${args.legend}"
      name="${args.name}"
      item-label="${args.itemLabel}"
      hint="${args.hint}"
      error="${args.error}"
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

// What the repeater looks like AFTER a submit attempt failed validation —
// the user has at least one row but it isn't complete. This is the realistic
// "with-error" state. The previous version of this story showed the error
// alongside an empty list, which was confusing: the message implied the
// user had done something wrong before they'd had a chance to add anything.
export const WithError: Story = {
  name: 'With Error (after submit)',
  render: () => html`
    <civ-repeater
      legend="Dependents"
      name="dependents"
      item-label="dependent"
      error="Complete each dependent's name before submitting."
      min="1"
    >
      <civ-text-input label="Full name" name="fullName" required></civ-text-input>
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
      <civ-repeater legend="With error" name="error" item-label="item" error="Complete each item before submitting." min="1">
        <civ-text-input label="Name" name="name" required></civ-text-input>
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
      mode="form-steps"
      min="1"
      max="10"
      hint="Add each period of military service separately"
    >
      <div data-step-label="Branch">
        <civ-text-input label="Branch of service" name="branch" required></civ-text-input>
      </div>
      <div data-step-label="Dates">
        <civ-memorable-date legend="Service start date" required hint="Enter your best estimate if unsure" name="startDate"></civ-memorable-date>
        <civ-memorable-date legend="Service end date" required name="endDate"></civ-memorable-date>
      </div>
      <div data-step-label="Discharge">
        <civ-select label="Character of service" name="discharge" required></civ-select>
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
          .showName=${false}
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
        <civ-text-input label="Full name" name="fullName" required></civ-text-input>
        <civ-text-input label="Phone number" name="phone" required type="tel"></civ-text-input>
        <civ-text-input label="Relationship" name="relationship" required></civ-text-input>
      </div>
    </civ-repeater>
  `,
};

// ── Route Mode ────────────────────────────────────────────────
// Demoed inside <civ-demo-frame> so the multi-page flow is visible
// in the Storybook canvas. The frame intercepts anchor clicks on
// /dependents/new and /dependents/:id/edit and swaps which
// <civ-demo-page> is visible. Browser back is simulated by the
// frame's back button. See @civui/storybook-utils for the helper.

type Dependent = { id: string; firstName: string; lastName: string; relationship: string };

const initialDependents: Dependent[] = [
  { id: 'a1', firstName: 'Alex', lastName: 'Chen', relationship: 'Child' },
  { id: 'b2', firstName: 'Jordan', lastName: 'Lee', relationship: 'Spouse' },
];

export const RouteMode: Story = {
  name: 'Route Mode',
  render: () => {
    // Story-level mutable state shared between pages — mirrors what a
    // real host app does with its router/store.
    const state: { rows: Dependent[] } = { rows: [...initialDependents] };

    // The remove handler reassigns `state.rows` then writes the new
    // array onto the repeater. `e.currentTarget` IS the repeater (the
    // listener is attached directly to it via the `@civ-repeater-remove`
    // binding below), so we can assign rows on it directly — no parent
    // lookup needed.
    return html`
      <civ-demo-frame initial-path="/dependents">
        <civ-demo-page path="/dependents">
          <civ-repeater
            legend="Your dependents"
            item-label="dependent"
            mode="route"
            add-href="/dependents/new"
            edit-href-pattern="/dependents/{id}/edit"
            id-field="id"
            summary-fields="firstName,lastName"
            .rows=${state.rows}
            @civ-repeater-remove=${(e: CustomEvent) => {
              state.rows = state.rows.filter((r) => r.id !== e.detail.id);
              (e.currentTarget as { rows: Dependent[] }).rows = state.rows;
            }}
          ></civ-repeater>
        </civ-demo-page>

        <civ-demo-page path="/dependents/new">
          <h2 class="civ-heading-md">Add a dependent</h2>
          <civ-text-input label="First name" name="firstName"></civ-text-input>
          <civ-text-input label="Last name" name="lastName"></civ-text-input>
          <civ-text-input label="Relationship" name="relationship"></civ-text-input>
          <div class="civ-mt-4 civ-flex civ-gap-2">
            <civ-link href="/dependents" variant="primary" label="Save"></civ-link>
            <civ-link href="/dependents" variant="tertiary" label="Cancel"></civ-link>
          </div>
        </civ-demo-page>

        <civ-demo-page path="/dependents/:id/edit">
          <h2 class="civ-heading-md">Edit dependent</h2>
          <p class="civ-text-sm">Editing the row whose id matches the URL.</p>
          <civ-text-input label="First name" name="firstName"></civ-text-input>
          <civ-text-input label="Last name" name="lastName"></civ-text-input>
          <civ-text-input label="Relationship" name="relationship"></civ-text-input>
          <div class="civ-mt-4 civ-flex civ-gap-2">
            <civ-link href="/dependents" variant="primary" label="Save"></civ-link>
            <civ-link href="/dependents" variant="tertiary" label="Cancel"></civ-link>
          </div>
        </civ-demo-page>
      </civ-demo-frame>
    `;
  },
};

export const RouteModeEmpty: Story = {
  name: 'Route Mode: Empty State',
  render: () => html`
    <civ-demo-frame initial-path="/dependents">
      <civ-demo-page path="/dependents">
        <civ-repeater
          legend="Your dependents"
          item-label="dependent"
          mode="route"
          add-href="/dependents/new"
          edit-href-pattern="/dependents/{id}/edit"
          hint="No dependents yet — click Add to create one."
          .rows=${[]}
        ></civ-repeater>
      </civ-demo-page>
      <civ-demo-page path="/dependents/new">
        <h2 class="civ-heading-md">Add a dependent</h2>
        <civ-text-input label="First name" name="firstName"></civ-text-input>
        <div class="civ-mt-4">
          <civ-link href="/dependents" variant="tertiary" label="Cancel"></civ-link>
        </div>
      </civ-demo-page>
    </civ-demo-frame>
  `,
};
