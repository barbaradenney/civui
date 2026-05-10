import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// @ts-ignore
import template from '../../../drupal/civui/components/image-preview/image-preview.twig';

const render = (props: Record<string, any>) => html`${unsafeHTML(template(props))}`;

const meta: Meta = {
  title: 'Layout/Image Preview/Drupal SDC',

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

export const WithoutFileInfo: Story = {
  name: 'Without File Info',
  render: () => render({
    src: 'https://picsum.photos/seed/civui2/400/300',
    alt: 'Uploaded photo',
  }),
};

export const MultipleImages: Story = {
  name: 'Multiple Images',
  render: () => {
    const img1 = template({ src: 'https://picsum.photos/seed/doc1/400/300', alt: 'Document 1', filename: 'dd214-page1.jpg', file_size: '1.2 MB' });
    const img2 = template({ src: 'https://picsum.photos/seed/doc2/400/300', alt: 'Document 2', filename: 'dd214-page2.jpg', file_size: '0.9 MB' });
    return html`${unsafeHTML(img1 + img2)}`;
  },
};
