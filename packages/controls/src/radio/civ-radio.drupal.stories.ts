import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import radioTemplate from '../../../drupal/civui/components/radio/radio.twig';
// @ts-ignore
import radioGroupTemplate from '../../../drupal/civui/components/radio-group/radio-group.twig';
// @ts-ignore
import FieldsetTwig from '../../../drupal/civui/components/fieldset/fieldset.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Controls/Radio/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(radioTemplate, {
    label: 'Option A',
    name: 'choice',
    value: 'a',
  }),
};

export const RadioGroup: Story = {
  name: 'Radio Group',
  render: () => {
    const children = [
      radioTemplate({ label: 'Email', name: 'contact', value: 'email' }),
      radioTemplate({ label: 'Phone', name: 'contact', value: 'phone' }),
      radioTemplate({ label: 'Mail', name: 'contact', value: 'mail' }),
    ].join('');
    return render(radioGroupTemplate, { default: children });
  },
};

export const WithHint: Story = {
  render: () => {
    const children = [
      radioTemplate({ label: 'Email', name: 'contact_h', value: 'email' }),
      radioTemplate({ label: 'Phone', name: 'contact_h', value: 'phone' }),
    ].join('');
    const group = radioGroupTemplate({ default: children });
    return render(FieldsetTwig, { legend: 'Preferred contact method', hint: 'We will use this to reach you about your application', required: true, default: group });
  },
};

export const WithError: Story = {
  render: () => {
    const children = [
      radioTemplate({ label: 'Email', name: 'contact_e', value: 'email' }),
      radioTemplate({ label: 'Phone', name: 'contact_e', value: 'phone' }),
    ].join('');
    const group = radioGroupTemplate({ default: children });
    return render(FieldsetTwig, { legend: 'Preferred contact method', error: 'Select a contact method', default: group });
  },
};

export const Disabled: Story = {
  render: () => {
    const children = [
      radioTemplate({ label: 'Email', name: 'contact_d', value: 'email', disabled: true }),
      radioTemplate({ label: 'Phone', name: 'contact_d', value: 'phone', disabled: true }),
    ].join('');
    const group = radioGroupTemplate({ default: children });
    return render(FieldsetTwig, { legend: 'Preferred contact method', disabled: true, default: group });
  },
};

export const AllStates: Story = {
  render: () => {
    const makeGroup = (name: string, legend: string, extra: Record<string, any> = {}) => {
      const children = [
        radioTemplate({ label: 'Email', name, value: 'email' }),
        radioTemplate({ label: 'Phone', name, value: 'phone' }),
      ].join('');
      const group = radioGroupTemplate({ default: children });
      return FieldsetTwig({ legend, default: group, ...extra });
    };
    const defaultGroup = makeGroup('r1', 'Default');
    const hintGroup = makeGroup('r2', 'With hint', { hint: 'Hint text here' });
    const errorGroup = makeGroup('r3', 'With error', { error: 'Select an option' });
    const requiredGroup = makeGroup('r4', 'Required', { required: true });
    const disabledGroup = makeGroup('r5', 'Disabled', { disabled: true });
    return html`${unsafeHTML(defaultGroup + hintGroup + errorGroup + requiredGroup + disabledGroup)}`;
  },
};
