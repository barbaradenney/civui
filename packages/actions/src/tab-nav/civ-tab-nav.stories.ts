import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-tab-nav.js';
import './civ-tab-nav-item.js';

const meta: Meta = {
  title: 'Navigation/Tab Nav',
  component: 'civ-tab-nav',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-tab-nav label="Repository sections">
      <civ-tab-nav-item href="/repo" label="Code" current></civ-tab-nav-item>
      <civ-tab-nav-item href="/repo/issues" label="Issues"></civ-tab-nav-item>
      <civ-tab-nav-item href="/repo/pulls" label="Pull requests"></civ-tab-nav-item>
      <civ-tab-nav-item href="/repo/actions" label="Actions"></civ-tab-nav-item>
      <civ-tab-nav-item href="/repo/settings" label="Settings"></civ-tab-nav-item>
    </civ-tab-nav>
  `,
};

export const TwoItems: Story = {
  render: () => html`
    <civ-tab-nav label="Profile sections">
      <civ-tab-nav-item href="/profile" label="About"></civ-tab-nav-item>
      <civ-tab-nav-item href="/profile/activity" label="Activity" current></civ-tab-nav-item>
    </civ-tab-nav>
  `,
};

export const WithDisabled: Story = {
  render: () => html`
    <civ-tab-nav label="Account sections">
      <civ-tab-nav-item href="/account" label="Overview" current></civ-tab-nav-item>
      <civ-tab-nav-item href="/account/billing" label="Billing"></civ-tab-nav-item>
      <civ-tab-nav-item href="/account/admin" label="Admin" disabled></civ-tab-nav-item>
    </civ-tab-nav>
  `,
};

export const NoCurrentItem: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      With no <code>current</code> item, none of the links carry <code>aria-current</code>. Use this on landing pages that don't map to a single tab.
    </p>
    <civ-tab-nav label="Repository sections">
      <civ-tab-nav-item href="/repo" label="Code"></civ-tab-nav-item>
      <civ-tab-nav-item href="/repo/issues" label="Issues"></civ-tab-nav-item>
      <civ-tab-nav-item href="/repo/pulls" label="Pull requests"></civ-tab-nav-item>
    </civ-tab-nav>
  `,
};

export const MobileStacking: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      At ≤480px the tabs stack vertically. Resize the viewport to see it.
    </p>
    <div style="max-width: 360px; border: 1px dashed var(--civ-color-base-light); padding: 8px;">
      <civ-tab-nav label="Repository sections">
        <civ-tab-nav-item href="/repo" label="Code" current></civ-tab-nav-item>
        <civ-tab-nav-item href="/repo/issues" label="Issues"></civ-tab-nav-item>
        <civ-tab-nav-item href="/repo/pulls" label="Pull requests"></civ-tab-nav-item>
        <civ-tab-nav-item href="/repo/settings" label="Settings"></civ-tab-nav-item>
      </civ-tab-nav>
    </div>
  `,
};
