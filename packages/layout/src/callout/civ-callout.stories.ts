import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-callout.js';

const meta: Meta = {
  title: 'Layout/Callout',
  component: 'civ-callout',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'warning', 'error', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => html`
    <civ-callout variant="${args.variant}">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Note</p>
      <p class="civ-m-0">You must complete this section before continuing to the next step.</p>
    </civ-callout>
  `,
};

export const Info: Story = {
  render: () => html`
    <civ-callout variant="info">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Information</p>
      <p class="civ-m-0">Processing times are currently 3–5 business days.</p>
    </civ-callout>
  `,
};

export const Warning: Story = {
  render: () => html`
    <civ-callout variant="warning">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Important</p>
      <p class="civ-m-0">Your session will expire in 15 minutes. Save your progress.</p>
    </civ-callout>
  `,
};

export const Error: Story = {
  name: 'Error',
  render: () => html`
    <civ-callout variant="error">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Action needed</p>
      <p class="civ-m-0">Your application is missing required documents.</p>
    </civ-callout>
  `,
};

export const Success: Story = {
  render: () => html`
    <civ-callout variant="success">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Complete</p>
      <p class="civ-m-0">Your information has been verified successfully.</p>
    </civ-callout>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4" style="max-width: 600px;">
      <civ-callout>
        <p class="civ-m-0 civ-font-bold civ-mb-1">Default (primary)</p>
        <p class="civ-m-0">The base accent border uses the primary palette.</p>
      </civ-callout>
      <civ-callout variant="info">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Info</p>
        <p class="civ-m-0">Neutral informational message.</p>
      </civ-callout>
      <civ-callout variant="warning">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Warning</p>
        <p class="civ-m-0">Heads-up; user attention recommended.</p>
      </civ-callout>
      <civ-callout variant="error">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Error</p>
        <p class="civ-m-0">Action required to proceed.</p>
      </civ-callout>
      <civ-callout variant="success">
        <p class="civ-m-0 civ-font-bold civ-mb-1">Success</p>
        <p class="civ-m-0">Action completed.</p>
      </civ-callout>
    </div>
  `,
};

export const RichContent: Story = {
  name: 'Rich content (list)',
  render: () => html`
    <civ-callout variant="info">
      <p class="civ-m-0 civ-font-bold civ-mb-1">Before you start</p>
      <p>To finish this section, have the following ready:</p>
      <ul>
        <li>Your Social Security number</li>
        <li>Your most recent W-2</li>
        <li>Bank routing and account numbers</li>
      </ul>
    </civ-callout>
  `,
};

export const AsLandmark: Story = {
  name: 'As an ARIA landmark',
  parameters: {
    docs: {
      description: {
        story:
          'The host element imposes no role of its own — set `role` and `aria-labelledby` directly when you need a landmark.',
      },
    },
  },
  render: () => html`
    <civ-callout variant="warning" role="region" aria-labelledby="region-heading">
      <p id="region-heading" class="civ-m-0 civ-font-bold civ-mb-1">Important notice</p>
      <p class="civ-m-0">This region is announced as a landmark to assistive tech.</p>
    </civ-callout>
  `,
};
