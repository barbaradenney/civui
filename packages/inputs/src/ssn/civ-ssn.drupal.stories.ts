import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/ssn/ssn.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/SSN/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'ssn',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'ssn', required: true, label: 'Social Security number', hint: 'For example: 123-45-6789' });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'ssn', label: 'Social Security number', error: 'Enter a valid Social Security number' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'ssn', required: true, label: 'Social Security number' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'ssn', disabled: true, label: 'Social Security number' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'For example: 123-45-6789' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid SSN' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
