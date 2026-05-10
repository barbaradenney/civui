import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/repeater/repeater.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Repeater/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Dependents',
    name: 'dependents',
    item_label: 'Dependent',
    mode: 'form-steps',
  }),
};

export const InlineMode: Story = {
  name: 'Inline Mode',
  render: () => render({
    legend: 'Previous employers',
    name: 'employers',
    item_label: 'Employer',
    mode: 'inline',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Dependents',
    name: 'dependents_dis',
    item_label: 'Dependent',
    mode: 'form-steps',
    disabled: true,
  }),
};
