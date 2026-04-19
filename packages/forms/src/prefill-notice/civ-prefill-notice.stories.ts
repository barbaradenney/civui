import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-prefill-notice.js';

const meta: Meta = {
  title: 'Forms/Prefill Notice',
  component: 'civ-prefill-notice',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    profileHref: { control: 'text' },
    linkText: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`<civ-prefill-notice></civ-prefill-notice>`,
};

export const WithProfileLink: Story = {
  render: () => html`<civ-prefill-notice profile-href="/profile"></civ-prefill-notice>`,
};

export const CustomText: Story = {
  render: () => html`
    <civ-prefill-notice
      heading="Your information was loaded"
      body="We found your details on file. Please review and update if needed."
      profile-href="/settings"
      link-text="Go to settings"
    ></civ-prefill-notice>
  `,
};
