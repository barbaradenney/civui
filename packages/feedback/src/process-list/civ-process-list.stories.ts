import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-process-list.js';
import './civ-process-list-item.js';
import '../badge/civ-badge.js';
import '@civui/actions/button';
import '@civui/actions/link';

const meta: Meta = {
  title: 'Feedback/Process List',
  component: 'civ-process-list',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

// ── Default — benefit application preview ──────────────────────

export const BenefitApplication: Story = {
  name: 'Benefit application — three-step preview',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Gather your documents">
          <p class="civ-m-0">
            You'll need your Social Security number, proof of income, and a
            government-issued photo ID.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Fill out the application">
          <p class="civ-m-0">
            Most people finish in about 15 minutes. You can save and come
            back later if you need to.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="We review your application">
          <p class="civ-m-0">
            A decision usually arrives within 30 days. You'll get a letter
            in the mail with the result.
          </p>
        </civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};

// ── Mixed progress — some steps complete ──────────────────────

export const MixedProgress: Story = {
  name: 'Mixed progress — completed + upcoming',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Account created" state="complete">
          <p class="civ-m-0">
            You created your account on May 18, 2026.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Identity verified" state="complete">
          <p class="civ-m-0">
            We confirmed your identity using ID.me.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Submit your application">
          <p class="civ-m-0">
            You're here. Complete the form below to file your claim.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Decision arrives">
          <p class="civ-m-0">
            Within 30 days after submission.
          </p>
        </civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};

// ── Custom icons per step ─────────────────────────────────────

export const CustomIcons: Story = {
  name: 'Custom icons — affordance-specific markers',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Sign in to your account" icon="person">
          <p class="civ-m-0">
            Use your Login.gov or ID.me account.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Verify your email" icon="mail">
          <p class="civ-m-0">
            We'll send a confirmation link to the address on file.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Upload supporting documents" icon="document">
          <p class="civ-m-0">
            PDF, JPG, or PNG, up to 10 MB per file.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Review and submit" icon="check">
          <p class="civ-m-0">
            Double-check everything before sending.
          </p>
        </civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};

// ── Headings only — terse stage preview ───────────────────────

export const HeadingsOnly: Story = {
  name: 'Headings only — terse stage preview',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Apply"></civ-process-list-item>
        <civ-process-list-item heading="Review"></civ-process-list-item>
        <civ-process-list-item heading="Decision"></civ-process-list-item>
        <civ-process-list-item heading="Appeal (if needed)"></civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};

// ── Rich body content ─────────────────────────────────────────

export const RichBody: Story = {
  name: 'Rich body — nested lists and links',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Before you begin">
          <p>You'll need the following:</p>
          <ul>
            <li>Your Social Security number</li>
            <li>Your most recent W-2 or pay stub</li>
            <li>Bank routing and account numbers (for direct deposit)</li>
          </ul>
        </civ-process-list-item>

        <civ-process-list-item heading="Complete the application">
          <p>
            The form takes about 20 minutes. Use the
            <a href="#">save-and-continue</a> button if you need a break.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Track your status">
          <p>
            After submission, you can check the status of your application
            in your <a href="#">account dashboard</a>.
          </p>
        </civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};

// ── Eyebrow + call-to-action buttons / links ──────────────────

export const WithActions: Story = {
  name: 'With actions — eyebrow labels + buttons / links',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Create your account">
          <p class="civ-eyebrow civ-m-0 civ-mb-1">Takes about 2 minutes</p>
          <p class="civ-mt-0">
            Sign in with Login.gov so your progress is saved as you go.
          </p>
          <civ-button href="#" label="Create account"></civ-button>
        </civ-process-list-item>

        <civ-process-list-item heading="Verify your identity">
          <p class="civ-eyebrow civ-m-0 civ-mb-1">Required</p>
          <p class="civ-mt-0">
            We use ID.me to confirm who you are before processing benefits.
          </p>
          <civ-link href="#" label="Why we ask for this"></civ-link>
        </civ-process-list-item>

        <civ-process-list-item heading="Submit your application">
          <p class="civ-eyebrow civ-m-0 civ-mb-1">Final step</p>
          <p class="civ-mt-0">
            Review your answers, then file your claim. You'll get a
            confirmation number right away.
          </p>
          <div class="civ-button-row">
            <civ-button label="Start application"></civ-button>
            <civ-button emphasis="tertiary" href="#" label="Preview the form"></civ-button>
          </div>
        </civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};

// ── Status badges per step + actions where needed ─────────────

export const WithStatusBadges: Story = {
  name: 'With status badges — per-step status + actions',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-process-list>
        <civ-process-list-item heading="Identity verified" state="complete">
          <civ-badge label="Verified" intent="success" with-icon></civ-badge>
          <p class="civ-mt-1 civ-mb-0">
            We confirmed your identity using ID.me.
          </p>
        </civ-process-list-item>

        <civ-process-list-item heading="Upload supporting documents">
          <civ-badge label="Action needed" intent="warning" with-icon></civ-badge>
          <p class="civ-mt-1 civ-mb-2">
            We still need your DD-214 to verify your service dates.
          </p>
          <civ-button label="Upload documents"></civ-button>
        </civ-process-list-item>

        <civ-process-list-item heading="Payment information">
          <civ-badge label="Needs attention" intent="error" with-icon></civ-badge>
          <p class="civ-mt-1 civ-mb-2">
            Your bank rejected the last deposit. Update your account details
            to avoid payment delays.
          </p>
          <civ-link href="#" label="Fix payment details"></civ-link>
        </civ-process-list-item>

        <civ-process-list-item heading="Submit your application">
          <p class="civ-m-0">
            Review everything, then file your claim. You'll get a
            confirmation number right away.
          </p>
        </civ-process-list-item>
      </civ-process-list>
    </div>
  `,
};
