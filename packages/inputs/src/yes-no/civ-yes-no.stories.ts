import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-yes-no.js';
import '@civui/ui';

const meta: Meta = {
  title: 'Forms/Inputs/Yes No',
  component: 'civ-yes-no',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
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
    legend: 'Are you a U.S. citizen?',
    name: 'citizen',
    value: '',
    hint: '',
    error: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-yes-no
      legend="${args.legend}"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-yes-no>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-yes-no
      legend="Have you filed federal income taxes this year?"
      name="taxes"
      hint="This refers to federal income taxes for the current calendar year"
    ></civ-yes-no>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-yes-no
      legend="Are you a U.S. citizen?"
      name="citizen"
      error="Select an answer to continue"
      required
    ></civ-yes-no>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-yes-no
      legend="Do you have a valid passport?"
      name="passport"
      required
    ></civ-yes-no>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-yes-no
      legend="Are you a U.S. citizen?"
      name="citizen"
      value="yes"
      disabled
    ></civ-yes-no>
  `,
};

export const Preselected: Story = {
  render: () => html`
    <civ-yes-no
      legend="Have you served in the military?"
      name="military"
      value="no"
    ></civ-yes-no>
  `,
};

export const CustomLabels: Story = {
  render: () => html`
    <civ-yes-no
      legend="Do you agree to the terms of service?"
      name="terms"
      yes-label="I agree"
      no-label="I decline"
    ></civ-yes-no>
  `,
};

export const WithUnsureOption: Story = {
  name: 'With Unsure Option',
  render: () => html`
    <civ-yes-no
      legend="Do you have a service-connected disability?"
      name="disability"
      unsure-label="I'm not sure"
      hint="This includes any injury or illness incurred during military service"
    ></civ-yes-no>
  `,
};

export const CustomThirdOption: Story = {
  name: 'Custom Third Option',
  render: () => html`
    <civ-yes-no
      legend="Does this condition apply to your household?"
      name="condition"
      unsure-label="Does not apply"
      unsure-value="n/a"
    ></civ-yes-no>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <civ-yes-no legend="Normal (no selection)" name="normal"></civ-yes-no>
      <civ-yes-no legend="With hint" name="hint" hint="Additional context for this question"></civ-yes-no>
      <civ-yes-no legend="With error" name="error" error="Select an answer" required></civ-yes-no>
      <civ-yes-no legend="Required" name="required" required></civ-yes-no>
      <civ-yes-no legend="Disabled" name="disabled" value="yes" disabled></civ-yes-no>
      <civ-yes-no legend="With unsure option" name="unsure" unsure-label="I'm not sure"></civ-yes-no>
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
        <civ-yes-no legend="Are you a U.S. citizen?" name="dense-citizen"></civ-yes-no>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-yes-no legend="Are you a U.S. citizen?" name="default-citizen"></civ-yes-no>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-yes-no legend="Are you a U.S. citizen?" name="spacious-citizen"></civ-yes-no>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const WithPreferNotToAnswer: Story = {
  name: 'With "Prefer not to answer" affordance',
  render: () => html`
    <civ-yes-no
      legend="Are you currently experiencing thoughts of self-harm?"
      name="selfHarm"
      skip-label="Prefer not to answer"
      skip-value="prefer_not_to_say"
      hint="Your answer is confidential and used only to route you to appropriate support."
    ></civ-yes-no>
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
      <civ-yes-no
        legend="Are you a U.S. citizen or permanent resident?"
        name="citizen"
        required
        hint="Select yes if you are a citizen by birth or naturalization"
      ></civ-yes-no>
      <civ-yes-no
        legend="Have you filed federal income taxes this year?"
        name="taxes"
        required
      ></civ-yes-no>
      <civ-yes-no
        legend="Do you currently receive any government benefits?"
        name="benefits"
        hint="Including Social Security, Medicare, or disability compensation"
      ></civ-yes-no>
      <div class="civ-flex civ-gap-2 civ-mt-4">
        <civ-button type="submit">Check eligibility</civ-button>
      </div>
    </form>
  `,
};
