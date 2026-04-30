import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-list.js';
import './civ-list-item.js';
import '@civui/feedback/badge';
import '@civui/actions/action-button';

const meta: Meta = {
  title: 'Layout/List',
  component: 'civ-list',
  tags: ['autodocs'],
  argTypes: {
    dividers: { control: 'boolean' },
    spacing: { control: 'select', options: ['default', 'sm'] },
  },
};

export default meta;
type Story = StoryObj;

// ── Basic ────────────────────────────────────────────────────

export const Default: Story = {
  render: () => html`
    <civ-list>
      <civ-list-item href="#/dashboard">Dashboard</civ-list-item>
      <civ-list-item href="#/claims">Claims</civ-list-item>
      <civ-list-item href="#/messages">Messages</civ-list-item>
      <civ-list-item href="#/settings">Settings</civ-list-item>
    </civ-list>
  `,
};

export const WithDividers: Story = {
  name: 'With dividers',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/dashboard">Dashboard</civ-list-item>
      <civ-list-item href="#/claims">Claims</civ-list-item>
      <civ-list-item href="#/messages">Messages</civ-list-item>
      <civ-list-item href="#/settings">Settings</civ-list-item>
    </civ-list>
  `,
};

// ── Start slot (icons) ───────────────────────────────────────

export const WithIcons: Story = {
  name: 'With icons (start slot)',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/dashboard">
        <civ-icon data-list-item-start name="home"></civ-icon>
        Dashboard
      </civ-list-item>
      <civ-list-item href="#/claims">
        <civ-icon data-list-item-start name="edit"></civ-icon>
        My claims
      </civ-list-item>
      <civ-list-item href="#/messages">
        <civ-icon data-list-item-start name="mail"></civ-icon>
        Messages
      </civ-list-item>
      <civ-list-item href="#/settings">
        <civ-icon data-list-item-start name="settings"></civ-icon>
        Settings
      </civ-list-item>
    </civ-list>
  `,
};

// ── Heading + Description ────────────────────────────────────

export const HeadingAndDescription: Story = {
  name: 'Heading and description',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal" heading="Personal information" description="Name, date of birth, SSN"></civ-list-item>
      <civ-list-item href="#/contact" heading="Contact information" description="Phone, email, mailing address"></civ-list-item>
      <civ-list-item href="#/service" heading="Service history" description="Branch, dates, discharge type"></civ-list-item>
    </civ-list>
  `,
};

export const HeadingWithStartAndEnd: Story = {
  name: 'Heading + start icon + end badge',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal" heading="Personal information" description="Name, date of birth, SSN">
        <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact" heading="Contact information" description="Phone and email needed">
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item heading="Service history">
        <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
    </civ-list>
  `,
};

export const RichHeadingSlot: Story = {
  name: 'Rich heading slot (custom heading levels)',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal">
        <h2 data-list-item-heading class="civ-font-bold civ-text-lg civ-m-0">Personal information</h2>
        <p data-list-item-description class="civ-text-sm civ-text-base-dark civ-m-0">Name, date of birth, SSN</p>
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact">
        <h2 data-list-item-heading class="civ-font-bold civ-text-lg civ-m-0">Contact information</h2>
        <p data-list-item-description class="civ-text-sm civ-text-base-dark civ-m-0">
          Phone, email, and <a href="#/address">mailing address</a>
        </p>
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item>
        <h2 data-list-item-heading class="civ-font-bold civ-text-lg civ-m-0">Service history</h2>
        <p data-list-item-description class="civ-text-sm civ-text-base-dark civ-m-0">Complete previous sections first</p>
        <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary"></civ-badge>
      </civ-list-item>
    </civ-list>
  `,
};

export const RichDescriptionSlot: Story = {
  name: 'Rich description with links',
  render: () => html`
    <civ-list dividers>
      <civ-list-item heading="Disability compensation">
        <p data-list-item-description class="civ-text-sm civ-text-base-dark civ-m-0">
          Learn about <a href="#/eligibility">eligibility requirements</a> and
          <a href="#/rates">current compensation rates</a>.
        </p>
      </civ-list-item>
      <civ-list-item heading="Education benefits">
        <p data-list-item-description class="civ-text-sm civ-text-base-dark civ-m-0">
          Includes <strong>GI Bill</strong>, scholarships, and <a href="#/vettec">VET TEC</a> programs.
        </p>
      </civ-list-item>
    </civ-list>
  `,
};

// ── Mixed clickable + static ─────────────────────────────────

export const MixedClickableAndStatic: Story = {
  name: 'Mixed clickable + static rows',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal" heading="Personal information"></civ-list-item>
      <civ-list-item href="#/contact" heading="Contact information"></civ-list-item>
      <civ-list-item heading="Service history" description="Complete previous sections first"></civ-list-item>
      <civ-list-item heading="Supporting documents" description="Complete previous sections first"></civ-list-item>
    </civ-list>
  `,
};

