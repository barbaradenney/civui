import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/summary/summary.twig';
// @ts-ignore
import dataFieldTemplate from '../../../drupal/civui/components/data-field/data-field.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Forms/Form/Summary/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const fields = [
      dataFieldTemplate({ label: 'Full name', value: 'Jane Doe', href: '#/edit' }),
      dataFieldTemplate({ label: 'Email', value: 'jane@agency.gov', href: '#/edit' }),
      dataFieldTemplate({ label: 'Phone', value: '(800) 555-1234', href: '#/edit' }),
    ].join('');
    return render({
      heading: 'Review your information',
      default: fields,
    });
  },
};

export const SingleField: Story = {
  name: 'Single Field',
  render: () => {
    const field = dataFieldTemplate({ label: 'Mailing address', value: '123 Main St, Springfield, VA 22150', href: '#/edit' });
    return render({
      heading: 'Address information',
      default: field,
    });
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => {
    const fields = [
      dataFieldTemplate({ label: 'Full name', value: 'Jane Doe' }),
      dataFieldTemplate({ label: 'Date of birth', value: 'January 15, 1990' }),
      dataFieldTemplate({ label: 'SSN', value: '***-**-6789' }),
    ].join('');
    return render({
      heading: 'Prefilled information',
      default: fields,
    });
  },
};
