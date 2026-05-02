import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/textarea/textarea.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Textarea/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'comments',
    rows: 4,
    maxlength: 500,
  }),
};

export const WithHint: Story = {
  render: () => {
    const input = template({ name: 'comments', rows: 4, maxlength: 500 });
    return render(FormFieldTwig, { label: 'Additional comments', hint: 'Provide any relevant details', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'comments', rows: 4, maxlength: 500 });
    return render(FormFieldTwig, { label: 'Additional comments', error: 'Comments are required', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'comments', rows: 4, maxlength: 500, required: true });
    return render(FormFieldTwig, { label: 'Additional comments', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'comments', rows: 4, maxlength: 500, disabled: true });
    return render(FormFieldTwig, { label: 'Additional comments', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1', rows: 3 }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'Maximum 500 characters',
      default: template({ name: 'f2', rows: 3, maxlength: 500 }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'This field is required',
      default: template({ name: 'f3', rows: 3 }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', rows: 3, required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', rows: 3, disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
