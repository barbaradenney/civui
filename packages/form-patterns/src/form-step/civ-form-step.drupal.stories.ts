import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form-step/form-step.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Form Step/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const nameField = textInputTemplate({ name: 'fullName', required: true, label: 'Full name' });
    return render({ default: nameField });
  },
};

export const MultipleFields: Story = {
  name: 'Multiple Fields',
  render: () => {
    const firstName = textInputTemplate({ name: 'firstName', required: true, label: 'First name' });
    const lastName = textInputTemplate({ name: 'lastName', required: true, label: 'Last name' });
    const email = textInputTemplate({ name: 'email', type: 'email', required: true, label: 'Email address', hint: 'Work email preferred' });
    return render({ default: firstName + lastName + email });
  },
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => {
    const nameField = textInputTemplate({ name: 'fullName', required: true, label: 'Full name', error: 'Enter your full name' });
    return render({ default: nameField });
  },
};
