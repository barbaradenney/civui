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
