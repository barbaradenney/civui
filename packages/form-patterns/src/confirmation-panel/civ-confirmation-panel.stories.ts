import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-confirmation-panel.js';
import '@civui/actions/button';
import '@civui/actions/link';

const meta: Meta = {
  title: 'Forms/Form/Confirmation Panel',
  component: 'civ-confirmation-panel',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    headingLevel: { control: { type: 'select' }, options: [1, 2, 3, 4, 5, 6] },
    reference: { control: 'text' },
    referenceLabel: { control: 'text' },
    noAutofocus: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

// ── Default — full panel with reference number ───────────────

export const Default: Story = {
  args: {
    heading: 'Application complete',
    headingLevel: 1,
    reference: 'HDJ2-123F',
    referenceLabel: 'Reference number',
    noAutofocus: true,
  },
  render: (args) => html`
    <civ-confirmation-panel
      heading="${args.heading}"
      heading-level="${args.headingLevel}"
      reference="${args.reference}"
      reference-label="${args.referenceLabel}"
      ?no-autofocus="${args.noAutofocus}"
    >
      <p>We have sent a confirmation email to sarah@example.gov.</p>

      <div data-next-steps>
        <h2>What happens next</h2>
        <p>
          Your application will be reviewed within 5 working days. We'll contact
          you if we need more information.
        </p>
      </div>

      <div data-actions>
        <civ-button label="Print confirmation" variant="secondary"></civ-button>
        <civ-link href="/dashboard">Return to dashboard</civ-link>
      </div>
    </civ-confirmation-panel>
  `,
};

// ── Without a reference number ───────────────────────────────

export const WithoutReference: Story = {
  name: 'Without reference (informational submission)',
  render: () => html`
    <civ-confirmation-panel heading="Subscription confirmed" no-autofocus>
      <p>
        You're signed up to receive benefit updates at sarah@example.gov.
        Look out for our first email within the next week.
      </p>

      <div data-next-steps>
        <h2>What you can do next</h2>
        <ul>
          <li>Update your contact preferences anytime</li>
          <li>Browse benefit topics on the resources page</li>
        </ul>
      </div>

      <div data-actions>
        <civ-link href="/">Return to home</civ-link>
      </div>
    </civ-confirmation-panel>
  `,
};

// ── Pending reference (async backend) ────────────────────────

export const PendingReference: Story = {
  name: 'Pending reference (async backend)',
  render: () => html`
    <civ-confirmation-panel heading="Claim received" no-autofocus>
      <p>
        We're processing your claim. This usually takes a few minutes.
      </p>

      <p data-pending-reference>
        <strong>We'll email your reference number within 24 hours</strong> to
        sarah@example.gov. Use it when checking your claim status.
      </p>

      <div data-next-steps>
        <h2>What happens next</h2>
        <p>
          You'll get a decision letter by mail within 30 days. You can also
          check your status online once you receive your reference number.
        </p>
      </div>

      <div data-actions>
        <civ-button label="Check status" variant="primary"></civ-button>
        <civ-link href="/">Return to home</civ-link>
      </div>
    </civ-confirmation-panel>
  `,
};

// ── Minimal — heading + body only ────────────────────────────

export const Minimal: Story = {
  name: 'Minimal (eligibility check)',
  render: () => html`
    <civ-confirmation-panel heading="You may be eligible" no-autofocus>
      <p>
        Based on your answers, you appear to meet the basic eligibility
        criteria. To confirm and apply, start the full application.
      </p>

      <div data-actions>
        <civ-button label="Start application" variant="primary"></civ-button>
      </div>
    </civ-confirmation-panel>
  `,
};
