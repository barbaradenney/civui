import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/segmented-control/segmented-control.twig';
// @ts-ignore
import FieldsetTwig from '../../../drupal/civui/components/fieldset/fieldset.twig';

const render = (twigFn: (ctx: Record<string, any>) => string, props: Record<string, any>) =>
  html`${unsafeHTML(twigFn(props))}`;

const meta: Meta = {
  title: 'Forms/Controls/Segmented Control/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render(template, {
    legend: 'View',
    name: 'view',
  }),
};

export const WithHint: Story = {
  render: () => {
    const control = template({ legend: 'View', name: 'view_h' });
    return render(FieldsetTwig, { legend: 'Display mode', hint: 'Choose how to view your records', default: control });
  },
};

export const WithError: Story = {
  render: () => {
    const control = template({ legend: 'View', name: 'view_e' });
    return render(FieldsetTwig, { legend: 'Display mode', error: 'Select a view option', default: control });
  },
};

export const Disabled: Story = {
  render: () => render(template, {
    legend: 'View',
    name: 'view_d',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultState = template({ legend: 'Default', name: 'sc1' });
    const disabledState = template({ legend: 'Disabled', name: 'sc2', disabled: true });
    return html`${unsafeHTML(defaultState + disabledState)}`;
  },
};
