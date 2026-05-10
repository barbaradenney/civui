import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/signature/signature.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Signature/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Veteran signature',
    name: 'signature',
    statement: 'I certify the information above is accurate and complete to the best of my knowledge and belief.',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Veteran signature',
    name: 'signature_err',
    statement: 'I certify the information above is accurate and complete to the best of my knowledge and belief.',
    required: true,
    error: 'You must sign to continue',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Veteran signature',
    name: 'signature_dis',
    statement: 'I certify the information above is accurate and complete to the best of my knowledge and belief.',
    disabled: true,
  }),
};
