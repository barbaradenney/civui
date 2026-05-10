import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/conditional/conditional.twig';
// @ts-ignore
import formFieldTemplate from '../../../drupal/civui/components/form-field/form-field.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Conditional/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const conditionalContent = formFieldTemplate({
      label: 'VA file number',
      default: textInputTemplate({ name: 'va_file', required: true }),
    });
    return render({
      when: 'veteran',
      equals: 'yes',
      default: conditionalContent,
    });
  },
};

export const MultipleFields: Story = {
  name: 'Multiple Conditional Fields',
  render: () => {
    const field1 = formFieldTemplate({
      label: 'Service branch',
      required: true,
      default: textInputTemplate({ name: 'branch', required: true }),
    });
    const field2 = formFieldTemplate({
      label: 'Discharge date',
      required: true,
      default: textInputTemplate({ name: 'discharge_date', required: true }),
    });
    return render({
      when: 'veteran',
      equals: 'yes',
      default: field1 + field2,
    });
  },
};
