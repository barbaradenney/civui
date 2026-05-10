import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form-fieldset/form-fieldset.twig';
// @ts-ignore
import radioTemplate from '../../../drupal/civui/components/radio/radio.twig';
// @ts-ignore
import radioGroupTemplate from '../../../drupal/civui/components/radio-group/radio-group.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Core/Form Fieldset/Drupal SDC',

};
export default meta;
type Story = StoryObj;

const makeRadioGroup = (name: string) => {
  const children = [
    radioTemplate({ label: 'Email', name, value: 'email' }),
    radioTemplate({ label: 'Phone', name, value: 'phone' }),
    radioTemplate({ label: 'Mail', name, value: 'mail' }),
  ].join('');
  return radioGroupTemplate({ default: children });
};

export const Default: Story = {
  render: () => render({
    legend: 'Preferred contact method',
    required: true,
    default: makeRadioGroup('contact_method'),
  }),
};

export const WithHint: Story = {
  render: () => render({
    legend: 'Preferred contact method',
    hint: 'We will use this to reach you about your application',
    required: true,
    default: makeRadioGroup('contact_hint'),
  }),
};

export const WithError: Story = {
  render: () => render({
    legend: 'Preferred contact method',
    error: 'Select a contact method',
    default: makeRadioGroup('contact_err'),
  }),
};

export const Required: Story = {
  render: () => render({
    legend: 'Preferred contact method',
    required: true,
    default: makeRadioGroup('contact_req'),
  }),
};

export const Disabled: Story = {
  render: () => render({
    legend: 'Preferred contact method',
    disabled: true,
    default: makeRadioGroup('contact_dis'),
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultState = template({ legend: 'Default', default: makeRadioGroup('fs1') });
    const hintState = template({ legend: 'With hint', hint: 'Hint text', default: makeRadioGroup('fs2') });
    const errorState = template({ legend: 'With error', error: 'Select an option', default: makeRadioGroup('fs3') });
    const requiredState = template({ legend: 'Required', required: true, default: makeRadioGroup('fs4') });
    const disabledState = template({ legend: 'Disabled', disabled: true, default: makeRadioGroup('fs5') });
    return html`${unsafeHTML(defaultState + hintState + errorState + requiredState + disabledState)}`;
  },
};
