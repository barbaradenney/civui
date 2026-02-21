import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-file-upload.js';

const meta: Meta = {
  title: 'Forms/File Upload',
  component: 'civ-file-upload',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civ-file-upload label="Upload a file" name="document"></civ-file-upload>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civ-file-upload
      label="Upload document"
      name="document"
      hint="PDF or image files only"
      accept=".pdf,.jpg,.png"
    ></civ-file-upload>
  `,
};

export const WithMaxSize: Story = {
  render: () => html`
    <civ-file-upload
      label="Profile photo"
      name="photo"
      accept="image/*"
      max-size="2097152"
      hint="Maximum file size: 2 MB"
    ></civ-file-upload>
  `,
};

export const MultipleFiles: Story = {
  render: () => html`
    <civ-file-upload
      label="Supporting documents"
      name="documents"
      multiple
      accept=".pdf,.doc,.docx"
      hint="You can upload multiple files"
    ></civ-file-upload>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-file-upload
      label="Required document"
      name="document"
      error="Please upload a document"
      required
    ></civ-file-upload>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-file-upload
      label="Upload locked"
      name="locked"
      disabled
    ></civ-file-upload>
  `,
};
