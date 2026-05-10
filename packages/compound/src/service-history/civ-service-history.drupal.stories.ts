import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/service-history/service-history.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Service History/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Service history',
    name: 'service',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Service history',
    name: 'service_err',
    required: true,
    error: 'Complete your service history information',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Service history',
    name: 'service_dis',
    disabled: true,
  }),
};
