import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-card.js';
import '../tag/civ-tag.js';
import '../button/civ-button.js';
import '../link/civ-link.js';

const meta: Meta = {
  title: 'UI/Card',
  component: 'civ-card',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    href: { control: 'text' },
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-card heading="Card title">
      <p>Card content with default padding and border.</p>
    </civ-card>
  `,
};

export const WithFooterLink: Story = {
  name: 'With Footer Action Link',
  render: () => html`
    <civ-card heading="Disability compensation">
      <p>Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
      <div data-card-footer>
        <civ-link href="#" variant="secondary">View claim details</civ-link>
      </div>
    </civ-card>
  `,
};

export const WithFooterButton: Story = {
  name: 'With Footer Button',
  render: () => html`
    <civ-card heading="Primary care appointment">
      <p>Dr. Sarah Smith</p>
      <p>January 15, 2026 at 2:30 PM</p>
      <p>VA Medical Center, Building 2, Room 105</p>
      <div data-card-footer>
        <civ-button label="Check in now"></civ-button>
      </div>
    </civ-card>
  `,
};

export const WithExpandableFooter: Story = {
  name: 'With Expandable Footer',
  render: () => html`
    <civ-card heading="Monthly payment">
      <p>Amount: $1,234.56</p>
      <p>Deposited: April 1, 2026</p>
      <details data-card-footer>
        <summary class="civ-link--tertiary civ-cursor-pointer">View payment breakdown</summary>
        <div class="civ-mt-2">
          <p>Disability compensation: $987.00</p>
          <p>Special monthly compensation: $247.56</p>
        </div>
      </details>
    </civ-card>
  `,
};

export const ClickableHeading: Story = {
  name: 'Clickable Heading Link',
  render: () => html`
    <civ-card heading="Education benefits" href="#/education">
      <p>Post-9/11 GI Bill</p>
      <p>Remaining entitlement: 24 months</p>
    </civ-card>
  `,
};

export const WithHeaderActions: Story = {
  name: 'With Header Actions',
  render: () => html`
    <civ-card heading="Dependent: Jane Doe">
      <p>Relationship: Spouse</p>
      <p>Date of birth: January 15, 1992</p>
      <span data-card-actions>
        <civ-button label="Edit" variant="tertiary"></civ-button>
        <civ-button label="Remove" variant="tertiary" danger></civ-button>
      </span>
    </civ-card>
  `,
};

export const WithTagAndActions: Story = {
  name: 'With Tag and Actions',
  render: () => html`
    <civ-card heading="Disability compensation">
      <civ-tag label="In progress" variant="teal"></civ-tag>
      <p class="civ-mt-2">Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
      <span data-card-actions>
        <civ-button label="Edit" variant="tertiary"></civ-button>
      </span>
      <div data-card-footer>
        <civ-link href="#" variant="secondary">View claim details</civ-link>
      </div>
    </civ-card>
  `,
};

export const AppointmentCards: Story = {
  name: 'Appointment Card Collection',
  render: () => html`
    <civ-card heading="Primary care">
      <civ-tag label="In person" variant="blue"></civ-tag>
      <p class="civ-mt-2">Dr. Smith — January 15, 2026 at 2:30 PM</p>
      <p>VA Medical Center, Building 2</p>
      <div data-card-footer>
        <civ-button label="Check in now"></civ-button>
      </div>
    </civ-card>

    <civ-card heading="Mental health">
      <civ-tag label="Video" variant="teal"></civ-tag>
      <p class="civ-mt-2">Dr. Johnson — January 18, 2026 at 10:00 AM</p>
      <p>VA Video Connect</p>
      <div data-card-footer>
        <civ-link href="#" variant="secondary">Join video session</civ-link>
      </div>
    </civ-card>

    <civ-card heading="Lab work">
      <civ-tag label="Completed" variant="green" tag-style="primary"></civ-tag>
      <p class="civ-mt-2">January 10, 2026</p>
      <p>VA Medical Center, Lab</p>
      <div data-card-footer>
        <civ-link href="#" variant="secondary">View results</civ-link>
      </div>
    </civ-card>
  `,
};

export const ClaimStatusCards: Story = {
  name: 'Claim Status Cards',
  render: () => html`
    <civ-card heading="Disability compensation" href="#/claims/123">
      <civ-tag label="In progress" variant="teal"></civ-tag>
      <p class="civ-mt-2">Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
    </civ-card>

    <civ-card heading="Travel reimbursement" href="#/claims/456">
      <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
      <p class="civ-mt-2">Filed: February 28, 2026</p>
      <p>Amount approved: $45.00</p>
    </civ-card>

    <civ-card heading="Education benefits" href="#/claims/789">
      <civ-tag label="Action needed" variant="red"></civ-tag>
      <p class="civ-mt-2">Filed: January 5, 2026</p>
      <p>Additional documents required</p>
    </civ-card>
  `,
};

export const Plain: Story = {
  name: 'Plain (No Header)',
  render: () => html`
    <civ-card>
      <p>A simple card with no heading or footer. Just body content.</p>
    </civ-card>
  `,
};

export const Small: Story = {
  render: () => html`
    <civ-card heading="Compact card" spacing="sm">
      <p>Smaller padding for dense layouts.</p>
    </civ-card>
  `,
};

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div data-civ-scale="dense">
        <p style="margin: 0 0 8px; font-weight: 600;">Dense</p>
        <civ-card heading="Disability compensation" href="#/claims/123">
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <p class="civ-mt-2">Filed: March 10, 2026</p>
          <span data-card-actions>
            <civ-button label="Edit" variant="tertiary"></civ-button>
          </span>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>

      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-card heading="Disability compensation" href="#/claims/123">
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <p class="civ-mt-2">Filed: March 10, 2026</p>
          <span data-card-actions>
            <civ-button label="Edit" variant="tertiary"></civ-button>
          </span>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>

      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-card heading="Disability compensation" href="#/claims/123">
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <p class="civ-mt-2">Filed: March 10, 2026</p>
          <span data-card-actions>
            <civ-button label="Edit" variant="tertiary"></civ-button>
          </span>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>
    </div>
  `,
};
