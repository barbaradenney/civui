import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-list.js';
import './civ-list-item.js';

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

export const SideNavWithCurrent: Story = {
  name: 'Side nav with current page',
  render: () => html`
    <civ-list>
      <civ-list-item href="#/dashboard">Dashboard</civ-list-item>
      <civ-list-item href="#/claims" current>Claims</civ-list-item>
      <civ-list-item href="#/messages">Messages</civ-list-item>
      <civ-list-item href="#/settings">Settings</civ-list-item>
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
