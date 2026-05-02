import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/race-ethnicity/race-ethnicity.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Compound/Race & Ethnicity/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Race, ethnicity, and origin',
    name: 'race_ethnicity',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Race, ethnicity, and origin',
    name: 'race_ethnicity_err',
    required: true,
    error: 'Select at least one option',
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Race, ethnicity, and origin',
    name: 'race_ethnicity_dis',
    disabled: true,
  }),
};
