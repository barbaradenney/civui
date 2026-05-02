import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/country/country.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Country/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'country',
    us_first: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    const input = template({ name: 'country', us_first: true });
    return render(FormFieldTwig, { label: 'Country', hint: 'Select your country of residence', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'country', us_first: true });
    return render(FormFieldTwig, { label: 'Country', error: 'Select a country', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'country', us_first: true, required: true });
    return render(FormFieldTwig, { label: 'Country', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'country', us_first: true, disabled: true });
    return render(FormFieldTwig, { label: 'Country', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1', us_first: true }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'Select your country',
      default: template({ name: 'f2', us_first: true }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Select a country',
      default: template({ name: 'f3', us_first: true }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', us_first: true, required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', us_first: true, disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
