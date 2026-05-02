import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/name/name.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Name/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Veteran name',
    name: 'veteran',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Veteran name',
    name: 'veteran_err',
    required: true,
    error: 'Enter your full legal name',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Veteran name',
    name: 'veteran_dis',
    disabled: true,
  }),
};
