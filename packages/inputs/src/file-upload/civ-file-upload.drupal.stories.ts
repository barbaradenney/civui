import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/file-upload/file-upload.twig';

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
    return render(template, { name: 'documents', accept: '.pdf,.jpg', multiple: true, label: 'Upload documents', hint: 'PDF or JPG files, max 10 MB each', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'documents', accept: '.pdf,.jpg', multiple: true, label: 'Upload documents', error: 'At least one document is required' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'documents', accept: '.pdf,.jpg', multiple: true, required: true, label: 'Upload documents' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'documents', accept: '.pdf,.jpg', multiple: true, disabled: true, label: 'Upload documents' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', accept: '.pdf,.jpg', label: 'Default' });
    const hintField = template({ name: 'f2', accept: '.pdf,.jpg', label: 'With hint', hint: 'PDF or JPG, max 10 MB' });
    const errorField = template({ name: 'f3', accept: '.pdf,.jpg', label: 'With error', error: 'Upload a document' });
    const requiredField = template({ name: 'f4', accept: '.pdf,.jpg', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', accept: '.pdf,.jpg', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
