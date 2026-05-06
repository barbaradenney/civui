import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-progress-steps.js';
import './civ-progress-percent.js';
import './civ-progress-header.js';

const meta: Meta = {
  title: 'Forms/Form/Progress',
  component: 'civ-progress-steps',
  tags: ['autodocs'],
  argTypes: {
    steps: { control: 'text' },
    current: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj;

const defaultSteps = '["Personal Info","Address","Review"]';

// ── Segmented Progress ───────────────────────────────────────

export const Default: Story = {
  args: {
    steps: defaultSteps,
    current: 0,
  },
  render: (args) => html`
    <civ-progress-steps
      steps="${args.steps}"
      current="${args.current}"
    ></civ-progress-steps>
  `,
};

export const MiddleStep: Story = {
  name: 'Middle Step',
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="1"
    ></civ-progress-steps>
  `,
};

export const LastStep: Story = {
  name: 'Last Step',
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="2"
    ></civ-progress-steps>
  `,
};

export const WithCounter: Story = {
  name: 'With Counter',
  render: () => html`
    <civ-progress-steps
      steps='["Personal Info","Address","Employment","Review"]'
      current="2"
      show-counter
    ></civ-progress-steps>
  `,
};

export const WithError: Story = {
  name: 'With Error Step',
  render: () => html`
    <civ-progress-steps
      steps='["Personal Info","Address","Employment","Review"]'
      current="3"
      error-steps="[1]"
    ></civ-progress-steps>
    <p class="civ-text-sm civ-text-error civ-mt-2">Step 2 (Address) has validation errors. Please go back and correct them.</p>
  `,
};

export const Clickable: Story = {
  render: () => html`
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Documents","Review"]'
      current="2"
      clickable
      show-counter
      @civ-step-click="${(e: CustomEvent) => alert('Navigate to step ' + (e.detail.step + 1))}"
    ></civ-progress-steps>
  `,
};

export const ManySteps: Story = {
  name: 'Many Steps (8)',
  render: () => html`
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Contact","Employment","Income","Documents","Review","Submit"]'
      current="3"
      show-counter
    ></civ-progress-steps>
  `,
};

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">First step</h3>
        <civ-progress-steps steps='${defaultSteps}' current="0" show-counter></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Middle step</h3>
        <civ-progress-steps steps='${defaultSteps}' current="1" show-counter></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Last step</h3>
        <civ-progress-steps steps='${defaultSteps}' current="2" show-counter></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With error</h3>
        <civ-progress-steps steps='["Step 1","Step 2","Step 3","Step 4"]' current="3" error-steps="[1]" show-counter></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Many steps</h3>
        <civ-progress-steps steps='["A","B","C","D","E","F","G","H"]' current="4" show-counter></civ-progress-steps>
      </div>
    </div>
  `,
};

// ── Progress Header ──────────────────────────────────────────

export const ProgressHeaderPrimary: Story = {
  name: 'Header — Primary',
  render: () => html`
    <civ-progress-header
      current="1"
      total="4"
      step-title="Contact Information"
      size="primary"
    ></civ-progress-header>
  `,
};

export const ProgressHeaderSecondary: Story = {
  name: 'Header — Secondary',
  render: () => html`
    <civ-progress-header
      current="1"
      total="4"
      step-title="Contact Information"
      size="secondary"
    ></civ-progress-header>
  `,
};

export const ProgressHeaderTertiary: Story = {
  name: 'Header — Tertiary',
  render: () => html`
    <civ-progress-header
      current="1"
      total="4"
      step-title="Contact Information"
      size="tertiary"
    ></civ-progress-header>
  `,
};

export const HeaderWithSteps: Story = {
  name: 'Header + Steps (paired)',
  render: () => html`
    <civ-progress-header
      current="2"
      total="5"
      step-title="Employment History"
      size="tertiary"
    ></civ-progress-header>
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Employment","Documents","Review"]'
      current="2"
    ></civ-progress-steps>
  `,
};

export const HeaderWithPercent: Story = {
  name: 'Header + Percent (paired)',
  render: () => html`
    <civ-progress-header
      current="2"
      total="5"
      step-title="Employment History"
      size="tertiary"
    ></civ-progress-header>
    <civ-progress-percent
      value="40"
      label="Form completion"
      status="2 of 5 sections complete"
    ></civ-progress-percent>
  `,
};

// ── Progress Percent ─────────────────────────────────────────

export const ProgressBar: Story = {
  render: () => html`
    <civ-progress-percent
      value="40"
      label="Form completion"
      status="3 of 8 sections complete"
    ></civ-progress-percent>
  `,
};

export const ProgressBarComplete: Story = {
  render: () => html`
    <civ-progress-percent
      value="100"
      label="Form completion"
      status="All sections complete"
    ></civ-progress-percent>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentApplicationProgress: Story = {
  name: 'Usage: Multi-Step Application',
  render: () => html`
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Contact Details","Employment","Income","Documents","Review","Submit"]'
      current="3"
      show-counter
      clickable
    ></civ-progress-steps>
  `,
};
