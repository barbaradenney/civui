import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-timeline.js';
import './civ-timeline-item.js';
import '../badge/civ-badge.js';
import '@civui/actions/button';
import '@civui/actions/link';

const meta: Meta = {
  title: 'Feedback/Timeline',
  component: 'civ-timeline',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

// Reference epoch for stories so the "relative" label is stable
// instead of drifting with wall-clock time when Storybook reloads.
const today = new Date();
const hoursAgo = (h: number): string =>
  new Date(today.getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number): string => hoursAgo(d * 24);

// ── Default — claim history ──────────────────────────────────

export const ClaimHistory: Story = {
  name: 'Claim history (chronological)',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-timeline>
        <civ-timeline-item
          timestamp="${daysAgo(7)}"
          actor="Sarah Chen"
          action="Application submitted"
          intent="info"
        ></civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(5)}"
          actor="Benefits processing"
          action="Documentation requested"
          intent="warning"
        >
          We need a copy of your DD-214 to verify service dates.
        </civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(3)}"
          actor="Sarah Chen"
          action="DD-214 uploaded"
          intent="info"
        ></civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(1)}"
          actor="J. Martinez (Reviewer)"
          action="Approved"
          intent="success"
        >
          All documentation verified. Award letter to follow within 5 business days.
        </civ-timeline-item>
      </civ-timeline>
    </div>
  `,
};

// ── Audit log — newest first ─────────────────────────────────

export const AuditLog: Story = {
  name: 'Audit log (newest first)',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-timeline>
        <civ-timeline-item
          timestamp="${hoursAgo(0.25)}"
          actor="admin@agency.gov"
          action="Role changed to Reviewer"
          intent="neutral"
        ></civ-timeline-item>

        <civ-timeline-item
          timestamp="${hoursAgo(2)}"
          actor="sarah.chen@agency.gov"
          action="Password reset requested"
          intent="info"
        ></civ-timeline-item>

        <civ-timeline-item
          timestamp="${hoursAgo(8)}"
          actor="System"
          action="Failed login attempt"
          intent="error"
        >
          Three consecutive failures from IP 198.51.100.42.
        </civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(1)}"
          actor="sarah.chen@agency.gov"
          action="Signed in"
          intent="neutral"
        ></civ-timeline-item>
      </civ-timeline>
    </div>
  `,
};

// ── Relative-only timestamps ─────────────────────────────────

export const RelativeOnly: Story = {
  name: 'Relative-only timestamps',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-timeline>
        <civ-timeline-item
          timestamp="${hoursAgo(0.5)}"
          actor="Sarah"
          action="Saved progress"
          intent="info"
          timestamp-format="relative"
        ></civ-timeline-item>
        <civ-timeline-item
          timestamp="${hoursAgo(3)}"
          actor="Sarah"
          action="Uploaded passport scan"
          intent="info"
          timestamp-format="relative"
        ></civ-timeline-item>
        <civ-timeline-item
          timestamp="${daysAgo(2)}"
          actor="Sarah"
          action="Started application"
          intent="neutral"
          timestamp-format="relative"
        ></civ-timeline-item>
      </civ-timeline>
    </div>
  `,
};

// ── All intents shown side-by-side ───────────────────────────

export const AllIntents: Story = {
  name: 'All intents',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-timeline>
        <civ-timeline-item
          timestamp="${daysAgo(5)}"
          action="Neutral intent — plain dot"
          intent="neutral"
        ></civ-timeline-item>
        <civ-timeline-item
          timestamp="${daysAgo(4)}"
          action="Info intent"
          intent="info"
        ></civ-timeline-item>
        <civ-timeline-item
          timestamp="${daysAgo(3)}"
          action="Success intent"
          intent="success"
        ></civ-timeline-item>
        <civ-timeline-item
          timestamp="${daysAgo(2)}"
          action="Warning intent"
          intent="warning"
        ></civ-timeline-item>
        <civ-timeline-item
          timestamp="${daysAgo(1)}"
          action="Error intent"
          intent="error"
        ></civ-timeline-item>
      </civ-timeline>
    </div>
  `,
};

// ── Eyebrow + actions inside entry bodies ────────────────────

export const WithActions: Story = {
  name: 'With actions — eyebrow labels + buttons / links',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-timeline>
        <civ-timeline-item
          timestamp="${daysAgo(5)}"
          actor="Benefits processing"
          action="Documentation requested"
          intent="warning"
        >
          <p class="civ-eyebrow civ-m-0 civ-mb-1">Action needed</p>
          <p class="civ-mt-0">
            We need a copy of your DD-214 to verify your service dates.
          </p>
          <civ-button label="Upload document"></civ-button>
        </civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(2)}"
          actor="Sarah Chen"
          action="DD-214 uploaded"
          intent="info"
        >
          <p class="civ-mt-0 civ-mb-1">
            We're reviewing your file now.
          </p>
          <civ-link href="#" label="Check status"></civ-link>
        </civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(1)}"
          actor="J. Martinez (Reviewer)"
          action="Claim approved"
          intent="success"
        >
          <p class="civ-eyebrow civ-m-0 civ-mb-1">Ready to view</p>
          <p class="civ-mt-0">
            Your award letter is available now. Payments begin next cycle.
          </p>
          <div class="civ-button-row">
            <civ-button label="Download award letter"></civ-button>
            <civ-button emphasis="tertiary" href="#" label="View payment schedule"></civ-button>
          </div>
        </civ-timeline-item>
      </civ-timeline>
    </div>
  `,
};

// ── Status badges echoing the dot intent + actions ───────────

export const WithStatusBadges: Story = {
  name: 'With status badges — echoing the intent',
  render: () => html`
    <div style="max-width: 540px;">
      <civ-timeline>
        <civ-timeline-item
          timestamp="${daysAgo(6)}"
          actor="System"
          action="Failed login attempt"
          intent="error"
        >
          <civ-badge label="Blocked" intent="error" emphasis="primary" with-icon></civ-badge>
          <p class="civ-mt-1 civ-mb-2">
            Three consecutive failures from IP 198.51.100.42. The account
            was temporarily locked.
          </p>
          <civ-link href="#" label="Reset your password"></civ-link>
        </civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(4)}"
          actor="Benefits processing"
          action="Documentation requested"
          intent="warning"
        >
          <civ-badge label="Action needed" intent="warning" with-icon></civ-badge>
          <p class="civ-mt-1 civ-mb-2">
            We need a copy of your DD-214 to verify your service dates.
          </p>
          <civ-button label="Upload document"></civ-button>
        </civ-timeline-item>

        <civ-timeline-item
          timestamp="${daysAgo(1)}"
          actor="J. Martinez (Reviewer)"
          action="Claim approved"
          intent="success"
        >
          <civ-badge label="Approved" intent="success" with-icon></civ-badge>
          <p class="civ-mt-1 civ-mb-0">
            Your award letter is ready. Payments begin next cycle.
          </p>
        </civ-timeline-item>
      </civ-timeline>
    </div>
  `,
};
