import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/ein/ein.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/EIN/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'ein',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'ein', required: true, label: 'Employer Identification Number', hint: 'For example: 12-3456789' });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'ein', label: 'Employer Identification Number', error: 'Enter a valid EIN' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'ein', required: true, label: 'Employer Identification Number' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'ein', disabled: true, label: 'Employer Identification Number' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'For example: 12-3456789' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid EIN' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
