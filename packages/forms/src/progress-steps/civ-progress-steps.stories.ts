import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-progress-steps.js';
import './civ-progress-bar.js';

const meta: Meta = {
  title: 'Forms/Patterns/Progress Steps',
  component: 'civ-progress-steps',
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

export const Default: Story = {
  args: {
    steps: defaultSteps,
    current: 0,
  },
  render: (args) => html`
    <civ-progress-steps
      steps="${args.steps}"
      current="${args.current}"
      orientation="${args.orientation ?? 'horizontal'}"
    ></civ-progress-steps>
  `,
};

export const MiddleStep: Story = {
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="1"
    ></civ-progress-steps>
  `,
};

export const LastStep: Story = {
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="2"
    ></civ-progress-steps>
  `,
};

export const Vertical: Story = {
  render: () => html`
    <civ-progress-steps
      steps='${defaultSteps}'
      current="1"
      orientation="vertical"
    ></civ-progress-steps>
  `,
};

export const ManySteps: Story = {
  render: () => html`
    <civ-progress-steps
      steps='["Eligibility","Personal Info","Contact Details","Employment","Income","Documents","Review","Submit"]'
      current="3"
    ></civ-progress-steps>
  `,
};

export const WithDescriptions: Story = {
  render: () => html`
    <civ-progress-steps
      steps='[{"label":"Eligibility","description":"Verify requirements"},{"label":"Personal Info","description":"Name, DOB, SSN"},{"label":"Documents","description":"Upload files"},{"label":"Review","description":"Confirm details"}]'
      current="1"
      orientation="vertical"
    ></civ-progress-steps>
  `,
};

export const WithErrorStep: Story = {
  render: () => html`
    <civ-progress-steps
      steps='["Personal Info","Address","Employment","Review"]'
      current="3"
      error-steps="[1]"
    ></civ-progress-steps>
    <p class="civ-text-sm civ-text-error civ-mt-2">Step 2 (Address) has validation errors. Please go back and correct them.</p>
  `,
};

export const WithCounter: Story = {
  render: () => html`
    <civ-progress-steps
      steps='["Personal Info","Address","Employment","Review"]'
      current="2"
      show-counter
    ></civ-progress-steps>
  `,
};

export const ClickableWithDescriptions: Story = {
  render: () => html`
    <civ-progress-steps
      steps='[{"label":"Eligibility","description":"Complete"},{"label":"Personal Info","description":"Complete"},{"label":"Documents","description":"In progress"},{"label":"Review","description":"Not started"}]'
      current="2"
      clickable
      show-counter
      @civ-step-click="${(e: CustomEvent) => alert('Navigate to step ' + (e.detail.step + 1))}"
    ></civ-progress-steps>
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

export const ProgressBarNoStatus: Story = {
  render: () => html`
    <civ-progress-bar
      value="65"
      label="Upload progress"
    ></civ-progress-bar>
  `,
};
