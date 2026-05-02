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
  tags: ['autodocs'],
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
