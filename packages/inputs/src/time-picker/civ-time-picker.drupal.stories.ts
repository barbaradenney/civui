import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/time-picker/time-picker.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Time Picker/Drupal SDC',
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Appointment time',
  }),
};

export const SelectMode: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Appointment time',
    mode: 'select',
  }),
};

export const TextMode: Story = {
  render: () => render(template, {
    name: 'incident_time',
    label: 'When did the incident occur?',
    mode: 'text',
  }),
};

export const TwentyFourHour: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Appointment time',
    format: '24',
  }),
};

export const WithMinMax: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Business-hours appointment',
    min: '09:00',
    max: '17:00',
    minute_step: 30,
  }),
};

export const WithError: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Appointment time',
    error: 'Pick a valid appointment time',
  }),
};

export const Required: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Appointment time',
    required: true,
  }),
};

export const Disabled: Story = {
  render: () => render(template, {
    name: 'appointment_time',
    label: 'Appointment time',
    disabled: true,
  }),
};

export const WithNowButton: Story = {
  render: () => render(template, {
    name: 'incident_time',
    label: 'When did this happen?',
    mode: 'text',
    show_now_button: true,
  }),
};
