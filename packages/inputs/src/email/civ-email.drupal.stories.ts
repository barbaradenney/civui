import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/email/email.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Email/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'email',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'email', required: true, label: 'Email address', hint: 'Work email preferred' });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'email', label: 'Email address', error: 'Enter a valid email address' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'email', required: true, label: 'Email address' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'email', disabled: true, label: 'Email address' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'Work email preferred' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid email' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
