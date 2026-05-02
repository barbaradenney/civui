import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/card/card.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Card/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    heading: 'Benefits summary',
    default: '<p>You are currently enrolled in VA health care and education benefits.</p>',
  }),
};

export const WithoutHeading: Story = {
  name: 'Without Heading',
  render: () => render({
    default: '<p>A simple card with content only.</p>',
  }),
};

export const AllCards: Story = {
  name: 'Multiple Cards',
  render: () => {
    const card1 = template({ heading: 'Healthcare', default: '<p>VA health care enrollment status.</p>' });
    const card2 = template({ heading: 'Education', default: '<p>GI Bill remaining entitlement.</p>' });
    const card3 = template({ heading: 'Disability', default: '<p>Disability compensation details.</p>' });
    return html`${unsafeHTML(card1 + card2 + card3)}`;
  },
};
