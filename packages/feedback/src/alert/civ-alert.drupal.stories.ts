import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/alert/alert.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Feedback/Alert/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    variant: 'success',
    heading: 'Application submitted',
    label: 'Your application has been received and is being processed.',
  }),
};

export const Info: Story = {
  render: () => render({
    variant: 'info',
    heading: 'Information',
    label: 'Your session will expire in 15 minutes.',
  }),
};

export const Warning: Story = {
  render: () => render({
    variant: 'warning',
    heading: 'Unsaved changes',
    label: 'You have unsaved changes that will be lost if you leave this page.',
  }),
};

export const Error: Story = {
  render: () => render({
    variant: 'error',
    heading: 'Submission failed',
    label: 'There was a problem submitting your application. Please try again.',
  }),
};

export const Success: Story = {
  render: () => render({
    variant: 'success',
    heading: 'Changes saved',
    label: 'Your information has been updated successfully.',
  }),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => {
    const info = template({ variant: 'info', heading: 'Information', label: 'Informational message.' });
    const warning = template({ variant: 'warning', heading: 'Warning', label: 'Warning message.' });
    const error = template({ variant: 'error', heading: 'Error', label: 'Error message.' });
    const success = template({ variant: 'success', heading: 'Success', label: 'Success message.' });
    return html`${unsafeHTML(info + warning + error + success)}`;
  },
};
