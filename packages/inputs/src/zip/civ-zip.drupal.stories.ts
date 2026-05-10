import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/zip/zip.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

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
    const input = template({ name: 'zip', required: true });
    return render(FormFieldTwig, { label: 'ZIP code', hint: 'For example: 22150', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'zip' });
    return render(FormFieldTwig, { label: 'ZIP code', error: 'Enter a valid ZIP code', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'zip', required: true });
    return render(FormFieldTwig, { label: 'ZIP code', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'zip', disabled: true });
    return render(FormFieldTwig, { label: 'ZIP code', disabled: true, default: input });
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
      hint: 'For example: 22150',
      default: template({ name: 'f2' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Enter a valid ZIP code',
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
