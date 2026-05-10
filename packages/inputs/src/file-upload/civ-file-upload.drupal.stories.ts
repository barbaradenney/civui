import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/file-upload/file-upload.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/File Upload/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'documents',
    accept: '.pdf,.jpg',
    multiple: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    const input = template({ name: 'documents', accept: '.pdf,.jpg', multiple: true });
    return render(FormFieldTwig, { label: 'Upload documents', hint: 'PDF or JPG files, max 10 MB each', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'documents', accept: '.pdf,.jpg', multiple: true });
    return render(FormFieldTwig, { label: 'Upload documents', error: 'At least one document is required', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'documents', accept: '.pdf,.jpg', multiple: true, required: true });
    return render(FormFieldTwig, { label: 'Upload documents', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'documents', accept: '.pdf,.jpg', multiple: true, disabled: true });
    return render(FormFieldTwig, { label: 'Upload documents', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1', accept: '.pdf,.jpg' }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'PDF or JPG, max 10 MB',
      default: template({ name: 'f2', accept: '.pdf,.jpg' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Upload a document',
      default: template({ name: 'f3', accept: '.pdf,.jpg' }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', accept: '.pdf,.jpg', required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', accept: '.pdf,.jpg', disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
