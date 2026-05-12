import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/currency/currency.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Currency/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'income',
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'income', label: 'Annual income', hint: 'Enter amount in US dollars', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'income', label: 'Annual income', error: 'Enter a valid dollar amount' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'income', required: true, label: 'Annual income' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'income', disabled: true, label: 'Annual income' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', label: 'Default' });
    const hintField = template({ name: 'f2', label: 'With hint', hint: 'Enter amount in US dollars' });
    const errorField = template({ name: 'f3', label: 'With error', error: 'Enter a valid amount' });
    const requiredField = template({ name: 'f4', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
