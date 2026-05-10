import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/modal/modal.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Overlays/Modal/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    heading: 'Confirm submission',
    heading_level: 3,
    open: true,
    default: '<p>Are you sure you want to submit this application? This action cannot be undone.</p>',
  }),
};

export const WithLongContent: Story = {
  name: 'Long Content',
  render: () => render({
    heading: 'Terms and conditions',
    heading_level: 2,
    open: true,
    default: '<p>By submitting this application, you certify that all information provided is accurate.</p><p>You understand that providing false information may result in penalties.</p><p>You agree to notify the agency of any changes to your circumstances.</p>',
  }),
};

export const Danger: Story = {
  render: () => render({
    heading: 'Delete application',
    heading_level: 3,
    open: true,
    danger: true,
    default: '<p>This will permanently delete your application and all associated data. This action cannot be undone.</p>',
  }),
};
