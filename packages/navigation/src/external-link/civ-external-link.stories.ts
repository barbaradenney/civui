import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-external-link.js';

const meta: Meta = {
  title: 'Actions/External Link',
  component: 'civ-external-link',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-external-link href="https://va.gov" label="Visit VA.gov"></civ-external-link>`,
};

export const Disabled: Story = {
  render: () => html`<civ-external-link href="https://va.gov" label="Visit VA.gov" disabled></civ-external-link>`,
};
