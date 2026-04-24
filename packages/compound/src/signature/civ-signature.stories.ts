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
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">Normal</h3>
        <civ-signature legend="Statement of truth" name="sig-normal"></civ-signature>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">With statement text</h3>
        <civ-signature legend="Statement of truth" name="sig-statement" statement="I certify this information is true."></civ-signature>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">With errors</h3>
        <civ-signature legend="Statement of truth" name="sig-error" name-error="Enter your name" certify-error="You must certify" required></civ-signature>
      </div>
      <div>
        <h3 style="margin: 0 0 8px; font-weight: 600;">Disabled</h3>
        <civ-signature legend="Statement of truth" name="sig-disabled" disabled></civ-signature>
      </div>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-signature legend="Statement of truth" name="dense-sig" statement="I certify this is true." required></civ-signature>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-signature legend="Statement of truth" name="default-sig" statement="I certify this is true." required></civ-signature>
      </div>
      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-signature legend="Statement of truth" name="spacious-sig" statement="I certify this is true." required></civ-signature>
      </div>
    </div>
  `,
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentCertification: Story = {
  name: 'Usage: Application Certification',
  render: () => html`
    <h3 style="margin: 0 0 16px; font-size: 1.25rem;">Certification and signature</h3>
    <p style="margin: 0 0 16px; color: #565c65;">By signing below, you are certifying that the statements in this application are true and complete.</p>
    <civ-signature
      legend="Applicant certification"
      name="applicant-sig"
      statement="I certify that the information I have provided on this form is true, correct, and complete to the best of my knowledge. I understand that making false statements is punishable under federal law."
      required
    ></civ-signature>
  `,
};
