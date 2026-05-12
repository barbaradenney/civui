import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/zip/zip.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/ZIP Code/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'zip',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'zip', required: true, label: 'ZIP code', hint: 'For example: 22150' });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'zip', label: 'ZIP code', error: 'Enter a valid ZIP code' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'zip', required: true, label: 'ZIP code' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'zip', disabled: true, label: 'ZIP code' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'For example: 22150' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid ZIP code' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
