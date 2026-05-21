import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/badge/badge.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Feedback/Badge/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Active',
    variant: 'success',
  }),
};

export const Info: Story = {
  render: () => render({
    label: 'In progress',
    variant: 'info',
  }),
};

export const Warning: Story = {
  render: () => render({
    label: 'Pending review',
    variant: 'warning',
  }),
};

export const Error: Story = {
  render: () => render({
    label: 'Denied',
    variant: 'error',
  }),
};

export const Success: Story = {
  render: () => render({
    label: 'Approved',
    variant: 'success',
  }),
};

export const AllVariants: Story = {
  render: () => {
    const info = template({ label: 'In progress', variant: 'info' });
    const warning = template({ label: 'Pending', variant: 'warning' });
    const error = template({ label: 'Denied', variant: 'error' });
    const success = template({ label: 'Approved', variant: 'success' });
    return html`${unsafeHTML(info + warning + error + success)}`;
  },
};
