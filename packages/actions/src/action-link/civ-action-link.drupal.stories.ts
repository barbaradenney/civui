import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/action-link/action-link.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Actions/Action Link/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    type: 'phone',
    number: '8005271000',
    label: 'VA benefits hotline',
  }),
};

export const EmailLink: Story = {
  name: 'Email',
  render: () => render({
    type: 'email',
    email: 'help@va.gov',
    label: 'Email VA support',
  }),
};

export const ExternalLink: Story = {
  name: 'External',
  render: () => render({
    type: 'external',
    href: 'https://www.va.gov',
    label: 'Visit VA.gov',
  }),
};

export const AllTypes: Story = {
  name: 'All Types',
  render: () => {
    const phone = template({ type: 'phone', number: '8005271000', label: 'VA benefits hotline' });
    const email = template({ type: 'email', email: 'help@va.gov', label: 'Email VA support' });
    const external = template({ type: 'external', href: 'https://www.va.gov', label: 'Visit VA.gov' });
    return html`${unsafeHTML(phone + email + external)}`;
  },
};
