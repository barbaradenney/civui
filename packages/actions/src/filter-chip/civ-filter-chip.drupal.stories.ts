import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/filter-chip/filter-chip.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Actions/Filter Chip/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Healthcare',
    name: 'filter',
    value: 'healthcare',
  }),
};

export const Selected: Story = {
  render: () => render({
    label: 'Healthcare',
    name: 'filter',
    value: 'healthcare',
    checked: true,
  }),
};

export const Disabled: Story = {
  render: () => render({
    label: 'Healthcare',
    name: 'filter',
    value: 'healthcare',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultChip = template({ label: 'Default', name: 'f1', value: 'a' });
    const selected = template({ label: 'Selected', name: 'f2', value: 'b', checked: true });
    const disabled = template({ label: 'Disabled', name: 'f3', value: 'c', disabled: true });
    return html`${unsafeHTML(defaultChip + selected + disabled)}`;
  },
};
