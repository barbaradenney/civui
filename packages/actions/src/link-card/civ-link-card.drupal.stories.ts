import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/link-card/link-card.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Navigation/Link Card/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    href: '#/benefits/healthcare',
    heading: 'VA Health Care',
    description: 'Apply for VA health care benefits and manage your health online.',
  }),
};

export const WithoutDescription: Story = {
  render: () => render({
    href: '#/benefits/education',
    heading: 'Education Benefits',
  }),
};

export const AllCards: Story = {
  name: 'Multiple Cards',
  render: () => {
    const card1 = template({ href: '#/healthcare', heading: 'VA Health Care', description: 'Apply for health care benefits.' });
    const card2 = template({ href: '#/education', heading: 'Education Benefits', description: 'GI Bill and education assistance.' });
    const card3 = template({ href: '#/housing', heading: 'Housing Assistance', description: 'Home loan and housing programs.' });
    return html`${unsafeHTML(card1 + card2 + card3)}`;
  },
};
