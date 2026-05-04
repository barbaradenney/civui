import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-progress.js';
import './civ-progress-bar.js';

const meta: Meta = {
  title: 'Forms/Form/Progress',
  component: 'civ-progress',
  tags: ['autodocs'],
  argTypes: {
    steps: { control: 'text' },
    current: { control: 'number' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj;

const defaultSteps = '["Personal Info","Address","Review"]';

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    steps: defaultSteps,
    current: 0,
  },
  render: (args) => html`
    <civ-progress
      steps="${args.steps}"
      current="${args.current}"
      orientation="${args.orientation ?? 'horizontal'}"
    ></civ-progress>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'Middle Step',
  render: () => html`
    <civ-progress
      steps='${defaultSteps}'
      current="1"
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

export const Required: Story = {
  name: 'With Counter',
  render: () => html`
    <civ-progress
      steps='["Personal Info","Address","Employment","Review"]'
      current="2"
      show-counter
    ></civ-progress>
  `,
};

export const Disabled: Story = {
  name: 'Vertical Orientation',
  render: () => html`
    <civ-progress
      steps='${defaultSteps}'
      current="1"
      orientation="vertical"
    ></civ-progress>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <civ-progress
      steps='[{"label":"Eligibility","description":"Verify requirements"},{"label":"Personal Info","description":"Name, DOB, SSN"},{"label":"Documents","description":"Upload files"},{"label":"Review","description":"Confirm details"}]'
      current="1"
      orientation="vertical"
    ></civ-progress>
  `,
};

export const Clickable: Story = {
  render: () => html`
    <civ-progress
      steps='[{"label":"Eligibility","description":"Complete"},{"label":"Personal Info","description":"Complete"},{"label":"Documents","description":"In progress"},{"label":"Review","description":"Not started"}]'
      current="2"
      clickable
      show-counter
      @civ-step-click="${(e: CustomEvent) => alert('Navigate to step ' + (e.detail.step + 1))}"
    ></civ-progress>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">First step (horizontal)</h3>
        <civ-progress steps='${defaultSteps}' current="0"></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Middle step</h3>
        <civ-progress steps='${defaultSteps}' current="1"></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Last step</h3>
        <civ-progress steps='${defaultSteps}' current="2"></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With error step</h3>
        <civ-progress steps='["Step 1","Step 2","Step 3","Step 4"]' current="3" error-steps="[1]"></civ-progress>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Vertical with descriptions</h3>
        <civ-progress steps='[{"label":"Step 1","description":"Complete"},{"label":"Step 2","description":"In progress"},{"label":"Step 3","description":"Not started"}]' current="1" orientation="vertical"></civ-progress>
      </div>
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
        <civ-progress steps='${defaultSteps}' current="1"></civ-progress>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-progress steps='${defaultSteps}' current="1"></civ-progress>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-progress steps='${defaultSteps}' current="1"></civ-progress>
      </div>
    </div>
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
    <civ-progress-bar
      value="37"
      label="Application progress"
      status="3 of 8 sections complete"
      class="civ-mt-4"
    ></civ-progress-bar>
  `,
};
