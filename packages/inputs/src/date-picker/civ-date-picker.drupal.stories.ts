import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/date-picker/date-picker.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Date Picker/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'appointment',
    min: '2026-01-01',
    max: '2026-12-31',
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'appointment', min: '2026-01-01', max: '2026-12-31', label: 'Appointment date', hint: 'Select a date in 2026', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'appointment', min: '2026-01-01', max: '2026-12-31', label: 'Appointment date', error: 'Select a valid date' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'appointment', min: '2026-01-01', max: '2026-12-31', required: true, label: 'Appointment date' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'appointment', min: '2026-01-01', max: '2026-12-31', disabled: true, label: 'Appointment date' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', min: '2026-01-01', max: '2026-12-31', label: 'Default' });
    const hintField = template({ name: 'f2', min: '2026-01-01', max: '2026-12-31', label: 'With hint', hint: 'Select a date' });
    const errorField = template({ name: 'f3', min: '2026-01-01', max: '2026-12-31', label: 'With error', error: 'Select a valid date' });
    const requiredField = template({ name: 'f4', min: '2026-01-01', max: '2026-12-31', required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', min: '2026-01-01', max: '2026-12-31', disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
