import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form/form.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';
// @ts-ignore
import buttonTemplate from '../../../drupal/civui/components/button/button.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Form/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const nameField = textInputTemplate({ name: 'fullName', required: true, autocomplete: 'name', label: 'Full name' });
    const emailField = textInputTemplate({ name: 'email', type: 'email', required: true, autocomplete: 'email', label: 'Email address', hint: 'Work email preferred' });
    const submit = buttonTemplate({ label: 'Submit', type: 'submit' });
    return render({ default: nameField + emailField + submit });
  },
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => {
    const nameField = textInputTemplate({ name: 'fullName', required: true, label: 'Full name', error: 'Enter your full name' });
    const emailField = textInputTemplate({ name: 'email', type: 'email', required: true, label: 'Email address', error: 'Enter a valid email address' });
    const submit = buttonTemplate({ label: 'Submit', type: 'submit' });
    return render({ default: nameField + emailField + submit });
  },
};

export const Disabled: Story = {
  render: () => {
    const nameField = textInputTemplate({ name: 'fullName', disabled: true, label: 'Full name' });
    const emailField = textInputTemplate({ name: 'email', type: 'email', disabled: true, label: 'Email address' });
    const submit = buttonTemplate({ label: 'Submit', type: 'submit', disabled: true });
    return render({ default: nameField + emailField + submit });
  },
};
