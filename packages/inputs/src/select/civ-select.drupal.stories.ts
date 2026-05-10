import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/select/select.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Select/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'state',
    preset: 'us-state',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    const input = template({ name: 'state', preset: 'us-state', required: true });
    return render(FormFieldTwig, { label: 'State', hint: 'Select your state of residence', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'state', preset: 'us-state' });
    return render(FormFieldTwig, { label: 'State', error: 'Select a state', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'state', preset: 'us-state', required: true });
    return render(FormFieldTwig, { label: 'State', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'state', preset: 'us-state', disabled: true });
    return render(FormFieldTwig, { label: 'State', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1', preset: 'us-state' }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'Select your state',
      default: template({ name: 'f2', preset: 'us-state' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Select a state',
      default: template({ name: 'f3', preset: 'us-state' }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', preset: 'us-state', required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', preset: 'us-state', disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
