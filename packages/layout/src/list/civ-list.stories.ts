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

export const SimpleNavList: Story = {
  name: 'Simple navigation list',
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

export const MixedClickableAndStatic: Story = {
  name: 'Mixed clickable + static rows',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal">Personal information</civ-list-item>
      <civ-list-item href="#/contact">Contact information</civ-list-item>
      <civ-list-item>Service history (locked)</civ-list-item>
      <civ-list-item>Supporting documents (locked)</civ-list-item>
    </civ-list>
  `,
};

export const PrimaryVariant: Story = {
  name: 'Primary variant',
  render: () => html`
    <civ-list dividers variant="primary">
      <civ-list-item href="#/1">Education benefits</civ-list-item>
      <civ-list-item href="#/2">Disability compensation</civ-list-item>
      <civ-list-item href="#/3">Healthcare enrollment</civ-list-item>
    </civ-list>
  `,
};

export const SecondaryVariant: Story = {
  name: 'Secondary variant',
  render: () => html`
    <civ-list dividers variant="secondary">
      <civ-list-item href="#/1">Education benefits</civ-list-item>
      <civ-list-item href="#/2">Disability compensation</civ-list-item>
      <civ-list-item href="#/3">Healthcare enrollment</civ-list-item>
    </civ-list>
  `,
};

export const CompactSpacing: Story = {
  name: 'Compact spacing (sm)',
  render: () => html`
    <civ-list dividers spacing="sm">
      <civ-list-item href="#/1" icon-start="edit">Claim #1234</civ-list-item>
      <civ-list-item href="#/2" icon-start="edit">Claim #5678</civ-list-item>
      <civ-list-item href="#/3" icon-start="edit">Claim #9012</civ-list-item>
    </civ-list>
  `,
};

export const NestedList: Story = {
  name: 'Nested list',
  render: () => html`
    <civ-list dividers>
      <civ-list-item icon-start="home">
        Benefits
        <civ-list dividers>
          <civ-list-item href="#/disability">Disability compensation</civ-list-item>
          <civ-list-item href="#/education">Education benefits</civ-list-item>
          <civ-list-item href="#/housing">Housing assistance</civ-list-item>
        </civ-list>
      </civ-list-item>
      <civ-list-item icon-start="user">
        Records
        <civ-list>
          <civ-list-item href="#/dd214">DD214</civ-list-item>
          <civ-list-item href="#/medical">Medical records</civ-list-item>
        </civ-list>
      </civ-list-item>
    </civ-list>
  `,
};

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

export const GovernmentTaskList: Story = {
  name: 'Government task list',
  render: () => html`
    <div style="max-width: 600px;">
      <h3 style="font-weight: bold; margin-bottom: 12px;">Fill out your application</h3>
      <civ-list dividers>
        <civ-list-item href="#/personal" icon-start="check-circle">
          <span class="civ-block civ-font-bold">Personal information</span>
          <span class="civ-block civ-text-sm civ-text-base">Name, date of birth, SSN</span>
          <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item href="#/contact">
          <span class="civ-block civ-font-bold">Contact information</span>
          <span class="civ-block civ-text-sm civ-text-base">Phone and email needed</span>
          <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
        </civ-list-item>
        <civ-list-item>
          <span class="civ-block civ-font-bold">Service history</span>
          <civ-badge data-list-item-end label="Not started" variant="info" badge-style="secondary"></civ-badge>
        </civ-list-item>
        <civ-list-item>
          <span class="civ-block civ-font-bold">Review and submit</span>
          <span class="civ-block civ-text-sm civ-text-base">Complete all sections first</span>
          <civ-badge data-list-item-end label="Cannot start yet" variant="neutral" badge-style="secondary"></civ-badge>
        </civ-list-item>
      </civ-list>
    </div>
  `,
};
