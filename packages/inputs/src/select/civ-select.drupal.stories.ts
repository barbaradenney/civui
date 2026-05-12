import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/select/select.twig';

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
    return render(template, { name: 'state', preset: 'us-state', required: true, label: 'State', hint: 'Select your state of residence' });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'state', preset: 'us-state', label: 'State', error: 'Select a state' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'state', preset: 'us-state', required: true, label: 'State' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'state', preset: 'us-state', disabled: true, label: 'State' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', preset: 'us-state', label: 'Default' });
    const hintField = template({ name: 'f2', preset: 'us-state', label: 'With hint', hint: 'Select your state' });
    const errorField = template({ name: 'f3', preset: 'us-state', label: 'With error', error: 'Select a state' });
    const requiredField = template({ name: 'f4', preset: 'us-state', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', preset: 'us-state', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
