import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-nav.js';
import './civ-nav-item.js';

const meta: Meta = {
  title: 'Navigation/Nav',
  component: 'civ-nav',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-nav label="Primary navigation">
      <civ-nav-item href="/" label="Home" current></civ-nav-item>
      <civ-nav-item href="/benefits" label="Benefits"></civ-nav-item>
      <civ-nav-item href="/forms" label="Forms"></civ-nav-item>
      <civ-nav-item href="/contact" label="Contact"></civ-nav-item>
    </civ-nav>
  `,
};

export const NoActivePage: Story = {
  render: () => html`
    <civ-nav label="Primary navigation">
      <civ-nav-item href="/" label="Home"></civ-nav-item>
      <civ-nav-item href="/benefits" label="Benefits"></civ-nav-item>
      <civ-nav-item href="/contact" label="Contact"></civ-nav-item>
    </civ-nav>
  `,
};

export const WithDisabled: Story = {
  render: () => html`
    <civ-nav label="Primary navigation">
      <civ-nav-item href="/" label="Home" current></civ-nav-item>
      <civ-nav-item href="/benefits" label="Benefits"></civ-nav-item>
      <civ-nav-item href="/admin" label="Admin" disabled></civ-nav-item>
    </civ-nav>
  `,
};

export const FooterNavigation: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      Multiple navs on the same page each need a distinct <code>label</code>.
    </p>
    <civ-nav label="Footer navigation">
      <civ-nav-item href="/privacy" label="Privacy"></civ-nav-item>
      <civ-nav-item href="/accessibility" label="Accessibility"></civ-nav-item>
      <civ-nav-item href="/foia" label="FOIA"></civ-nav-item>
      <civ-nav-item href="/contact" label="Contact"></civ-nav-item>
    </civ-nav>
  `,
};

export const MobileStacking: Story = {
  render: () => html`
    <p class="civ-italic civ-mb-2">
      At ≤480px the items stack vertically. Resize the viewport to see it.
    </p>
    <div style="max-width: 360px; border: 1px dashed var(--civ-color-base-light); padding: 8px;">
      <civ-nav label="Primary navigation">
        <civ-nav-item href="/" label="Home" current></civ-nav-item>
        <civ-nav-item href="/benefits" label="Benefits"></civ-nav-item>
        <civ-nav-item href="/forms" label="Forms"></civ-nav-item>
        <civ-nav-item href="/contact" label="Contact"></civ-nav-item>
      </civ-nav>
    </div>
  `,
};
