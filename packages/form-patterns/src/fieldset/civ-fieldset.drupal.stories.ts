import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/fieldset/fieldset.twig';
// @ts-ignore
import formFieldTemplate from '../../../drupal/civui/components/form-field/form-field.twig';
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
    const firstName = formFieldTemplate({
      label: 'First name',
      required: true,
      default: textInputTemplate({ name: 'first_name', required: true }),
    });
    const lastName = formFieldTemplate({
      label: 'Last name',
      required: true,
      default: textInputTemplate({ name: 'last_name', required: true }),
    });
    return render({
      legend: 'Personal information',
      default: firstName + lastName,
    });
  },
};
