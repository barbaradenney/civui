import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-download-link.js';

const meta: Meta = {
  title: 'Actions/Download Link',
  component: 'civ-download-link',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-download-link href="/forms/10-10EZ.pdf" label="Download VA Form 10-10EZ" filename="10-10EZ.pdf"></civ-download-link>`,
};

export const WithFileSize: Story = {
  name: 'With File Size',
  render: () => html`<civ-download-link href="/forms/10-10EZ.pdf" label="Download VA Form 10-10EZ" filename="10-10EZ.pdf" file-size="1.2 MB"></civ-download-link>`,
};
