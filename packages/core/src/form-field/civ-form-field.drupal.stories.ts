import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form-field/form-field.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';
// @ts-ignore
import formGroupTemplate from '../../../drupal/civui/components/form-group/form-group.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Core/Form Field/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Form Field',
  render: () => {
    const input = textInputTemplate({ name: 'email', type: 'email', required: true, autocomplete: 'email' });
    return render(template, {
      label: 'Email address',
      hint: 'Work email preferred',
      required: true,
      default: input,
    });
  },
};

export const FormGroup: Story = {
  name: 'Form Group',
  render: () => {
    const firstName = template({
      label: 'First name',
      required: true,
      default: textInputTemplate({ name: 'first_name', required: true }),
    });
    const lastName = template({
      label: 'Last name',
      required: true,
      default: textInputTemplate({ name: 'last_name', required: true }),
    });
    return render(formGroupTemplate, { default: firstName + lastName });
  },
};
