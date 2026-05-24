import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
  render: () => html`
    <civ-progress-header current="0" total="3" step-title="Personal Info"></civ-progress-header>
    <civ-progress-steps
      steps='${defaultSteps}'
      current="0"
    ></civ-progress-steps>
  `,
};

export const MiddleStep: Story = {
  render: () => html`
    <civ-progress-header current="1" total="3" step-title="Address"></civ-progress-header>
    <civ-progress-steps
      steps='${defaultSteps}'
      current="1"
    ></civ-progress-steps>
  `,
};

export const LastStep: Story = {
  render: () => html`
    <civ-progress-header current="2" total="3" step-title="Review"></civ-progress-header>
    <civ-progress-steps
      steps='${defaultSteps}'
      current="2"
    ></civ-progress-steps>
  `,
};

export const WithError: Story = {
  name: 'With Error Step',
  render: () => html`
    <civ-progress-header current="3" total="4" step-title="Review"></civ-progress-header>
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
    <civ-progress-header current="2" total="4" step-title="Documents"></civ-progress-header>
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Documents","Review"]'
      current="2"
      clickable
      @civ-step-click="${(e: CustomEvent) => alert('Navigate to step ' + (e.detail.step + 1))}"
    ></civ-progress-steps>
  `,
};

export const ManySteps: Story = {
  name: 'Many Steps (8)',
  render: () => html`
    <civ-progress-header current="3" total="8" step-title="Employment"></civ-progress-header>
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Contact","Employment","Income","Documents","Review","Submit"]'
      current="3"
    ></civ-progress-steps>
  `,
};

export const AllStates: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">First step</h3>
        <civ-progress-header current="0" total="3" step-title="Personal Info"></civ-progress-header>
        <civ-progress-steps steps='${defaultSteps}' current="0"></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Middle step</h3>
        <civ-progress-header current="1" total="3" step-title="Address"></civ-progress-header>
        <civ-progress-steps steps='${defaultSteps}' current="1"></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Last step</h3>
        <civ-progress-header current="2" total="3" step-title="Review"></civ-progress-header>
        <civ-progress-steps steps='${defaultSteps}' current="2"></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With error</h3>
        <civ-progress-header current="3" total="4" step-title="Review"></civ-progress-header>
        <civ-progress-steps steps='["Step 1","Step 2","Step 3","Step 4"]' current="3" error-steps="[1]"></civ-progress-steps>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Many steps</h3>
        <civ-progress-header current="4" total="8" step-title="Income"></civ-progress-header>
        <civ-progress-steps steps='["A","B","C","D","E","F","G","H"]' current="4"></civ-progress-steps>
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
      emphasis="primary"
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
      emphasis="secondary"
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
      emphasis="tertiary"
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
    <div class="civ-mb-4">
      <div class="civ-flex civ-justify-between civ-items-center civ-mb-1">
        <civ-progress-header current="2" total="5" step-title="Employment History" emphasis="secondary"></civ-progress-header>
        <span class="civ-text-sm civ-font-bold">40%</span>
      </div>
      <civ-progress-percent value="40" label="Form completion" .showPercent="${false}"></civ-progress-percent>
    </div>
  `,
};

// ── Progress Percent ─────────────────────────────────────────

export const ProgressBar: Story = {
  name: 'Percent Bar',
  render: () => html`
    <div class="civ-mb-4">
      <div class="civ-flex civ-justify-between civ-items-center civ-mb-1">
        <civ-progress-header current="2" total="8" step-title="Employment"></civ-progress-header>
        <span class="civ-text-sm civ-font-bold">25%</span>
      </div>
      <civ-progress-percent value="25" label="Form completion" .showPercent="${false}"></civ-progress-percent>
    </div>
  `,
};

export const ProgressBarComplete: Story = {
  name: 'Percent Bar (Complete)',
  render: () => html`
    <div class="civ-mb-4">
      <div class="civ-flex civ-justify-between civ-items-center civ-mb-1">
        <civ-progress-header current="7" total="8" step-title="Submit"></civ-progress-header>
        <span class="civ-text-sm civ-font-bold">100%</span>
      </div>
      <civ-progress-percent value="100" label="Form completion" .showPercent="${false}"></civ-progress-percent>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentApplicationProgress: Story = {
  name: 'Usage: Multi-Step Application',
  render: () => html`
    <civ-progress-header current="3" total="8" step-title="Employment"></civ-progress-header>
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Contact Details","Employment","Income","Documents","Review","Submit"]'
      current="3"
      clickable
    ></civ-progress-steps>
  `,
};
