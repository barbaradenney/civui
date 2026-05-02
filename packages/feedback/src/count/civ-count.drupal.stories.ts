import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/count/count.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Feedback/Count/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    count: 5,
    variant: 'info',
  }),
};
