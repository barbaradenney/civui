import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/link/link.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Navigation/Link/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'View all benefits',
    href: '#/benefits',
    variant: 'secondary',
  }),
};

export const Primary: Story = {
  render: () => render({
    label: 'Apply now',
    href: '#/apply',
    variant: 'primary',
  }),
};

export const Secondary: Story = {
  render: () => render({
    label: 'View all benefits',
    href: '#/benefits',
    variant: 'secondary',
  }),
};

export const Tertiary: Story = {
  render: () => render({
    label: 'Learn more',
    href: '#/learn-more',
    variant: 'tertiary',
  }),
};

export const Back: Story = {
  render: () => render({
    label: 'Back to previous page',
    href: '#/back',
    variant: 'back',
  }),
};

export const NewTab: Story = {
  render: () => render({
    label: 'Visit VA.gov',
    href: 'https://www.va.gov',
    variant: 'secondary',
    new_tab: true,
  }),
};

export const AllVariants: Story = {
  render: () => {
    const primary = template({ label: 'Primary', href: '#', variant: 'primary' });
    const secondary = template({ label: 'Secondary', href: '#', variant: 'secondary' });
    const tertiary = template({ label: 'Tertiary', href: '#', variant: 'tertiary' });
    const back = template({ label: 'Back', href: '#', variant: 'back' });
    const newTab = template({ label: 'New tab', href: '#', variant: 'secondary', new_tab: true });
    return html`${unsafeHTML(primary + secondary + tertiary + back + newTab)}`;
  },
};
