import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/input-group/input-group.twig';
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
    const city = textInputTemplate({ name: 'city', required: true, label: 'City' });
    const state = selectTemplate({ name: 'state', preset: 'us-state', required: true, label: 'State' });
    return render({ default: city + state });
  },
};

export const ThreeColumns: Story = {
  render: () => {
    const city = textInputTemplate({ name: 'city', required: true, label: 'City' });
    const state = selectTemplate({ name: 'state', preset: 'us-state', required: true, label: 'State' });
    const zip = textInputTemplate({ name: 'zip', required: true, label: 'ZIP code' });
    return render({ default: city + state + zip });
  },
};
