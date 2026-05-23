import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/ssn';
import '@civui/inputs/ein';
import '@civui/inputs/va-file-number';
import '@civui/layout/disclosure';

const meta: Meta = {
  title: 'Foundations/Handling PII',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
PII components carry the \`data-civ-pii\` attribute on their rendered
DOM, which excludes them from autosave snapshots and the
\`getFormData({ excludePii: true })\` payload, and sets
\`piiMasked: true\` on \`civ-analytics\` events.

The stories below demonstrate the visible defaults — blur-mode
masking on \`civ-ssn\` / \`civ-ein\`, the last-4 SSN pattern, and the
\`<civ-disclosure>\`-based "Why we ask?" affordance that lowers
abandonment on sensitive flows.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const SsnFullMode: Story = {
  name: 'civ-ssn — full mode',
  parameters: {
    docs: {
      description: {
        story:
          'Focus the field to type. The mask formats <code>###-##-####</code> on blur. Click out to see the masked value. The rendered DOM carries <code>data-civ-pii</code>, so this field is excluded from autosave and from <code>getFormData({ excludePii: true })</code>.',
      },
    },
  },
  render: () => html`
    <civ-ssn name="ssn" required></civ-ssn>
  `,
};

export const SsnLast4Pattern: Story = {
  name: 'civ-ssn — last-4 minimization',
  parameters: {
    docs: {
      description: {
        story:
          'If the business process only needs the last four digits, collect only those. Switches the mask to <code>####</code>, the validator to a 4-digit check, and the default label.',
      },
    },
  },
  render: () => html`
    <civ-ssn
      label="Last 4 of Social Security number"
      name="ssn-last4"
      mode="last4"
      required
    ></civ-ssn>
  `,
};

export const EinFullMode: Story = {
  name: 'civ-ein — business tax ID',
  render: () => html`
    <civ-ein name="ein" required></civ-ein>
  `,
};

export const VaFileNumberRequiresOptIn: Story = {
  name: 'civ-va-file-number — explicit opt-in needed',
  parameters: {
    docs: {
      description: {
        story:
          '<code>civ-va-file-number</code> uses a validator (no mask preset) so it does NOT auto-flag <code>data-civ-pii</code>. Add <code>data-persist-exclude</code> to keep its value out of autosave snapshots — without it, the field will end up in localStorage.',
      },
    },
  },
  render: () => html`
    <civ-va-file-number
      name="va-file"
      data-persist-exclude
      required
    ></civ-va-file-number>
  `,
};

export const WhyWeAsk: Story = {
  name: 'Why we ask — pair PII with a disclosure',
  parameters: {
    docs: {
      description: {
        story:
          "Inline disclosure lowers abandonment by surfacing the reason for the question right next to the field. Use the <code>civ-disclosure</code> primitive for the chip-style toggle.",
      },
    },
  },
  render: () => html`
    <div style="max-width: 480px;">
      <civ-ssn name="ssn" required></civ-ssn>
      <civ-disclosure label="Why we ask">
        <p class="civ-m-0">
          We use the last 4 digits to verify your identity with the IRS.
          We never share your full Social Security number.
        </p>
      </civ-disclosure>
    </div>
  `,
};

export const MaskedConfirmationDisplay: Story = {
  name: 'On confirmation pages — show only the last 4',
  parameters: {
    docs: {
      description: {
        story:
          "Confirmation and summary pages must never echo the full identifier. Render the masked form (<code>•••-••-1234</code>) instead — the unmasked value stays on the server.",
      },
    },
  },
  render: () => html`
    <div
      style="border: 1px solid var(--civ-color-base-lighter); border-radius: var(--civ-border-radius-md); padding: var(--civ-spacing-4); max-width: 480px;"
    >
      <h3 class="civ-heading-md civ-m-0">Application submitted</h3>
      <p class="civ-text-caption civ-mt-1 civ-mb-4">
        Confirmation #A-2025-1042
      </p>
      <dl class="civ-flex civ-flex-col civ-gap-2 civ-m-0">
        <div class="civ-flex civ-justify-between">
          <dt class="civ-font-semibold">Full name</dt>
          <dd class="civ-m-0">Jane A. Smith</dd>
        </div>
        <div class="civ-flex civ-justify-between">
          <dt class="civ-font-semibold">Date of birth</dt>
          <dd class="civ-m-0">April 14, 1985</dd>
        </div>
        <div class="civ-flex civ-justify-between">
          <dt class="civ-font-semibold">Social Security number</dt>
          <dd class="civ-m-0">
            <code>•••-••-6789</code>
          </dd>
        </div>
      </dl>
    </div>
  `,
};
