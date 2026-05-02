import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form/form.twig';
// @ts-ignore
import formFieldTemplate from '../../../drupal/civui/components/form-field/form-field.twig';
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
    const nameField = formFieldTemplate({
      label: 'Full name',
      required: true,
      default: textInputTemplate({ name: 'fullName', required: true, autocomplete: 'name' }),
    });
    const emailField = formFieldTemplate({
      label: 'Email address',
      hint: 'Work email preferred',
      required: true,
      default: textInputTemplate({ name: 'email', type: 'email', required: true, autocomplete: 'email' }),
    });
    const submit = buttonTemplate({ label: 'Submit', type: 'submit' });
    return render({ default: nameField + emailField + submit });
  },
};

export const WithErrors: Story = {
  name: 'With Errors',
  render: () => {
    const nameField = formFieldTemplate({
      label: 'Full name',
      required: true,
      error: 'Enter your full name',
      default: textInputTemplate({ name: 'fullName', required: true }),
    });
    const emailField = formFieldTemplate({
      label: 'Email address',
      required: true,
      error: 'Enter a valid email address',
      default: textInputTemplate({ name: 'email', type: 'email', required: true }),
    });
    const submit = buttonTemplate({ label: 'Submit', type: 'submit' });
    return render({ default: nameField + emailField + submit });
  },
};

export const Disabled: Story = {
  render: () => {
    const nameField = formFieldTemplate({
      label: 'Full name',
      disabled: true,
      default: textInputTemplate({ name: 'fullName', disabled: true }),
    });
    const emailField = formFieldTemplate({
      label: 'Email address',
      disabled: true,
      default: textInputTemplate({ name: 'email', type: 'email', disabled: true }),
    });
    const submit = buttonTemplate({ label: 'Submit', type: 'submit', disabled: true });
    return render({ default: nameField + emailField + submit });
  },
};
