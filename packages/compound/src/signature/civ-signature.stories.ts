import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-signature.js';
import '@civui/inputs';
import '@civui/controls';

const meta: Meta = {
  title: 'Forms/Patterns/Signature',
  component: 'civ-signature',
  tags: ['autodocs'],
  argTypes: {
    legend: { control: 'text' },
    name: { control: 'text' },
    statement: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Statement of truth',
    name: 'signature',
    statement: '',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-signature
      legend="${args.legend}"
      name="${args.name}"
      statement="${args.statement}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-signature>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  name: 'With Statement',
  render: () => html`
    <civ-signature
      legend="Statement of truth"
      name="signature"
      statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
    ></civ-signature>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-signature
      legend="Statement of truth"
      name="signature"
      name-error="Enter your full name to sign"
      certify-error="You must certify before submitting"
      required
    ></civ-signature>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-signature
      legend="Statement of truth"
      name="signature"
      statement="I certify that the information I have provided is true and correct to the best of my knowledge and belief."
      required
    ></civ-signature>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-signature
      legend="Statement of truth"
      name="signature"
      disabled
    ></civ-signature>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Normal</h3>
        <civ-signature legend="Statement of truth" name="sig-normal"></civ-signature>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With statement text</h3>
        <civ-signature legend="Statement of truth" name="sig-statement" statement="I certify this information is true."></civ-signature>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">With errors</h3>
        <civ-signature legend="Statement of truth" name="sig-error" name-error="Enter your name" certify-error="You must certify" required></civ-signature>
      </div>
      <div>
        <h3 class="civ-m-0 civ-mb-2 civ-font-semibold">Disabled</h3>
        <civ-signature legend="Statement of truth" name="sig-disabled" disabled></civ-signature>
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
        <civ-signature legend="Statement of truth" name="dense-sig" statement="I certify this is true." required></civ-signature>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-signature legend="Statement of truth" name="default-sig" statement="I certify this is true." required></civ-signature>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-signature legend="Statement of truth" name="spacious-sig" statement="I certify this is true." required></civ-signature>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentCertification: Story = {
  name: 'Usage: Application Certification',
  render: () => html`
    <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Certification and signature</h3>
    <p class="civ-m-0 civ-mb-4 civ-text-muted">By signing below, you are certifying that the statements in this application are true and complete.</p>
    <civ-signature
      legend="Applicant certification"
      name="applicant-sig"
      statement="I certify that the information I have provided on this form is true, correct, and complete to the best of my knowledge. I understand that making false statements is punishable under federal law."
      required
    ></civ-signature>
  `,
};

// ── Statement slot (HTML) ─────────────────────────────────────

export const StatementSlot: Story = {
  name: 'Statement slot (HTML with link)',
  parameters: {
    docs: {
      description: {
        story:
          'When the statement needs links or other markup, pass it via a `slot="statement"` child instead of the plain-text `statement` prop. The slotted content is wired into the certify checkbox\'s `aria-describedby` so screen-reader users hear the full text on focus.',
      },
    },
  },
  render: () => html`
    <civ-signature legend="Statement of truth" name="signature" required>
      <span slot="statement">
        I certify under <a href="/penalty">penalty of perjury</a> that the
        information I have provided is true, correct, and complete. I have
        read the <a href="/privacy">privacy notice</a>.
      </span>
    </civ-signature>
  `,
};

// ── Captured signedAt timestamp ───────────────────────────────

export const SignedAtTimestamp: Story = {
  name: 'signedAt timestamp (logged on certify)',
  parameters: {
    docs: {
      description: {
        story:
          'When the user checks the certify box, the component captures `el.signedAt` as an ISO 8601 string. Listen for `civ-change` to observe the captured time. Unchecking clears the timestamp; re-checking captures a fresh one.',
      },
    },
  },
  render: () => html`
    <civ-signature
      legend="Statement of truth"
      name="signature"
      statement="I certify the information I have provided is true and correct."
      required
      @civ-change="${(e: CustomEvent) => {
        const out = document.querySelector('#signed-at-out');
        if (out) out.textContent = JSON.stringify(e.detail.value, null, 2);
      }}"
    ></civ-signature>
    <pre id="signed-at-out" class="civ-mt-4 civ-p-3 civ-bg-base-lightest civ-rounded civ-text-sm" style="white-space:pre-wrap;">Toggle the certify box to capture a timestamp…</pre>
  `,
};
