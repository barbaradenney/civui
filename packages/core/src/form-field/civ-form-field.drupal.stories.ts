import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form-field/form-field.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';
// @ts-ignore
import formGroupTemplate from '../../../drupal/civui/components/form-group/form-group.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Core/Form Field/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Form Field',
  render: () => {
    const input = textInputTemplate({ name: 'email', type: 'email', required: true, autocomplete: 'email' });
    return render(template, {
      label: 'Email address',
      hint: 'Work email preferred',
      required: true,
      default: input,
    });
  },
};

export const FormGroup: Story = {
  name: 'Form Group',
  render: () => {
    const firstName = template({
      label: 'First name',
      required: true,
      default: textInputTemplate({ name: 'first_name', required: true }),
    });
    const lastName = template({
      label: 'Last name',
      required: true,
      default: textInputTemplate({ name: 'last_name', required: true }),
    });
    return render(formGroupTemplate, { default: firstName + lastName });
  },
};

export const WithHint: Story = {
  render: () => {
    const input = textInputTemplate({ name: 'phone', type: 'tel' });
    return render(template, {
      label: 'Phone number',
      hint: 'We may call this number to verify your identity',
      default: input,
    });
  },
};

export const WithError: Story = {
  render: () => {
    const input = textInputTemplate({ name: 'email_err', type: 'email' });
    return render(template, {
      label: 'Email address',
      error: 'Enter a valid email address',
      default: input,
    });
  },
};

export const Required: Story = {
  render: () => {
    const input = textInputTemplate({ name: 'name_req', required: true });
    return render(template, {
      label: 'Full name',
      required: true,
      default: input,
    });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = textInputTemplate({ name: 'name_dis', disabled: true });
    return render(template, {
      label: 'Full name',
      disabled: true,
      default: input,
    });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({
      label: 'Default',
      default: textInputTemplate({ name: 'ff1' }),
    });
    const hintField = template({
      label: 'With hint',
      hint: 'Hint text here',
      default: textInputTemplate({ name: 'ff2' }),
    });
    const errorField = template({
      label: 'With error',
      error: 'This field has an error',
      default: textInputTemplate({ name: 'ff3' }),
    });
    const requiredField = template({
      label: 'Required',
      required: true,
      default: textInputTemplate({ name: 'ff4', required: true }),
    });
    const disabledField = template({
      label: 'Disabled',
      disabled: true,
      default: textInputTemplate({ name: 'ff5', disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
