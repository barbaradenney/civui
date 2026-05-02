import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/form-fieldset/form-fieldset.twig';
// @ts-ignore
import radioTemplate from '../../../drupal/civui/components/radio/radio.twig';
// @ts-ignore
import radioGroupTemplate from '../../../drupal/civui/components/radio-group/radio-group.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Core/Form Fieldset/Drupal SDC',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const children = [
      radioTemplate({ label: 'Email', name: 'contact_method', value: 'email' }),
      radioTemplate({ label: 'Phone', name: 'contact_method', value: 'phone' }),
      radioTemplate({ label: 'Mail', name: 'contact_method', value: 'mail' }),
    ].join('');
    const radioGroup = radioGroupTemplate({ default: children });
    return render({
      legend: 'Preferred contact method',
      required: true,
      default: radioGroup,
    });
  },
};
