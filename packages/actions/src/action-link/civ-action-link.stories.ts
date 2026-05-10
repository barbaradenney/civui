import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-action-link.js';

const meta: Meta = {
  title: 'Actions/Action Link',
  component: 'civ-action-link',
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['phone', 'email'] },
    number: { control: 'text' },
    address: { control: 'text' },
    subject: { control: 'text' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Phone: Story = {
  name: 'Phone',
  render: () => html`
    <civ-action-link type="phone" number="8005551234"></civ-action-link>
  `,
};

export const PhoneWithLabel: Story = {
  name: 'Phone with Label',
  render: () => html`
    <civ-action-link type="phone" number="8005551234" label="Call the VA help desk"></civ-action-link>
  `,
};

export const PhoneInternational: Story = {
  name: 'Phone International',
  render: () => html`
    <civ-action-link type="phone" number="+44 20 7946 0958"></civ-action-link>
  `,
};

export const Email: Story = {
  name: 'Email',
  render: () => html`
    <civ-action-link type="email" address="help@va.gov"></civ-action-link>
  `,
};

export const EmailWithLabel: Story = {
  name: 'Email with Label',
  render: () => html`
    <civ-action-link type="email" address="support@va.gov" label="Contact VA support"></civ-action-link>
  `,
};

export const EmailWithSubject: Story = {
  name: 'Email with Subject',
  render: () => html`
    <civ-action-link type="email" address="benefits@va.gov" subject="Question about my claim"></civ-action-link>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <civ-action-link type="phone" number="8005551234" disabled></civ-action-link>
      <civ-action-link type="email" address="help@va.gov" disabled></civ-action-link>
    </div>
  `,
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <civ-action-link type="phone" number="8005271000" label="VA benefits hotline"></civ-action-link>
      <civ-action-link type="phone" number="8008271000"></civ-action-link>
      <civ-action-link type="phone" number="711" label="TTY: 711"></civ-action-link>
      <civ-action-link type="email" address="help@va.gov"></civ-action-link>
      <civ-action-link type="email" address="benefits@va.gov" subject="Claim status" label="Email about your claim"></civ-action-link>
    </div>
  `,
};

export const GovernmentContactSection: Story = {
  name: 'Government Contact Section',
  render: () => html`
    <div style="max-width: 400px;">
      <h3 style="margin-bottom: 12px; font-weight: bold;">Need help?</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <civ-action-link type="phone" number="8008271000" label="Call us"></civ-action-link>
        <civ-action-link type="phone" number="711" label="TTY: 711"></civ-action-link>
        <civ-action-link type="email" address="help@va.gov" label="Email us"></civ-action-link>
      </div>
    </div>
  `,
};
