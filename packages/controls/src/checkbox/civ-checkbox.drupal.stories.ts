import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import checkboxTemplate from '../../../drupal/civui/components/checkbox/checkbox.twig';
// @ts-ignore
import checkboxGroupTemplate from '../../../drupal/civui/components/checkbox-group/checkbox-group.twig';
// @ts-ignore
import FieldsetTwig from '../../../drupal/civui/components/fieldset/fieldset.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Controls/Checkbox/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(checkboxTemplate, {
    label: 'I agree to the terms and conditions',
    name: 'agree',
    required: true,
  }),
};

export const CheckboxGroup: Story = {
  render: () => {
    const children = [
      checkboxTemplate({ label: 'Healthcare', name: 'benefits', value: 'healthcare' }),
      checkboxTemplate({ label: 'Education', name: 'benefits', value: 'education' }),
      checkboxTemplate({ label: 'Housing', name: 'benefits', value: 'housing' }),
    ].join('');
    return render(checkboxGroupTemplate, { default: children });
  },
};

export const WithHint: Story = {
  render: () => render(checkboxTemplate, {
    label: 'I agree to the terms and conditions',
    name: 'agree',
    hint: 'You must agree before continuing',
  }),
};

export const WithError: Story = {
  render: () => {
    const children = [
      checkboxTemplate({ label: 'Healthcare', name: 'benefits', value: 'healthcare' }),
      checkboxTemplate({ label: 'Education', name: 'benefits', value: 'education' }),
    ].join('');
    const group = checkboxGroupTemplate({ default: children });
    return render(FieldsetTwig, { legend: 'Select benefits', error: 'Select at least one benefit', default: group });
  },
};

export const Disabled: Story = {
  render: () => render(checkboxTemplate, {
    label: 'I agree to the terms and conditions',
    name: 'agree',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultCb = checkboxTemplate({ label: 'Default', name: 'cb1' });
    const hintCb = checkboxTemplate({ label: 'With hint', name: 'cb2', hint: 'Hint text' });
    const disabledCb = checkboxTemplate({ label: 'Disabled', name: 'cb3', disabled: true });
    const requiredCb = checkboxTemplate({ label: 'Required', name: 'cb4', required: true });
    return html`${unsafeHTML(defaultCb + hintCb + disabledCb + requiredCb)}`;
  },
};
