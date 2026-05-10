import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-section-intro.js';

const meta: Meta = {
  title: 'Forms/Form/Section Intro',
  component: 'civ-section-intro',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    headingLevel: { control: { type: 'select' }, options: [2, 3, 4, 5, 6] },
    tone: { control: { type: 'select' }, options: ['info', 'sensitive', 'neutral'] },
  },
};
export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    heading: 'Before we continue',
    headingLevel: 3,
    tone: 'info',
  },
  render: (args) => html`
    <civ-section-intro
      heading="${args.heading}"
      heading-level="${args.headingLevel}"
      tone="${args.tone}"
    >
      <p>A short paragraph setting context for the next few questions.</p>
    </civ-section-intro>
  `,
};

// ── Sensitive — for trauma-informed flows ────────────────────

export const Sensitive: Story = {
  name: 'Sensitive (trauma-informed)',
  render: () => html`
    <civ-section-intro
      heading="About your service-connected trauma"
      tone="sensitive"
    >
      <p>The next questions ask about events that may be difficult to remember.</p>
      <p>You can skip any question, and your answers are saved as you go.</p>
    </civ-section-intro>
  `,
};

// ── With a list of expectations ──────────────────────────────

export const WithList: Story = {
  render: () => html`
    <civ-section-intro heading="What you'll need" tone="info">
      <p>To finish this section, have the following handy:</p>
      <ul>
        <li>The deceased person's Social Security number</li>
        <li>Their date of birth and date of death</li>
        <li>The death certificate (optional — you can upload later)</li>
      </ul>
    </civ-section-intro>
  `,
};

// ── Neutral (no-heading) ─────────────────────────────────────

export const NeutralNoHeading: Story = {
  name: 'Neutral — body-only',
  render: () => html`
    <civ-section-intro tone="neutral">
      <p>This section is optional. You can skip it and come back later.</p>
    </civ-section-intro>
  `,
};

// ── Callout utility class examples ───────────────────────────

export const CalloutVariants: Story = {
  name: 'Callout variants',
  parameters: {
    docs: {
      description: {
        story: 'The `.civ-callout` CSS class can be applied to any element for a left-border accent. Five color variants match the semantic color system. Use for important notices, tips, or contextual information.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 1.5rem; max-width: 600px;">
      <div class="civ-callout">
        <p class="civ-font-bold civ-mb-1">Note</p>
        <p>You must complete this section before continuing to the next step.</p>
      </div>
      <div class="civ-callout civ-callout--info">
        <p class="civ-font-bold civ-mb-1">Information</p>
        <p>Processing times are currently 3–5 business days.</p>
      </div>
      <div class="civ-callout civ-callout--warning">
        <p class="civ-font-bold civ-mb-1">Important</p>
        <p>Your session will expire in 15 minutes. Save your progress.</p>
      </div>
      <div class="civ-callout civ-callout--error">
        <p class="civ-font-bold civ-mb-1">Action needed</p>
        <p>Your application is missing required documents.</p>
      </div>
      <div class="civ-callout civ-callout--success">
        <p class="civ-font-bold civ-mb-1">Complete</p>
        <p>Your information has been verified successfully.</p>
      </div>
    </div>
  `,
};
