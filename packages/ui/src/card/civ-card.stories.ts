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
    <civ-card>
      <p>Card content with default padding and border.</p>
    </civ-card>
  `,
};

export const WithHeader: Story = {
  name: 'With Header',
  render: () => html`
    <civ-card>
      <div data-card-header>
        <h3 class="civ-heading-md">Card title</h3>
      </div>
      <p>Card body content.</p>
    </civ-card>
  `,
};

export const WithHeaderAndFooter: Story = {
  name: 'With Header and Footer',
  render: () => html`
    <civ-card>
      <div data-card-header>
        <h3 class="civ-heading-md">Disability compensation</h3>
      </div>
      <p>Filed: March 10, 2026</p>
      <p>Step 3 of 5: Evidence gathering</p>
      <div data-card-footer>
        <civ-link href="#" variant="secondary">View claim details</civ-link>
      </div>
    </civ-card>
  `,
};

export const WithTagAndActions: Story = {
  name: 'With Tag and Actions',
  render: () => html`
    <civ-card>
      <div data-card-header>
        <civ-tag label="In progress" variant="teal"></civ-tag>
        <div class="civ-flex civ-justify-between civ-items-center">
          <h3 class="civ-heading-md">Disability compensation</h3>
          <div class="civ-flex civ-gap-2">
            <civ-button label="Edit" variant="tertiary"></civ-button>
            <civ-button label="Remove" variant="tertiary" danger></civ-button>
          </div>
        </div>
      </div>
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
    <civ-card>
      <div data-card-header>
        <h3 class="civ-heading-md">Primary care appointment</h3>
      </div>
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
    <civ-card>
      <div data-card-header>
        <h3 class="civ-heading-md">Monthly payment</h3>
      </div>
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

export const LinkHeading: Story = {
  name: 'Link Heading',
  render: () => html`
    <civ-card>
      <div data-card-header>
        <civ-link href="#/education" class="civ-heading-md">Education benefits</civ-link>
      </div>
      <p>Post-9/11 GI Bill</p>
      <p>Remaining entitlement: 24 months</p>
    </civ-card>
  `,
};

export const DependentCard: Story = {
  name: 'Dependent Card',
  render: () => html`
    <civ-card>
      <div data-card-header>
        <div class="civ-flex civ-justify-between civ-items-center">
          <h3 class="civ-heading-md">Dependent: Jane Doe</h3>
          <div class="civ-flex civ-gap-2">
            <civ-button label="Edit" variant="tertiary"></civ-button>
            <civ-button label="Remove" variant="tertiary" danger></civ-button>
          </div>
        </div>
      </div>
      <p>Relationship: Spouse</p>
      <p>Date of birth: January 15, 1992</p>
    </civ-card>
  `,
};

export const AppointmentCards: Story = {
  name: 'Appointment Card Collection',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <civ-card>
        <div data-card-header>
          <civ-tag label="In person" variant="blue"></civ-tag>
          <h3 class="civ-heading-md">Primary care</h3>
        </div>
        <p>Dr. Smith — January 15, 2026 at 2:30 PM</p>
        <p>VA Medical Center, Building 2</p>
        <div data-card-footer>
          <civ-button label="Check in now"></civ-button>
        </div>
      </civ-card>

      <civ-card>
        <div data-card-header>
          <civ-tag label="Video" variant="teal"></civ-tag>
          <h3 class="civ-heading-md">Mental health</h3>
        </div>
        <p>Dr. Johnson — January 18, 2026 at 10:00 AM</p>
        <p>VA Video Connect</p>
        <div data-card-footer>
          <civ-link href="#" variant="secondary">Join video session</civ-link>
        </div>
      </civ-card>

      <civ-card>
        <div data-card-header>
          <civ-tag label="Completed" variant="green" tag-style="primary"></civ-tag>
          <h3 class="civ-heading-md">Lab work</h3>
        </div>
        <p>January 10, 2026</p>
        <p>VA Medical Center, Lab</p>
        <div data-card-footer>
          <civ-link href="#" variant="secondary">View results</civ-link>
        </div>
      </civ-card>
    </div>
  `,
};

export const ClaimStatusCards: Story = {
  name: 'Claim Status Cards',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <civ-card>
        <div data-card-header>
          <civ-tag label="In progress" variant="teal"></civ-tag>
          <civ-link href="#/claims/123" class="civ-heading-md">Disability compensation</civ-link>
        </div>
        <p>Filed: March 10, 2026</p>
        <p>Step 3 of 5: Evidence gathering</p>
      </civ-card>

      <civ-card>
        <div data-card-header>
          <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
          <civ-link href="#/claims/456" class="civ-heading-md">Travel reimbursement</civ-link>
        </div>
        <p>Filed: February 28, 2026</p>
        <p>Amount approved: $45.00</p>
      </civ-card>

      <civ-card>
        <div data-card-header>
          <civ-tag label="Action needed" variant="red"></civ-tag>
          <civ-link href="#/claims/789" class="civ-heading-md">Education benefits</civ-link>
        </div>
        <p>Filed: January 5, 2026</p>
        <p>Additional documents required</p>
      </civ-card>
    </div>
  `,
};

export const Plain: Story = {
  name: 'Plain (No Header)',
  render: () => html`
    <civ-card>
      <p>A simple card with no header or footer. Just body content.</p>
    </civ-card>
  `,
};

export const Small: Story = {
  render: () => html`
    <civ-card spacing="sm">
      <div data-card-header>
        <h3 class="civ-heading-md">Compact card</h3>
      </div>
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
        <civ-card>
          <div data-card-header>
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <div class="civ-flex civ-justify-between civ-items-center">
              <civ-link href="#" class="civ-heading-md">Disability compensation</civ-link>
              <civ-button label="Edit" variant="tertiary"></civ-button>
            </div>
          </div>
          <p>Filed: March 10, 2026</p>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>

      <div>
        <p style="margin: 0 0 8px; font-weight: 600;">Default</p>
        <civ-card>
          <div data-card-header>
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <div class="civ-flex civ-justify-between civ-items-center">
              <civ-link href="#" class="civ-heading-md">Disability compensation</civ-link>
              <civ-button label="Edit" variant="tertiary"></civ-button>
            </div>
          </div>
          <p>Filed: March 10, 2026</p>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>

      <div data-civ-scale="spacious">
        <p style="margin: 0 0 8px; font-weight: 600;">Spacious</p>
        <civ-card>
          <div data-card-header>
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <div class="civ-flex civ-justify-between civ-items-center">
              <civ-link href="#" class="civ-heading-md">Disability compensation</civ-link>
              <civ-button label="Edit" variant="tertiary"></civ-button>
            </div>
          </div>
          <p>Filed: March 10, 2026</p>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>
    </div>
  `,
};
