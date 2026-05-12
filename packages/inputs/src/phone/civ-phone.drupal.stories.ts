import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/phone/phone.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Phone/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'phone',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'phone', required: true, label: 'Phone number', hint: 'For example: (555) 123-4567' });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'phone', label: 'Phone number', error: 'Enter a valid 10-digit phone number' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'phone', required: true, label: 'Phone number' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'phone', disabled: true, label: 'Phone number' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'For example: (555) 123-4567' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid phone number' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
