import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-email-link.js';

const meta: Meta = {
  title: 'Actions/Email Link',
  component: 'civ-email-link',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-email-link address="help@va.gov"></civ-email-link>`,
};

export const WithLabel: Story = {
  name: 'Custom Label',
  render: () => html`<civ-email-link address="help@va.gov" label="Email the help desk"></civ-email-link>`,
};

export const WithSubject: Story = {
  name: 'With Subject',
  render: () => html`<civ-email-link address="help@va.gov" label="Ask about benefits" subject="Benefits question"></civ-email-link>`,
};
