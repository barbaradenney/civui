import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-progress.js';
import './civ-progress-bar.js';
import './civ-progress-header.js';

const meta: Meta = {
  title: 'Forms/Form/Progress',
  component: 'civ-progress',
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
    <civ-progress
      steps="${args.steps}"
      current="${args.current}"
    ></civ-progress>
  `,
};

export const MiddleStep: Story = {
  name: 'Middle Step',
  render: () => html`
    <civ-progress
      steps='${defaultSteps}'
      current="1"
    ></civ-progress>
  `,
};

export const LastStep: Story = {
  name: 'Last Step',
  render: () => html`
    <civ-progress
      steps='${defaultSteps}'
      current="2"
    ></civ-progress>
  `,
};

export const WithCounter: Story = {
  name: 'With Counter',
  render: () => html`
    <civ-progress
      steps='["Personal Info","Address","Employment","Review"]'
      current="2"
      show-counter
    ></civ-progress>
  `,
};

export const WithError: Story = {
  name: 'With Error Step',
  render: () => html`
    <civ-progress
      steps='["Personal Info","Address","Employment","Review"]'
      current="3"
      error-steps="[1]"
    ></civ-progress>
    <p class="civ-text-sm civ-text-error civ-mt-2">Step 2 (Address) has validation errors. Please go back and correct them.</p>
  `,
};

export const Clickable: Story = {
  render: () => html`
    <civ-progress
      steps='["Eligibility","Personal Info","Documents","Review"]'
      current="2"
      clickable
      show-counter
      @civ-step-click="${(e: CustomEvent) => alert('Navigate to step ' + (e.detail.step + 1))}"
    ></civ-progress>
  `,
};

export const ManySteps: Story = {
  name: 'Many Steps (8)',
  render: () => html`
    <civ-progress
      steps='["Eligibility","Personal Info","Contact","Employment","Income","Documents","Review","Submit"]'
      current="3"
      show-counter
    ></civ-progress>
  `,
};

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">First step</h3>
        <civ-progress steps='${defaultSteps}' current="0" show-counter></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Middle step</h3>
        <civ-progress steps='${defaultSteps}' current="1" show-counter></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Last step</h3>
        <civ-progress steps='${defaultSteps}' current="2" show-counter></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With error</h3>
        <civ-progress steps='["Step 1","Step 2","Step 3","Step 4"]' current="3" error-steps="[1]" show-counter></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Many steps</h3>
        <civ-progress steps='["A","B","C","D","E","F","G","H"]' current="4" show-counter></civ-progress>
      </div>
    </div>
  `,
};

// ── Progress Header ──────────────────────────────────────────

export const ProgressHeader: Story = {
  name: 'Progress Header (Minimal)',
  render: () => html`
    <civ-progress-header
      current="1"
      total="4"
      step-title="Contact Information"
    ></civ-progress-header>
  `,
};

export const ProgressHeaderPrimary: Story = {
  name: 'Progress Header (Primary Size)',
  render: () => html`
    <civ-progress-header
      current="0"
      total="3"
      step-title="Personal Information"
      header-size="xl"
    ></civ-progress-header>
  `,
};

// ── Progress Bar ──────────────────────────────────────────────

export const ProgressBar: Story = {
  render: () => html`
    <civ-progress-bar
      value="40"
      label="Form completion"
      status="3 of 8 sections complete"
    ></civ-progress-bar>
  `,
};

export const ProgressBarComplete: Story = {
  render: () => html`
    <civ-progress-bar
      value="100"
      label="Form completion"
      status="All sections complete"
    ></civ-progress-bar>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentApplicationProgress: Story = {
  name: 'Usage: Multi-Step Application',
  render: () => html`
    <civ-progress
      steps='["Eligibility","Personal Info","Contact Details","Employment","Income","Documents","Review","Submit"]'
      current="3"
      show-counter
      clickable
    ></civ-progress>
  `,
};
