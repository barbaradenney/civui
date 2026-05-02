import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/combobox/combobox.twig';
// @ts-ignore
import FormFieldTwig from '../../../drupal/civui/components/form-field/form-field.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Combobox/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    name: 'facility',
    placeholder: 'Search...',
  }),
};

export const WithHint: Story = {
  render: () => {
    const input = template({ name: 'facility', placeholder: 'Search...' });
    return render(FormFieldTwig, { label: 'VA facility', hint: 'Start typing to search facilities', required: true, default: input });
  },
};

export const WithError: Story = {
  render: () => {
    const input = template({ name: 'facility', placeholder: 'Search...' });
    return render(FormFieldTwig, { label: 'VA facility', error: 'Select a facility', default: input });
  },
};

export const Required: Story = {
  render: () => {
    const input = template({ name: 'facility', placeholder: 'Search...', required: true });
    return render(FormFieldTwig, { label: 'VA facility', required: true, default: input });
  },
};

export const Disabled: Story = {
  render: () => {
    const input = template({ name: 'facility', placeholder: 'Search...', disabled: true });
    return render(FormFieldTwig, { label: 'VA facility', disabled: true, default: input });
  },
};

export const AllStates: Story = {
  render: () => {
    const defaultField = FormFieldTwig({
      label: 'Default',
      default: template({ name: 'f1', placeholder: 'Search...' }),
    });
    const hintField = FormFieldTwig({
      label: 'With hint',
      hint: 'Start typing to search',
      default: template({ name: 'f2', placeholder: 'Search...' }),
    });
    const errorField = FormFieldTwig({
      label: 'With error',
      error: 'Select a facility',
      default: template({ name: 'f3', placeholder: 'Search...' }),
    });
    const requiredField = FormFieldTwig({
      label: 'Required',
      required: true,
      default: template({ name: 'f4', placeholder: 'Search...', required: true }),
    });
    const disabledField = FormFieldTwig({
      label: 'Disabled',
      disabled: true,
      default: template({ name: 'f5', placeholder: 'Search...', disabled: true }),
    });
    return html`${unsafeHTML(defaultField + hintField + errorField + requiredField + disabledField)}`;
  },
};
