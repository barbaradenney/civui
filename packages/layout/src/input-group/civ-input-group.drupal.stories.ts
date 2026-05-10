import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/input-group/input-group.twig';
// @ts-ignore
import formFieldTemplate from '../../../drupal/civui/components/form-field/form-field.twig';
// @ts-ignore
import textInputTemplate from '../../../drupal/civui/components/text-input/text-input.twig';
// @ts-ignore
import selectTemplate from '../../../drupal/civui/components/select/select.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Input Group/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const city = formFieldTemplate({
      label: 'City',
      required: true,
      default: textInputTemplate({ name: 'city', required: true }),
    });
    const state = formFieldTemplate({
      label: 'State',
      required: true,
      default: selectTemplate({ name: 'state', preset: 'us-state', required: true }),
    });
    return render({ default: city + state });
  },
};

export const ThreeColumns: Story = {
  name: 'Three Columns',
  render: () => {
    const city = formFieldTemplate({
      label: 'City',
      required: true,
      default: textInputTemplate({ name: 'city', required: true }),
    });
    const state = formFieldTemplate({
      label: 'State',
      required: true,
      default: selectTemplate({ name: 'state', preset: 'us-state', required: true }),
    });
    const zip = formFieldTemplate({
      label: 'ZIP code',
      required: true,
      default: textInputTemplate({ name: 'zip', required: true }),
    });
    return render({ default: city + state + zip });
  },
};
