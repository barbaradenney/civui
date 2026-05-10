import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/address/address.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Address/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Mailing address',
    name: 'mailing',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Mailing address',
    name: 'mailing_err',
    required: true,
    error: 'Complete all required address fields',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Mailing address',
    name: 'mailing_dis',
    disabled: true,
  }),
};
