import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/tag/tag.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Tag/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Healthcare',
    variant: 'blue',
  }),
};

export const Blue: Story = {
  render: () => render({
    label: 'Healthcare',
    variant: 'blue',
  }),
};

export const Green: Story = {
  render: () => render({
    label: 'Active',
    variant: 'green',
  }),
};

export const Yellow: Story = {
  render: () => render({
    label: 'Pending',
    variant: 'yellow',
  }),
};

export const Red: Story = {
  render: () => render({
    label: 'Urgent',
    variant: 'red',
  }),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => {
    const blue = template({ label: 'Blue', variant: 'blue' });
    const green = template({ label: 'Green', variant: 'green' });
    const yellow = template({ label: 'Yellow', variant: 'yellow' });
    const red = template({ label: 'Red', variant: 'red' });
    return html`${unsafeHTML(blue + green + yellow + red)}`;
  },
};
