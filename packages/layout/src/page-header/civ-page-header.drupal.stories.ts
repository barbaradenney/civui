import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/page-header/page-header.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Page Header/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    default: '<h1>Apply for VA health care</h1><p>VA Form 10-10EZ</p>',
  }),
};

export const SimpleHeading: Story = {
  name: 'Simple Heading',
  render: () => render({
    default: '<h1>My VA Benefits</h1>',
  }),
};

export const WithSubtitle: Story = {
  name: 'With Subtitle',
  render: () => render({
    default: '<h1>Education benefits</h1><p>Apply for and manage your GI Bill and education benefits.</p>',
  }),
};
