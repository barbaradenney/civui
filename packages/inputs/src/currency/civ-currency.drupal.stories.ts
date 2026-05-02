import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/currency/currency.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

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
    const input = template({ name: 'income' });
    return render(FormFieldTwig, { label: 'Annual income', hint: 'Enter amount in US dollars', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'income' });
    return render(FormFieldTwig, { label: 'Annual income', error: 'Enter a valid dollar amount', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'income', required: true });
    return render(FormFieldTwig, { label: 'Annual income', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'income', disabled: true });
    return render(FormFieldTwig, { label: 'Annual income', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1' }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'Enter amount in US dollars',
      default: template({ name: 'f2' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Enter a valid amount',
      default: template({ name: 'f3' }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
