import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/date-picker/date-picker.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

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
    const input = template({ name: 'appointment', min: '2026-01-01', max: '2026-12-31' });
    return render(FormFieldTwig, { label: 'Appointment date', hint: 'Select a date in 2026', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'appointment', min: '2026-01-01', max: '2026-12-31' });
    return render(FormFieldTwig, { label: 'Appointment date', error: 'Select a valid date', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'appointment', min: '2026-01-01', max: '2026-12-31', required: true });
    return render(FormFieldTwig, { label: 'Appointment date', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'appointment', min: '2026-01-01', max: '2026-12-31', disabled: true });
    return render(FormFieldTwig, { label: 'Appointment date', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1', min: '2026-01-01', max: '2026-12-31' }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'Select a date',
      default: template({ name: 'f2', min: '2026-01-01', max: '2026-12-31' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Select a valid date',
      default: template({ name: 'f3', min: '2026-01-01', max: '2026-12-31' }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', min: '2026-01-01', max: '2026-12-31', required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', min: '2026-01-01', max: '2026-12-31', disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
