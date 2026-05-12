import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/va-file-number/va-file-number.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/VA File Number/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'va_file_number',
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'va_file_number', label: 'VA file number', hint: 'Your VA file number is on your benefit letter', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'va_file_number', label: 'VA file number', error: 'Enter a valid VA file number' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'va_file_number', required: true, label: 'VA file number' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'va_file_number', disabled: true, label: 'VA file number' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'Found on your benefit letter' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid VA file number' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
