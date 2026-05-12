import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/textarea/textarea.twig';

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
    return render(template, { name: 'comments', rows: 4, maxlength: 500, label: 'Additional comments', hint: 'Provide any relevant details', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'comments', rows: 4, maxlength: 500, label: 'Additional comments', error: 'Comments are required' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'comments', rows: 4, maxlength: 500, required: true, label: 'Additional comments' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'comments', rows: 4, maxlength: 500, disabled: true, label: 'Additional comments' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', rows: 3, label: 'Default' });
    const hintField = template({ name: 'f2', rows: 3, maxlength: 500, label: 'With hint', hint: 'Maximum 500 characters' });
    const errorField = template({ name: 'f3', rows: 3, label: 'With error', error: 'This field is required' });
    const requiredField = template({ name: 'f4', rows: 3, required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', rows: 3, disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
