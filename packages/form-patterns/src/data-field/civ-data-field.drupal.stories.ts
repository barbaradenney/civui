import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/data-field/data-field.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Data Field/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    label: 'Mailing address',
    value: '123 Main St, Springfield, VA 22150',
    href: '#/edit-address',
  }),
};

export const WithoutEditLink: Story = {
  name: 'Without Edit Link',
  render: () => render({
    label: 'Date of birth',
    value: 'January 15, 1990',
  }),
};

export const MultipleFields: Story = {
  name: 'Multiple Fields',
  render: () => {
    const field1 = template({ label: 'Full name', value: 'Jane Doe', href: '#/edit' });
    const field2 = template({ label: 'Email', value: 'jane@agency.gov', href: '#/edit' });
    const field3 = template({ label: 'Phone', value: '(800) 555-1234', href: '#/edit' });
    return html`${unsafeHTML(field1 + field2 + field3)}`;
  },
};
