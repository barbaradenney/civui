import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/marriage-history/marriage-history.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Marriage History/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Marriage history',
    name: 'marriage',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Marriage history',
    name: 'marriage_err',
    required: true,
    error: 'Complete your marriage history information',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Marriage history',
    name: 'marriage_dis',
    disabled: true,
  }),
};
