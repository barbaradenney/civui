import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/yes-no/yes-no.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Yes No/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    legend: 'Are you a veteran?',
    name: 'veteran',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => render({
    legend: 'Are you a veteran?',
    name: 'veteran',
    hint: 'Answer yes if you served in the U.S. military',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Are you a veteran?',
    name: 'veteran',
    error: 'Select yes or no',
  }),
};

export const Required: Story = {
  render: () => render({
    legend: 'Are you a veteran?',
    name: 'veteran',
    required: true,
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Are you a veteran?',
    name: 'veteran',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultState = template({ legend: 'Default', name: 'yn1' });
    const hintState = template({ legend: 'With hint', name: 'yn2', hint: 'Hint text here' });
    const errorState = template({ legend: 'With error', name: 'yn3', error: 'Select yes or no' });
    const requiredState = template({ legend: 'Required', name: 'yn4', required: true });
    const disabledState = template({ legend: 'Disabled', name: 'yn5', disabled: true });
    return html`${unsafeHTML(defaultState + hintState + errorState + requiredState + disabledState)}`;
  },
};
