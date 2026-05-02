import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/image-preview/image-preview.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Image Preview/Drupal SDC',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => render({
    src: 'https://picsum.photos/seed/civui/400/300',
    alt: 'Sample uploaded document',
    filename: 'dd214-scan.jpg',
    file_size: '1.2 MB',
  }),
};
