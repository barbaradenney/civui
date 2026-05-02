import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/button/button.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Actions/Button/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Submit application',
    type: 'submit',
  }),
};

export const Secondary: Story = {
  render: () => render({
    label: 'Save draft',
    variant: 'secondary',
  }),
};

export const Tertiary: Story = {
  render: () => render({
    label: 'Cancel',
    variant: 'tertiary',
  }),
};

export const Danger: Story = {
  render: () => render({
    label: 'Delete application',
    danger: true,
  }),
};

export const DangerSecondary: Story = {
  name: 'Danger Secondary',
  render: () => render({
    label: 'Remove item',
    variant: 'secondary',
    danger: true,
  }),
};

export const Disabled: Story = {
  render: () => render({
    label: 'Submit application',
    type: 'submit',
    disabled: true,
  }),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => {
    const primary = template({ label: 'Primary', type: 'submit' });
    const secondary = template({ label: 'Secondary', variant: 'secondary' });
    const tertiary = template({ label: 'Tertiary', variant: 'tertiary' });
    const danger = template({ label: 'Danger', danger: true });
    const dangerSecondary = template({ label: 'Danger Secondary', variant: 'secondary', danger: true });
    const disabled = template({ label: 'Disabled', disabled: true });
    return html`${unsafeHTML(primary + secondary + tertiary + danger + dangerSecondary + disabled)}`;
  },
};
