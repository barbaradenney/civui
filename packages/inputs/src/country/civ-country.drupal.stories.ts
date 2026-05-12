import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/country/country.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Country/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'country',
    us_first: true,
  }),
};

export const WithHint: Story = {
  render: () => {
    return render(template, { name: 'country', us_first: true, label: 'Country', hint: 'Select your country of residence', required: true });
  },
};

export const WithError: Story = {
  render: () => {
    return render(template, { name: 'country', us_first: true, label: 'Country', error: 'Select a country' });
  },
};

export const Required: Story = {
  render: () => {
    return render(template, { name: 'country', us_first: true, required: true, label: 'Country' });
  },
};

export const Disabled: Story = {
  render: () => {
    return render(template, { name: 'country', us_first: true, disabled: true, label: 'Country' });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = template({ name: 'f1', us_first: true, label: 'Default' });
    const hintField = template({ name: 'f2', us_first: true, label: 'With hint', hint: 'Select your country' });
    const errorField = template({ name: 'f3', us_first: true, label: 'With error', error: 'Select a country' });
    const requiredField = template({ name: 'f4', us_first: true, required: true, label: 'Required' });
    const disabledField = template({ name: 'f5', us_first: true, disabled: true, label: 'Disabled' });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
