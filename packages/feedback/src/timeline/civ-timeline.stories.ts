import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-timeline.js';
import './civ-timeline-item.js';

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
