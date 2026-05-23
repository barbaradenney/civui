import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-tabs.js';
import './civ-tab.js';
import './civ-tab-panel.js';

const meta: Meta = {
  title: 'Navigation/Tabs',
  component: 'civ-tabs',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-tabs label="Account settings" value="profile">
      <civ-tab value="profile" label="Profile"></civ-tab>
      <civ-tab value="security" label="Security"></civ-tab>
      <civ-tab value="notifications" label="Notifications"></civ-tab>

      <civ-tab-panel value="profile">
        <h3 class="civ-mt-0">Profile</h3>
        <p>Update your display name, photo, and contact preferences.</p>
      </civ-tab-panel>
      <civ-tab-panel value="security">
        <h3 class="civ-mt-0">Security</h3>
        <p>Change your password, manage sign-in devices, and review login history.</p>
      </civ-tab-panel>
      <civ-tab-panel value="notifications">
        <h3 class="civ-mt-0">Notifications</h3>
        <p>Choose which updates we send by email and text.</p>
      </civ-tab-panel>
    </civ-tabs>
  `,
};

export const TwoTabs: Story = {
  render: () => html`
    <civ-tabs label="Application status">
      <civ-tab value="open" label="Open (3)"></civ-tab>
      <civ-tab value="closed" label="Closed"></civ-tab>

      <civ-tab-panel value="open">Three open applications.</civ-tab-panel>
      <civ-tab-panel value="closed">No closed applications yet.</civ-tab-panel>
    </civ-tabs>
  `,
};

export const WithDisabledTab: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      Disabled tabs are skipped by arrow-key navigation.
    </p>
    <civ-tabs label="Forms" value="active">
      <civ-tab value="active" label="Active forms"></civ-tab>
      <civ-tab value="drafts" label="Drafts"></civ-tab>
      <civ-tab value="archived" label="Archived" disabled></civ-tab>

      <civ-tab-panel value="active">Forms you're actively working on.</civ-tab-panel>
      <civ-tab-panel value="drafts">Forms you've saved as drafts.</civ-tab-panel>
      <civ-tab-panel value="archived">Archive is empty.</civ-tab-panel>
    </civ-tabs>
  `,
};

export const RichPanelContent: Story = {
  render: () => html`
    <civ-tabs label="Application overview" value="summary">
      <civ-tab value="summary" label="Summary"></civ-tab>
      <civ-tab value="documents" label="Documents (4)"></civ-tab>
      <civ-tab value="history" label="History"></civ-tab>

      <civ-tab-panel value="summary">
        <h3 class="civ-mt-0">Application VA-21P-527</h3>
        <p>Pension claim filed on May 5, 2026. Currently under review.</p>
        <civ-button variant="primary">Continue application</civ-button>
      </civ-tab-panel>
      <civ-tab-panel value="documents">
        <ul>
          <li>DD-214 — uploaded May 1, 2026</li>
          <li>Marriage certificate — uploaded May 2, 2026</li>
          <li>Birth certificate — uploaded May 3, 2026</li>
          <li>VA Form 21-526EZ — submitted May 5, 2026</li>
        </ul>
      </civ-tab-panel>
      <civ-tab-panel value="history">
        <p>Activity history will appear here once your application is processed.</p>
      </civ-tab-panel>
    </civ-tabs>
  `,
};

export const Keyboard: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      Focus a tab and try <kbd>←</kbd> / <kbd>→</kbd> to move between tabs,
      <kbd>Home</kbd> / <kbd>End</kbd> to jump to first / last.
    </p>
    <civ-tabs label="Keyboard demo" value="first">
      <civ-tab value="first" label="First"></civ-tab>
      <civ-tab value="second" label="Second"></civ-tab>
      <civ-tab value="third" label="Third"></civ-tab>
      <civ-tab value="fourth" label="Fourth"></civ-tab>

      <civ-tab-panel value="first">Panel 1 content.</civ-tab-panel>
      <civ-tab-panel value="second">Panel 2 content.</civ-tab-panel>
      <civ-tab-panel value="third">Panel 3 content.</civ-tab-panel>
      <civ-tab-panel value="fourth">Panel 4 content.</civ-tab-panel>
    </civ-tabs>
  `,
};
