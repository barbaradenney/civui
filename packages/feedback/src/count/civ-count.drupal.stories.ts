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

export const Info: Story = {
  render: () => render({
    count: 3,
    variant: 'info',
  }),
};

export const Warning: Story = {
  render: () => render({
    count: 2,
    variant: 'warning',
  }),
};

export const Error: Story = {
  render: () => render({
    count: 1,
    variant: 'error',
  }),
};

export const Success: Story = {
  render: () => render({
    count: 10,
    variant: 'success',
  }),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => {
    const info = template({ count: 3, variant: 'info' });
    const warning = template({ count: 2, variant: 'warning' });
    const error = template({ count: 1, variant: 'error' });
    const success = template({ count: 10, variant: 'success' });
    return html`${unsafeHTML(info + warning + error + success)}`;
  },
};
