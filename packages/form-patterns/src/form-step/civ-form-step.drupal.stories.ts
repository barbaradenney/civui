import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form-step/form-step.twig';
// @ts-ignore
import formFieldTemplate from '../../../drupal/civui/components/form-field/form-field.twig';
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
    const nameField = formFieldTemplate({
      label: 'Full name',
      required: true,
      default: textInputTemplate({ name: 'fullName', required: true }),
    });
    return render({ default: nameField });
  },
};

export const MultipleFields: Story = {
  name: 'Multiple Fields',
  render: () => {
    const firstName = formFieldTemplate({
      label: 'First name',
      required: true,
      default: textInputTemplate({ name: 'firstName', required: true }),
    });
    const lastName = formFieldTemplate({
      label: 'Last name',
      required: true,
      default: textInputTemplate({ name: 'lastName', required: true }),
    });
    const email = formFieldTemplate({
      label: 'Email address',
      hint: 'Work email preferred',
      required: true,
      default: textInputTemplate({ name: 'email', type: 'email', required: true }),
    });
    return render({ default: firstName + lastName + email });
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
    return render({ default: nameField });
  },
};
