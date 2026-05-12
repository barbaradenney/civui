import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/routing-number/routing-number.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Routing Number/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'routing',
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'routing', label: 'Routing number', hint: '9-digit number on your check', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'routing', label: 'Routing number', error: 'Enter a valid routing number' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'routing', required: true, label: 'Routing number' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'routing', disabled: true, label: 'Routing number' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: '9-digit number on your check' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid routing number' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
