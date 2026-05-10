import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/memorable-date/memorable-date.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Inputs/Memorable Date/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    name: 'dob',
    required: true,
  }),
};

export const WithHint: Story = {
  render: () => render({
    name: 'dob',
    hint: 'For example: January 15 1990',
    required: true,
  }),
};

export const WithError: Story = {
  render: () => render({
    name: 'dob',
    error: 'Enter a valid date of birth',
  }),
};

export const Required: Story = {
  render: () => render({
    name: 'dob',
    required: true,
  }),
};

export const Disabled: Story = {
  render: () => render({
    name: 'dob',
    disabled: true,
  }),
};

export const AllStates: Story = {
  render: () => {
    const defaultState = template({ name: 'md1' });
    const hintState = template({ name: 'md2', hint: 'For example: January 15 1990' });
    const errorState = template({ name: 'md3', error: 'Enter a valid date' });
    const requiredState = template({ name: 'md4', required: true });
    const disabledState = template({ name: 'md5', disabled: true });
    return html`${unsafeHTML(defaultState + hintState + errorState + requiredState + disabledState)}`;
  },
};
