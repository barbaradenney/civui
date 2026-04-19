import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-prefill-notice.js';
import '../name/civ-name.js';
import '../text-input/civ-text-input.js';
import '../read-only-field/civ-read-only-field.js';

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

export const WithPrefilledForm: Story = {
  name: 'With Prefilled Form Fields',
  render: () => html`
    <civ-prefill-notice profile-href="/profile"></civ-prefill-notice>

    <civ-read-only-field
      label="Social Security number"
      value="●●●-●●-6789"
      hint="This is from your verified identity. Contact us to update."
    ></civ-read-only-field>

    <civ-name legend="Your name" name="name" required></civ-name>
    <civ-text-input label="Email address" name="email" type="email" value="jane.doe@va.gov"></civ-text-input>
    <civ-text-input label="Home phone number" name="phone" type="tel" value="(555) 123-4567" mask="phone-us"></civ-text-input>
  `,
  play: async ({ canvasElement }) => {
    const name = canvasElement.querySelector('civ-name') as any;
    if (name) name.nameValue = { first: 'Jane', middle: 'A', last: 'Doe', suffix: '' };
  },
};
