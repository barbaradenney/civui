import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@civui/core';
import './civ-yes-no.js';
import '@civui/actions';

const meta: Meta = {
  title: 'Forms/Inputs/Yes No',
  component: 'civ-yes-no',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'select', options: ['', 'yes', 'no', 'unsure'] },
    hint: { control: 'text' },
    error: { control: 'text' },
    yesLabel: { control: 'text' },
    noLabel: { control: 'text' },
    unsureLabel: { control: 'text' },
    unsureValue: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Are you a U.S. citizen?',
    name: 'citizen',
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
      <civ-yes-no
        name="${args.name}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-yes-no>
    </civ-form-fieldset>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-fieldset legend="Have you filed federal income taxes this year?" hint="This refers to federal income taxes for the current calendar year">
      <civ-yes-no name="taxes"></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-fieldset legend="Are you a U.S. citizen?" error="Select an answer to continue" required>
      <civ-yes-no name="citizen" required></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-fieldset legend="Do you have a valid passport?" required>
      <civ-yes-no name="passport" required></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-fieldset legend="Are you a U.S. citizen?" disabled>
      <civ-yes-no name="citizen" value="yes" disabled></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const Preselected: Story = {
  render: () => html`
    <civ-form-fieldset legend="Have you served in the military?">
      <civ-yes-no name="military" value="no"></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const CustomLabels: Story = {
  render: () => html`
    <civ-form-fieldset legend="Do you agree to the terms of service?">
      <civ-yes-no
        name="terms"
        yes-label="I agree"
        no-label="I decline"
      ></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const WithUnsureOption: Story = {
  name: 'With Unsure Option',
  render: () => html`
    <civ-form-fieldset legend="Do you have a service-connected disability?" hint="This includes any injury or illness incurred during military service">
      <civ-yes-no
        name="disability"
        unsure-label="I'm not sure"
      ></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const CustomThirdOption: Story = {
  name: 'Custom Third Option',
  render: () => html`
    <civ-form-fieldset legend="Does this condition apply to your household?">
      <civ-yes-no
        name="condition"
        unsure-label="Does not apply"
        unsure-value="n/a"
      ></civ-yes-no>
    </civ-form-fieldset>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-form-fieldset legend="Normal (no selection)">
        <civ-yes-no name="normal"></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With hint" hint="Additional context for this question">
        <civ-yes-no name="hint"></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With error" error="Select an answer" required>
        <civ-yes-no name="error" required></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Required" required>
        <civ-yes-no name="required" required></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Disabled" disabled>
        <civ-yes-no name="disabled" value="yes" disabled></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="With unsure option">
        <civ-yes-no name="unsure" unsure-label="I'm not sure"></civ-yes-no>
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
        <civ-form-fieldset legend="Are you a U.S. citizen?">
          <civ-yes-no name="dense-citizen"></civ-yes-no>
        </civ-form-fieldset>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-fieldset legend="Are you a U.S. citizen?">
          <civ-yes-no name="default-citizen"></civ-yes-no>
        </civ-form-fieldset>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-fieldset legend="Are you a U.S. citizen?">
          <civ-yes-no name="spacious-citizen"></civ-yes-no>
        </civ-form-fieldset>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const WithPreferNotToAnswer: Story = {
  name: 'With "Prefer not to answer" affordance',
  render: () => html`
    <civ-form-fieldset legend="Are you currently experiencing thoughts of self-harm?" hint="Your answer is confidential and used only to route you to appropriate support.">
      <civ-yes-no
        name="selfHarm"
        skip-label="Prefer not to answer"
        skip-value="prefer_not_to_say"
      ></civ-yes-no>
    </civ-form-fieldset>
  `,
};

export const GovernmentEligibilityScreening: Story = {
  name: 'Usage: Eligibility Screening',
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const values = Array.from(fd.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        alert('Submitted: ' + values);
      }}
    >
      <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Eligibility questions</h3>
      <civ-form-fieldset legend="Are you a U.S. citizen or permanent resident?" hint="Select yes if you are a citizen by birth or naturalization" required>
        <civ-yes-no name="citizen" required></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Have you filed federal income taxes this year?" required>
        <civ-yes-no name="taxes" required></civ-yes-no>
      </civ-form-fieldset>
      <civ-form-fieldset legend="Do you currently receive any government benefits?" hint="Including Social Security, Medicare, or disability compensation">
        <civ-yes-no name="benefits"></civ-yes-no>
      </civ-form-fieldset>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <civ-button type="submit">Check eligibility</civ-button>
      </div>
    </form>
  `,
};
