import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/fieldset/fieldset.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Fieldset/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const firstName = textInputTemplate({ name: 'first_name', required: true, label: 'First name' });
    const lastName = textInputTemplate({ name: 'last_name', required: true, label: 'Last name' });
    return render({
      legend: 'Personal information',
      default: firstName + lastName,
    });
  },
};

export const WithHint: Story = {
  render: () => {
    const firstName = textInputTemplate({ name: 'first_name_h', required: true, label: 'First name' });
    const lastName = textInputTemplate({ name: 'last_name_h', required: true, label: 'Last name' });
    return render({
      legend: 'Personal information',
      hint: 'Enter your name as it appears on your government ID',
      default: firstName + lastName,
    });
  },
};

export const WithError: Story = {
  render: () => {
    const firstName = textInputTemplate({ name: 'first_name_e', required: true, label: 'First name', error: 'Enter your first name' });
    const lastName = textInputTemplate({ name: 'last_name_e', required: true, label: 'Last name' });
    return render({
      legend: 'Personal information',
      default: firstName + lastName,
    });
  },
};

export const Disabled: Story = {
  render: () => {
    const firstName = textInputTemplate({ name: 'first_name_d', disabled: true, label: 'First name' });
    const lastName = textInputTemplate({ name: 'last_name_d', disabled: true, label: 'Last name' });
    return render({
      legend: 'Personal information',
      default: firstName + lastName,
    });
  },
};
