import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/relationship/relationship.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Relationship/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Dependent relationship',
    name: 'relationship',
    preset: 'dependent',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Dependent relationship',
    name: 'relationship_err',
    preset: 'dependent',
    required: true,
    error: 'Select a relationship type',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Dependent relationship',
    name: 'relationship_dis',
    preset: 'dependent',
    disabled: true,
  }),
};
