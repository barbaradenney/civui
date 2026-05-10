import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/skip-link/skip-link.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Navigation/Skip Link/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Skip to main content',
    href: '#main-content',
  }),
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => render({
    label: 'Skip to form',
    href: '#form-start',
  }),
};
