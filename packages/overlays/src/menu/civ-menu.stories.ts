import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-menu.js';
import './civ-menu-item.js';

const meta: Meta = {
  title: 'Overlays/Menu',
  component: 'civ-menu',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Anchored on-page menu for row actions and overflow menus. Renders as a popover on desktop and as a bottom sheet on mobile (≤480px). Follows the WAI-ARIA Menu Button keyboard pattern.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="min-height: 240px;">
      <civ-menu label="Row actions">
        <civ-button data-civ-menu-trigger variant="tertiary" label="More"></civ-button>
        <civ-menu-item value="edit">Edit</civ-menu-item>
        <civ-menu-item value="duplicate">Duplicate</civ-menu-item>
        <civ-menu-item value="archive">Archive</civ-menu-item>
      </civ-menu>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="min-height: 280px;">
      <civ-menu label="File actions">
        <civ-button data-civ-menu-trigger variant="tertiary" label="File actions"></civ-button>
        <civ-menu-item value="open" icon="open">Open</civ-menu-item>
        <civ-menu-item value="download" icon="download">Download</civ-menu-item>
        <civ-menu-item value="share" icon="share">Share</civ-menu-item>
      </civ-menu>
    </div>
  `,
};

export const WithDestructiveAction: Story = {
  render: () => html`
    <div style="min-height: 280px;">
      <civ-menu label="Record actions">
        <civ-button data-civ-menu-trigger variant="tertiary" label="Manage"></civ-button>
        <civ-menu-item value="edit">Edit</civ-menu-item>
        <civ-menu-item value="duplicate">Duplicate</civ-menu-item>
        <civ-menu-item value="delete" destructive>Delete</civ-menu-item>
      </civ-menu>
    </div>
  `,
};

export const AlignStart: Story = {
  name: 'Align Start (Left)',
  render: () => html`
    <div style="min-height: 280px;">
      <civ-menu label="Sort options" align="start">
        <civ-button data-civ-menu-trigger variant="tertiary" label="Sort"></civ-button>
        <civ-menu-item value="recent">Most recent</civ-menu-item>
        <civ-menu-item value="oldest">Oldest first</civ-menu-item>
        <civ-menu-item value="name-az">Name (A–Z)</civ-menu-item>
        <civ-menu-item value="name-za">Name (Z–A)</civ-menu-item>
      </civ-menu>
    </div>
  `,
};

export const WithDisabledItems: Story = {
  render: () => html`
    <div style="min-height: 280px;">
      <civ-menu label="Row actions">
        <civ-button data-civ-menu-trigger variant="tertiary" label="More"></civ-button>
        <civ-menu-item value="edit">Edit</civ-menu-item>
        <civ-menu-item value="duplicate" disabled>Duplicate (unavailable)</civ-menu-item>
        <civ-menu-item value="archive">Archive</civ-menu-item>
      </civ-menu>
    </div>
  `,
};

export const LinkItems: Story = {
  render: () => html`
    <div style="min-height: 280px;">
      <civ-menu label="Profile menu">
        <civ-button data-civ-menu-trigger variant="tertiary" label="Profile"></civ-button>
        <civ-menu-item href="/account">Account settings</civ-menu-item>
        <civ-menu-item href="/security">Security</civ-menu-item>
        <civ-menu-item href="/sign-out">Sign out</civ-menu-item>
      </civ-menu>
    </div>
  `,
};
