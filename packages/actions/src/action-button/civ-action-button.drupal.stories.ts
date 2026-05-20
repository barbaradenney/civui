import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/action-button/action-button.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Actions/Action Button/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Save draft',
    variant: 'tertiary',
  }),
};

export const Primary: Story = {
  render: () => render({
    label: 'Add dependent',
    variant: 'primary',
  }),
};

export const Secondary: Story = {
  render: () => render({
    label: 'Edit information',
    variant: 'secondary',
  }),
};

export const Danger: Story = {
  render: () => render({
    label: 'Remove entry',
    variant: 'secondary',
    danger: true,
  }),
};

export const Disabled: Story = {
  render: () => render({
    label: 'Save draft',
    variant: 'tertiary',
    disabled: true,
  }),
};

export const AllVariants: Story = {
  render: () => {
    const primary = template({ label: 'Primary', variant: 'primary' });
    const secondary = template({ label: 'Secondary', variant: 'secondary' });
    const tertiary = template({ label: 'Tertiary', variant: 'tertiary' });
    const danger = template({ label: 'Danger', variant: 'secondary', danger: true });
    const disabled = template({ label: 'Disabled', variant: 'tertiary', disabled: true });
    return html`${unsafeHTML(primary + secondary + tertiary + danger + disabled)}`;
  },
};
