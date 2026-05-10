import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/toggle/toggle.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Toggle/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Enable notifications',
    name: 'notifications',
  }),
};

export const WithHint: Story = {
  render: () => render({
    label: 'Enable notifications',
    name: 'notifications',
    hint: 'You will receive email alerts for status changes',
  }),
};

export const Disabled: Story = {
  render: () => render({
    label: 'Enable notifications',
    name: 'notifications',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultToggle = template({ label: 'Default', name: 't1' });
    const hintToggle = template({ label: 'With hint', name: 't2', hint: 'Hint text here' });
    const disabledToggle = template({ label: 'Disabled', name: 't3', disabled: true });
    return html`${unsafeHTML(defaultToggle + hintToggle + disabledToggle)}`;
  },
};
