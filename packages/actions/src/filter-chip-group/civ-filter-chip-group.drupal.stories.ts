import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import filterChipTemplate from '../../../drupal/civui/components/filter-chip/filter-chip.twig';
// @ts-ignore
import template from '../../../drupal/civui/components/filter-chip-group/filter-chip-group.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Actions/Filter Chip Group/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const chips = [
      filterChipTemplate({ label: 'Healthcare', name: 'filter', value: 'healthcare' }),
      filterChipTemplate({ label: 'Education', name: 'filter', value: 'education' }),
      filterChipTemplate({ label: 'Housing', name: 'filter', value: 'housing' }),
    ].join('');
    return render({ default: chips });
  },
};

export const WithSelections: Story = {
  render: () => {
    const chips = [
      filterChipTemplate({ label: 'Healthcare', name: 'filter', value: 'healthcare', checked: true }),
      filterChipTemplate({ label: 'Education', name: 'filter', value: 'education' }),
      filterChipTemplate({ label: 'Housing', name: 'filter', value: 'housing', checked: true }),
    ].join('');
    return render({ default: chips });
  },
};

export const Disabled: Story = {
  render: () => {
    const chips = [
      filterChipTemplate({ label: 'Healthcare', name: 'filter', value: 'healthcare', disabled: true }),
      filterChipTemplate({ label: 'Education', name: 'filter', value: 'education', disabled: true }),
      filterChipTemplate({ label: 'Housing', name: 'filter', value: 'housing', disabled: true }),
    ].join('');
    return render({ default: chips });
  },
};
