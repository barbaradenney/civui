import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-list.js';
import './civ-list-item.js';
import '@civui/feedback/badge';

const meta: Meta = {
  title: 'Layout/List',
  component: 'civ-list',
  tags: ['autodocs'],
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

export const MixedClickableAndStatic: Story = {
  name: 'Mixed clickable + static rows',
  render: () => html`
    <civ-list dividers>
      <civ-list-item href="#/personal">
        Personal information
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact">
        Contact information
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item>
        Service history
        <civ-badge data-list-item-end label="Cannot start" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item>
        Supporting documents
        <civ-badge data-list-item-end label="Cannot start" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
    </civ-list>
  `,
};

export const TaskListPattern: Story = {
  name: 'Pattern: VA task list hub',
  render: () => html`
    <h1 class="civ-m-0 civ-mb-2 civ-text-2xl civ-font-bold">Apply for disability compensation</h1>
    <p class="civ-m-0 civ-mb-6 civ-text-muted">VA Form 21-526EZ</p>

    <h3 class="civ-heading-md civ-mb-2">Prepare</h3>
    <civ-list dividers>
      <civ-list-item href="#/eligibility">
        Check your eligibility
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
    </civ-list>

    <h3 class="civ-heading-md civ-mb-2 civ-mt-6">Fill out your application</h3>
    <civ-list dividers>
      <civ-list-item href="#/personal">
        <span class="civ-font-bold">Personal information</span>
        <span class="civ-block civ-text-sm civ-text-muted">Name, date of birth, Social Security number</span>
        <civ-badge data-list-item-end label="Complete" variant="success" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item href="#/contact">
        <span class="civ-font-bold">Contact information</span>
        <span class="civ-block civ-text-sm civ-text-muted">Address and phone number</span>
        <civ-badge data-list-item-end label="In progress" variant="info" badge-style="primary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item>
        <span class="civ-font-bold">Service history</span>
        <span class="civ-block civ-text-sm civ-text-muted">Branch, dates, and character of service</span>
        <civ-badge data-list-item-end label="Cannot start" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
      <civ-list-item>
        <span class="civ-font-bold">Disabilities and conditions</span>
        <span class="civ-block civ-text-sm civ-text-muted">List each condition you are claiming</span>
        <civ-badge data-list-item-end label="Cannot start" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
    </civ-list>

    <h3 class="civ-heading-md civ-mb-2 civ-mt-6">Review and submit</h3>
    <civ-list dividers>
      <civ-list-item>
        Review your application
        <civ-badge data-list-item-end label="Cannot start" variant="neutral" badge-style="secondary" with-icon></civ-badge>
      </civ-list-item>
    </civ-list>
  `,
};
