import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/divider/divider.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Divider/Drupal SDC',

};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({}),
};

export const InContext: Story = {
  name: 'In Context',
  render: () => {
    const divider = template({});
    return html`<p>Section one content above the divider.</p>${unsafeHTML(divider)}<p>Section two content below the divider.</p>`;
  },
};
