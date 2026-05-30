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

export const HorizontalScroll: Story = {
  name: 'Horizontal Scroll (overflow)',
  parameters: {
    docs: {
      description: {
        story:
          'On a wide viewport where the tab row is longer than its container, wrap `civ-tab-nav` in the `.civ-scroll-x` utility so the links scroll horizontally. A scoped style switches the list from its default `flex-wrap` to `nowrap` so it overflows. Note: at ≤480px `civ-tab-nav` intentionally stacks vertically (see the Mobile Stacking story), so this horizontal-scroll treatment is a desktop / wide-container affordance — on a narrow viewport the vertical stack is the right pattern.',
      },
    },
  },
  render: () => html`
    <style>
      .civ-tabnav-scroll-demo .civ-tab-nav__list {
        flex-wrap: nowrap;
      }
    </style>
    <div
      class="civ-tabnav-scroll-demo"
      style="max-width: 420px; border: 1px dashed var(--civ-color-base-light); padding: var(--civ-spacing-2);"
    >
      <div class="civ-scroll-x">
        <civ-tab-nav label="Repository sections">
          <civ-tab-nav-item href="/repo" label="Code" current></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/issues" label="Issues"></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/pulls" label="Pull requests"></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/actions" label="Actions"></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/projects" label="Projects"></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/wiki" label="Wiki"></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/security" label="Security"></civ-tab-nav-item>
          <civ-tab-nav-item href="/repo/settings" label="Settings"></civ-tab-nav-item>
        </civ-tab-nav>
      </div>
    </div>
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
