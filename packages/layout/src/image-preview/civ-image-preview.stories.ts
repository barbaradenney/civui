import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './civ-image-preview.js';

const meta: Meta = {
  title: 'Layout/Image Preview',
  component: 'civ-image-preview',
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    filename: { control: 'text' },
    'file-size': { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
  },
};

export default meta;
type Story = StoryObj;

const SAMPLE_IMAGE = 'https://picsum.photos/seed/civui/600/400';

export const Default: Story = {
  render: () => html`
    <civ-image-preview
      src="${SAMPLE_IMAGE}"
      alt="Sample uploaded document"
      filename="id-front.jpg"
      file-size="2.4 MB"
    ></civ-image-preview>
  `,
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => html`
    <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: start;">
      <div>
        <p style="font-weight: bold; margin-bottom: 8px;">sm (120px)</p>
        <civ-image-preview
          src="${SAMPLE_IMAGE}"
          alt="Small preview"
          filename="photo.jpg"
          size="sm"
        ></civ-image-preview>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 8px;">md (240px, default)</p>
        <civ-image-preview
          src="${SAMPLE_IMAGE}"
          alt="Medium preview"
          filename="photo.jpg"
          file-size="2.4 MB"
          size="md"
        ></civ-image-preview>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 8px;">lg (360px)</p>
        <civ-image-preview
          src="${SAMPLE_IMAGE}"
          alt="Large preview"
          filename="photo.jpg"
          file-size="2.4 MB"
          size="lg"
        ></civ-image-preview>
      </div>
    </div>
  `,
};

export const FullWidth: Story = {
  name: 'Full width',
  render: () => html`
    <div style="max-width: 500px;">
      <civ-image-preview
        src="${SAMPLE_IMAGE}"
        alt="Full width preview"
        filename="damage-photo.jpg"
        file-size="4.8 MB"
        size="full"
      ></civ-image-preview>
    </div>
  `,
};

export const NoCaption: Story = {
  name: 'No caption',
  render: () => html`
    <civ-image-preview
      src="${SAMPLE_IMAGE}"
      alt="Photo without caption"
    ></civ-image-preview>
  `,
};

export const IDDocumentUpload: Story = {
  name: 'ID document upload',
  render: () => html`
    <div style="max-width: 400px;">
      <h4 style="font-weight: bold; margin-bottom: 8px;">Front of ID</h4>
      <civ-image-preview
        src="${SAMPLE_IMAGE}"
        alt="Front of driver's license"
        filename="id-front.jpg"
        file-size="1.8 MB"
        size="lg"
      ></civ-image-preview>
    </div>
  `,
};

export const ReviewPageImages: Story = {
  name: 'Review page (multiple images)',
  render: () => html`
    <div style="max-width: 600px;">
      <h3 style="font-weight: bold; margin-bottom: 12px;">Uploaded photos</h3>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <civ-image-preview
          src="${SAMPLE_IMAGE}"
          alt="Front of ID"
          filename="id-front.jpg"
          file-size="1.8 MB"
          size="sm"
        ></civ-image-preview>
        <civ-image-preview
          src="https://picsum.photos/seed/civui2/600/400"
          alt="Back of ID"
          filename="id-back.jpg"
          file-size="1.6 MB"
          size="sm"
        ></civ-image-preview>
        <civ-image-preview
          src="https://picsum.photos/seed/civui3/600/400"
          alt="Proof of residence"
          filename="utility-bill.jpg"
          file-size="2.1 MB"
          size="sm"
        ></civ-image-preview>
      </div>
    </div>
  `,
};
