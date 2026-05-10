import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/icon/icon.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Core/Icon/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    name: 'check',
    label: 'Check',
  }),
};

export const Warning: Story = {
  render: () => render({
    name: 'warning',
    label: 'Warning',
  }),
};

export const Info: Story = {
  render: () => render({
    name: 'info',
    label: 'Info',
  }),
};

export const Error: Story = {
  render: () => render({
    name: 'error',
    label: 'Error',
  }),
};

export const AllIcons: Story = {
  name: 'Common Icons',
  render: () => {
    const icons = ['check', 'warning', 'info', 'error', 'close', 'search', 'edit', 'delete', 'add', 'remove', 'chevron-right', 'chevron-left', 'chevron-down', 'chevron-up'];
    const rendered = icons.map(name => template({ name, label: name })).join(' ');
    return html`${unsafeHTML(rendered)}`;
  },
};
