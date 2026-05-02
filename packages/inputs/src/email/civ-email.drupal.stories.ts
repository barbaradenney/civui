import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/email/email.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

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
    const input = template({ name: 'email', required: true });
    return render(FormFieldTwig, { label: 'Email address', hint: 'Work email preferred', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'email' });
    return render(FormFieldTwig, { label: 'Email address', error: 'Enter a valid email address', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'email', required: true });
    return render(FormFieldTwig, { label: 'Email address', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'email', disabled: true });
    return render(FormFieldTwig, { label: 'Email address', disabled: true, default: input });
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
      hint: 'Work email preferred',
      default: template({ name: 'f2' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Enter a valid email',
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
