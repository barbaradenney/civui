import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/direct-deposit/direct-deposit.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Direct Deposit/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Direct deposit information',
    name: 'deposit',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Direct deposit information',
    name: 'deposit_err',
    required: true,
    error: 'Complete all banking information fields',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Direct deposit information',
    name: 'deposit_dis',
    disabled: true,
  }),
};
