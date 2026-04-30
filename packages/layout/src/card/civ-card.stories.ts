import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-card.js';
import '../tag/civ-tag.js';
import '@civui/actions/button';
import '@civui/navigation/link';
import '@civui/actions/action-button';

const meta: Meta = {
  title: 'UI/Card',
  component: 'civ-card',
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['', 'blue', 'teal', 'red', 'green', 'yellow', 'orange', 'purple', 'gray'],
    },
    cardStyle: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    spacing: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Tertiary (Default)',
  render: () => html`
    <civ-card>
      <p>Default card with white background and border outline.</p>
    </civ-card>
  `,
};

export const AllStyles: Story = {
  name: 'All Styles',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-card card-style="primary">
        <div data-card-header><h3 class="civ-heading-md">Primary</h3></div>
        <p>Filled primary color background with white text.</p>
      </civ-card>
      <civ-card card-style="secondary">
        <div data-card-header><h3 class="civ-heading-md">Secondary</h3></div>
        <p>Light tint background.</p>
      </civ-card>
      <civ-card card-style="tertiary">
        <div data-card-header><h3 class="civ-heading-md">Tertiary (Default)</h3></div>
        <p>White background with border outline.</p>
      </civ-card>
    </div>
  `,
};

export const ColorPaletteSecondary: Story = {
  name: 'Color Palette (Secondary)',
  render: () => html`
    <div class="civ-grid civ-grid-cols-2 civ-gap-4">
      <civ-card color="blue"><p>Blue</p></civ-card>
      <civ-card color="teal"><p>Teal</p></civ-card>
      <civ-card color="green"><p>Green</p></civ-card>
      <civ-card color="red"><p>Red</p></civ-card>
      <civ-card color="yellow"><p>Yellow</p></civ-card>
      <civ-card color="orange"><p>Orange</p></civ-card>
      <civ-card color="purple"><p>Purple</p></civ-card>
      <civ-card color="gray"><p>Gray</p></civ-card>
    </div>
  `,
};

export const ColorPalettePrimary: Story = {
  name: 'Color Palette (Primary)',
  render: () => html`
    <div class="civ-grid civ-grid-cols-2 civ-gap-4">
      <civ-card color="blue" card-style="primary"><p>Blue</p></civ-card>
      <civ-card color="teal" card-style="primary"><p>Teal</p></civ-card>
      <civ-card color="green" card-style="primary"><p>Green</p></civ-card>
      <civ-card color="red" card-style="primary"><p>Red</p></civ-card>
      <civ-card color="yellow" card-style="primary"><p>Yellow</p></civ-card>
      <civ-card color="orange" card-style="primary"><p>Orange</p></civ-card>
      <civ-card color="purple" card-style="primary"><p>Purple</p></civ-card>
      <civ-card color="gray" card-style="primary"><p>Gray</p></civ-card>
    </div>
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
            <civ-action-button label="Edit" variant="tertiary"></civ-action-button>
            <civ-action-button label="Remove" variant="tertiary" danger></civ-action-button>
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

export const Small: Story = {
  name: 'Small Spacing',
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
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-card>
          <div data-card-header>
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <div class="civ-flex civ-justify-between civ-items-center">
              <civ-link href="#" class="civ-heading-md">Disability compensation</civ-link>
              <civ-action-button label="Edit" variant="tertiary"></civ-action-button>
            </div>
          </div>
          <p>Filed: March 10, 2026</p>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>

      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-card>
          <div data-card-header>
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <div class="civ-flex civ-justify-between civ-items-center">
              <civ-link href="#" class="civ-heading-md">Disability compensation</civ-link>
              <civ-action-button label="Edit" variant="tertiary"></civ-action-button>
            </div>
          </div>
          <p>Filed: March 10, 2026</p>
          <div data-card-footer>
            <civ-link href="#" variant="secondary">View details</civ-link>
          </div>
        </civ-card>
      </div>

      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-card>
          <div data-card-header>
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <div class="civ-flex civ-justify-between civ-items-center">
              <civ-link href="#" class="civ-heading-md">Disability compensation</civ-link>
              <civ-action-button label="Edit" variant="tertiary"></civ-action-button>
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

export const AppointmentCards: Story = {
  name: 'Appointment Cards',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-4">
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
    <div class="civ-flex civ-flex-col civ-gap-4">
      <civ-card>
        <div data-card-header>
          <div class="civ-flex civ-justify-between civ-items-center">
            <civ-tag label="In progress" variant="teal"></civ-tag>
            <civ-action-button label="View details" variant="tertiary"></civ-action-button>
          </div>
          <civ-link href="#/claims/123" class="civ-heading-md">Disability compensation</civ-link>
        </div>
        <p>Filed: March 10, 2026</p>
        <p>Step 3 of 5: Evidence gathering</p>
      </civ-card>

      <civ-card>
        <div data-card-header>
          <div class="civ-flex civ-justify-between civ-items-center">
            <civ-tag label="Decision made" variant="green" tag-style="primary"></civ-tag>
            <civ-action-button label="View details" variant="tertiary"></civ-action-button>
          </div>
          <civ-link href="#/claims/456" class="civ-heading-md">Travel reimbursement</civ-link>
        </div>
        <p>Filed: February 28, 2026</p>
        <p>Amount approved: $45.00</p>
      </civ-card>

      <civ-card>
        <div data-card-header>
          <div class="civ-flex civ-justify-between civ-items-center">
            <civ-tag label="Action needed" variant="red"></civ-tag>
            <civ-action-button label="View details" variant="tertiary"></civ-action-button>
          </div>
          <civ-link href="#/claims/789" class="civ-heading-md">Education benefits</civ-link>
        </div>
        <p>Filed: January 5, 2026</p>
        <p>Additional documents required</p>
      </civ-card>
    </div>
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
            <civ-action-button label="Edit" variant="tertiary"></civ-action-button>
            <civ-action-button label="Remove" variant="tertiary" danger></civ-action-button>
          </div>
        </div>
      </div>
      <p>Relationship: Spouse</p>
      <p>Date of birth: January 15, 1992</p>
    </civ-card>
  `,
};
