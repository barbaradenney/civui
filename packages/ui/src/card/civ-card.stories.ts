import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-card.js';
import '../tag/civ-tag.js';
import '../button/civ-button.js';

const meta: Meta = {
  title: 'UI/Card',
  component: 'civ-card',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    eyebrow: { control: 'text' },
    eyebrowVariant: {
      control: 'select',
      options: ['blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'],
    },
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

export const WithEyebrow: Story = {
  name: 'With Eyebrow Status',
  render: () => html`
    <civ-card heading="Disability compensation claim" eyebrow="In progress" eyebrow-variant="teal">
      <p>Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
    </civ-card>
  `,
};

export const WithFooterLink: Story = {
  name: 'With Footer Action Link',
  render: () => html`
    <civ-card heading="Disability compensation" eyebrow="In progress" eyebrow-variant="teal">
      <p>Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
      <div data-card-footer>
        <a href="#" class="civ-link">View claim details</a>
      </div>
    </civ-card>
  `,
};

export const WithFooterButton: Story = {
  name: 'With Footer Button',
  render: () => html`
    <civ-card heading="Primary care appointment" eyebrow="Upcoming" eyebrow-variant="blue">
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
        <summary class="civ-link civ-cursor-pointer">View payment breakdown</summary>
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
    <civ-card heading="Education benefits" href="#/education" eyebrow="Active" eyebrow-variant="green">
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
        <a href="#" class="civ-link">Edit</a>
        <a href="#" class="civ-link civ-text-error">Remove</a>
      </span>
    </civ-card>
  `,
};

export const AppointmentCards: Story = {
  name: 'Appointment Card Collection',
  render: () => html`
    <civ-card heading="Primary care" eyebrow="In person" eyebrow-variant="blue">
      <p>Dr. Smith — January 15, 2026 at 2:30 PM</p>
      <p>VA Medical Center, Building 2</p>
      <div data-card-footer>
        <civ-button label="Check in now"></civ-button>
      </div>
    </civ-card>

    <civ-card heading="Mental health" eyebrow="Video" eyebrow-variant="teal">
      <p>Dr. Johnson — January 18, 2026 at 10:00 AM</p>
      <p>VA Video Connect</p>
      <div data-card-footer>
        <a href="#" class="civ-link">Join video session</a>
      </div>
    </civ-card>

    <civ-card heading="Lab work" eyebrow="Completed" eyebrow-variant="green">
      <p>January 10, 2026</p>
      <p>VA Medical Center, Lab</p>
      <div data-card-footer>
        <a href="#" class="civ-link">View results</a>
      </div>
    </civ-card>
  `,
};

export const ClaimStatusCards: Story = {
  name: 'Claim Status Cards',
  render: () => html`
    <civ-card heading="Disability compensation" href="#/claims/123" eyebrow="In progress" eyebrow-variant="teal">
      <p>Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
    </civ-card>

    <civ-card heading="Travel reimbursement" href="#/claims/456" eyebrow="Decision made" eyebrow-variant="green">
      <p>Filed: February 28, 2026</p>
      <p>Amount approved: $45.00</p>
    </civ-card>

    <civ-card heading="Education benefits" href="#/claims/789" eyebrow="Action needed" eyebrow-variant="red">
      <p>Filed: January 5, 2026</p>
      <p>Additional documents required</p>
    </civ-card>
  `,
};

export const Plain: Story = {
  name: 'Plain (No Header)',
  render: () => html`
    <civ-card>
      <p>A simple card with no heading, eyebrow, or footer. Just body content.</p>
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