// ── Current page ─────────────────────────────────────────────

export const SideNavWithCurrent: Story = {
  name: 'Side nav with current page',
  render: () => html`
    <civ-list>
      <civ-list-item href="#/dashboard">
        <civ-icon data-list-item-start name="home"></civ-icon>
        Dashboard
      </civ-list-item>
      <civ-list-item href="#/claims" current>
        <civ-icon data-list-item-start name="edit"></civ-icon>
        Claims
      </civ-list-item>
      <civ-list-item href="#/messages">
        <civ-icon data-list-item-start name="mail"></civ-icon>
        Messages
      </civ-list-item>
      <civ-list-item href="#/settings">
        <civ-icon data-list-item-start name="settings"></civ-icon>
        Settings
      </civ-list-item>
    </civ-list>
  `,
};

// ── Spacing ──────────────────────────────────────────────────

export const CompactSpacing: Story = {
  name: 'Compact spacing (sm)',
  render: () => html`
    <civ-list dividers spacing="sm">
      <civ-list-item href="#/1">
        <civ-icon data-list-item-start name="edit"></civ-icon>
        Claim #1234 — Disability
      </civ-list-item>
      <civ-list-item href="#/2">
        <civ-icon data-list-item-start name="edit"></civ-icon>
        Claim #5678 — Education
      </civ-list-item>
      <civ-list-item href="#/3">
        <civ-icon data-list-item-start name="edit"></civ-icon>
        Claim #9012 — Healthcare
      </civ-list-item>
    </civ-list>
  `,
};

// ── Density Scale ────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density scale',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h4 style="margin-bottom: 8px; font-weight: bold;">Dense</h4>
        <div data-civ-scale="dense">
          <civ-list dividers>
            <civ-list-item href="#/1" heading="Personal information" description="Name, date of birth, SSN">
              <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
              <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
            </civ-list-item>
            <civ-list-item href="#/2" heading="Contact information" description="Phone and email">
              <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
            </civ-list-item>
            <civ-list-item heading="Service history">
              <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary"></civ-badge>
            </civ-list-item>
          </civ-list>
        </div>
      </div>

      <div>
        <h4 style="margin-bottom: 8px; font-weight: bold;">Default</h4>
        <civ-list dividers>
          <civ-list-item href="#/1" heading="Personal information" description="Name, date of birth, SSN">
            <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
            <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
          </civ-list-item>
          <civ-list-item href="#/2" heading="Contact information" description="Phone and email">
            <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
          </civ-list-item>
          <civ-list-item heading="Service history">
            <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary"></civ-badge>
          </civ-list-item>
        </civ-list>
      </div>

      <div>
        <h4 style="margin-bottom: 8px; font-weight: bold;">Spacious</h4>
        <div data-civ-scale="spacious">
          <civ-list dividers>
            <civ-list-item href="#/1" heading="Personal information" description="Name, date of birth, SSN">
              <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
              <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
            </civ-list-item>
            <civ-list-item href="#/2" heading="Contact information" description="Phone and email">
              <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
            </civ-list-item>
            <civ-list-item heading="Service history">
              <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary"></civ-badge>
            </civ-list-item>
          </civ-list>
        </div>
      </div>
    </div>
  `,
};

// ── Nested ───────────────────────────────────────────────────

export const NestedList: Story = {
  name: 'Nested list',
  render: () => html`
    <civ-list dividers>
      <civ-list-item heading="Benefits">
        <civ-icon data-list-item-start name="home"></civ-icon>
        <civ-list dividers>
          <civ-list-item href="#/disability">Disability compensation</civ-list-item>
          <civ-list-item href="#/education">Education benefits</civ-list-item>
          <civ-list-item href="#/housing">Housing assistance</civ-list-item>
        </civ-list>
      </civ-list-item>
      <civ-list-item heading="Records">
        <civ-icon data-list-item-start name="user"></civ-icon>
        <civ-list>
          <civ-list-item href="#/dd214">DD214</civ-list-item>
          <civ-list-item href="#/medical">Medical records</civ-list-item>
        </civ-list>
      </civ-list-item>
    </civ-list>
  `,
};

// ── End slot (badges, actions) ───────────────────────────────

export const WithTrailingBadges: Story = {
  name: 'With trailing badges',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal">
        <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
        Personal information
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact">
        Contact information
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item>
        Service history
        <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
    </civ-list>
  `,
};

