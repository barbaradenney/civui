import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/date-range-picker/date-range-picker.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Date Range Picker/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    name: 'service_dates',
    min: '2026-01-01',
  }),
};

export const WithHint: Story = {
  render: () => render({
    name: 'service_dates',
    min: '2026-01-01',
    hint: 'Select start and end dates for your service period',
  }),
};

export const WithError: Story = {
  render: () => render({
    name: 'service_dates',
    min: '2026-01-01',
    error: 'End date must be after start date',
  }),
};

export const Required: Story = {
  render: () => render({
    name: 'service_dates',
    min: '2026-01-01',
    required: true,
  }),
};

export const Disabled: Story = {
  render: () => render({
    name: 'service_dates',
    min: '2026-01-01',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultState = template({ name: 'dr1', min: '2026-01-01' });
    const hintState = template({ name: 'dr2', min: '2026-01-01', hint: 'Select date range' });
    const errorState = template({ name: 'dr3', min: '2026-01-01', error: 'Invalid date range' });
    const requiredState = template({ name: 'dr4', min: '2026-01-01', required: true });
    const disabledState = template({ name: 'dr5', min: '2026-01-01', disabled: true });
    return html`${unsafeHTML(defaultState + hintState + errorState + requiredState + disabledState)}`;
  },
};
