import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/button-group/button-group.twig';
// @ts-ignore
import buttonTemplate from '../../../drupal/civui/components/button/button.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Button Group/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const children = [
      buttonTemplate({ label: 'Continue', type: 'submit' }),
      buttonTemplate({ label: 'Save draft', variant: 'secondary' }),
      buttonTemplate({ label: 'Cancel', variant: 'tertiary' }),
    ].join('');
    return render({ default: children });
  },
};

export const TwoButtons: Story = {
  render: () => {
    const children = [
      buttonTemplate({ label: 'Submit', type: 'submit' }),
      buttonTemplate({ label: 'Cancel', variant: 'tertiary' }),
    ].join('');
    return render({ default: children });
  },
};

export const WithDanger: Story = {
  render: () => {
    const children = [
      buttonTemplate({ label: 'Delete', danger: true }),
      buttonTemplate({ label: 'Cancel', variant: 'tertiary' }),
    ].join('');
    return render({ default: children });
  },
};