export const WithActionButtons: Story = {
  name: 'With action buttons (end slot)',
  render: () => html`
    <civ-list dividers>
      <civ-list-item heading="tax-return.pdf" description="1.2 MB">
        <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
        <civ-action-button data-list-item-end label="Remove" variant="tertiary" danger></civ-action-button>
      </civ-list-item>
      <civ-list-item heading="invalid-file.exe" error="This file type is not accepted">
        <civ-icon data-list-item-start name="error" class="civ-text-error"></civ-icon>
        <civ-action-button data-list-item-end label="Remove" variant="tertiary" danger></civ-action-button>
      </civ-list-item>
      <civ-list-item heading="uploading.pdf" description="Uploading...">
        <civ-icon data-list-item-start name="loading"></civ-icon>
        <civ-action-button data-list-item-end label="Cancel" variant="tertiary"></civ-action-button>
      </civ-list-item>
    </civ-list>
  `,
};

// ── Error ────────────────────────────────────────────────────

export const WithErrors: Story = {
  name: 'With errors',
  render: () => html`
    <civ-list dividers>
      <civ-list-item heading="budget.xlsx" error="File type not accepted. Upload a PDF, JPG, or PNG.">
        <civ-icon data-list-item-start name="error" class="civ-text-error"></civ-icon>
        <span data-list-item-end style="display: flex; gap: 4px;">
          <civ-action-button label="Retry" variant="tertiary"></civ-action-button>
          <civ-action-button label="Remove" variant="tertiary" danger></civ-action-button>
        </span>
      </civ-list-item>
      <civ-list-item heading="photo.bmp" error="File exceeds 10 MB limit.">
        <civ-icon data-list-item-start name="error" class="civ-text-error"></civ-icon>
        <civ-action-button data-list-item-end label="Remove" variant="tertiary" danger></civ-action-button>
      </civ-list-item>
    </civ-list>
  `,
};

// ── Government examples ──────────────────────────────────────

export const GovernmentTaskList: Story = {
  name: 'Government task list',
  render: () => html`
    <div style="max-width: 600px;">
      <h3 style="font-weight: bold; margin-bottom: 12px;">Fill out your application</h3>
      <civ-list dividers>
        <civ-list-item href="#/personal" heading="Personal information" description="Name, date of birth, SSN">
          <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
          <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/contact" heading="Contact information" description="Phone and email needed">
          <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item heading="Service history">
          <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary"></civ-badge>
        </civ-list-item>
        <civ-list-item heading="Review and submit" description="Complete all sections first">
          <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary"></civ-badge>
        </civ-list-item>
      </civ-list>
    </div>
  `,
};

export const GovernmentSideNav: Story = {
  name: 'Government side navigation',
  render: () => html`
    <nav style="max-width: 280px;" aria-label="Section navigation">
      <civ-list>
        <civ-list-item href="#/step-1" current>
          <civ-icon data-list-item-start name="check-circle" class="civ-text-success"></civ-icon>
          Step 1: Personal info
        </civ-list-item>
        <civ-list-item href="#/step-2">Step 2: Contact info</civ-list-item>
        <civ-list-item href="#/step-3">Step 3: Service history</civ-list-item>
        <civ-list-item>Step 4: Review</civ-list-item>
      </civ-list>
    </nav>
  `,
};
