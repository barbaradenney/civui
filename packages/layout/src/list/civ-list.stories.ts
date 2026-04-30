import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-list.js';
import './civ-list-item.js';
import '@civui/feedback/badge';

const meta: Meta = {
  title: 'Layout/List',
  component: 'civ-list',
  tags: ['autodocs'],
  argTypes: {
    dividers: { control: 'boolean' },
    variant: { control: 'select', options: ['default', 'primary', 'secondary'] },
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

// ── Icons ────────────────────────────────────────────────────

export const WithIcons: Story = {
  name: 'With icons',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/dashboard" icon-start="home">Dashboard</civ-list-item>
      <civ-list-item href="#/claims" icon-start="edit">My claims</civ-list-item>
      <civ-list-item href="#/messages" icon-start="mail">Messages</civ-list-item>
      <civ-list-item href="#/settings" icon-start="settings">Settings</civ-list-item>
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

export const HeadingWithIcons: Story = {
  name: 'Heading + icons + badges',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal" icon-start="check-circle" heading="Personal information" description="Name, date of birth, SSN">
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact" icon-start="edit" heading="Contact information" description="Phone and email needed">
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item icon-start="lock" heading="Service history">
        <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
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
      <civ-list-item href="#/dashboard" icon-start="home">Dashboard</civ-list-item>
      <civ-list-item href="#/claims" icon-start="edit" current>Claims</civ-list-item>
      <civ-list-item href="#/messages" icon-start="mail">Messages</civ-list-item>
      <civ-list-item href="#/settings" icon-start="settings">Settings</civ-list-item>
    </civ-list>
  `,
};

// ── Variants ─────────────────────────────────────────────────

export const PrimaryVariant: Story = {
  name: 'Primary variant',
  render: () => html`
    <civ-list dividers variant="primary">
      <civ-list-item href="#/1" heading="Education benefits" description="GI Bill, scholarships"></civ-list-item>
      <civ-list-item href="#/2" heading="Disability compensation" description="Service-connected claims"></civ-list-item>
      <civ-list-item href="#/3" heading="Healthcare enrollment" description="VA medical center"></civ-list-item>
    </civ-list>
  `,
};

export const SecondaryVariant: Story = {
  name: 'Secondary variant',
  render: () => html`
    <civ-list dividers variant="secondary">
      <civ-list-item href="#/1" heading="Education benefits"></civ-list-item>
      <civ-list-item href="#/2" heading="Disability compensation"></civ-list-item>
      <civ-list-item href="#/3" heading="Healthcare enrollment"></civ-list-item>
    </civ-list>
  `,
};

// ── Spacing ──────────────────────────────────────────────────

export const CompactSpacing: Story = {
  name: 'Compact spacing (sm)',
  render: () => html`
    <civ-list dividers spacing="sm">
      <civ-list-item href="#/1" icon-start="edit">Claim #1234 — Disability</civ-list-item>
      <civ-list-item href="#/2" icon-start="edit">Claim #5678 — Education</civ-list-item>
      <civ-list-item href="#/3" icon-start="edit">Claim #9012 — Healthcare</civ-list-item>
    </civ-list>
  `,
};

export const CompactWithHeadings: Story = {
  name: 'Compact with headings',
  render: () => html`
    <civ-list dividers spacing="sm">
      <civ-list-item href="#/1" heading="Claim #1234" description="Disability compensation"></civ-list-item>
      <civ-list-item href="#/2" heading="Claim #5678" description="Education benefits"></civ-list-item>
      <civ-list-item href="#/3" heading="Claim #9012" description="Healthcare enrollment"></civ-list-item>
    </civ-list>
  `,
};

// ── Nested ───────────────────────────────────────────────────

export const NestedList: Story = {
  name: 'Nested list',
  render: () => html`
    <civ-list dividers>
      <civ-list-item icon-start="home" heading="Benefits">
        <civ-list dividers>
          <civ-list-item href="#/disability">Disability compensation</civ-list-item>
          <civ-list-item href="#/education">Education benefits</civ-list-item>
          <civ-list-item href="#/housing">Housing assistance</civ-list-item>
        </civ-list>
      </civ-list-item>
      <civ-list-item icon-start="user" heading="Records">
        <civ-list>
          <civ-list-item href="#/dd214">DD214</civ-list-item>
          <civ-list-item href="#/medical">Medical records</civ-list-item>
        </civ-list>
      </civ-list-item>
    </civ-list>
  `,
};

// ── Trailing badges ──────────────────────────────────────────

export const WithTrailingBadges: Story = {
  name: 'With trailing badges',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal" icon-start="check-circle">
        Personal information
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact" icon-start="edit">
        Contact information
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item icon-start="lock">
        Service history
        <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary" with-icon></civ-badge>
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
        <civ-list-item href="#/personal" icon-start="check-circle" heading="Personal information" description="Name, date of birth, SSN">
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
        <civ-list-item href="#/step-1" icon-start="check-circle" current>Step 1: Personal info</civ-list-item>
        <civ-list-item href="#/step-2">Step 2: Contact info</civ-list-item>
        <civ-list-item href="#/step-3">Step 3: Service history</civ-list-item>
        <civ-list-item>Step 4: Review</civ-list-item>
      </civ-list>
    </nav>
  `,
};
