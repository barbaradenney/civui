import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civds-file-upload.js';

const meta: Meta = {
  title: 'Forms/File Upload',
  component: 'civds-file-upload',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <civds-file-upload label="Upload a file" name="document"></civds-file-upload>
  `,
};

export const WithHint: Story = {
  render: () => html`
    <civds-file-upload
      label="Upload document"
      name="document"
      hint="PDF or image files only"
      accept=".pdf,.jpg,.png"
    ></civds-file-upload>
  `,
};

export const WithMaxSize: Story = {
  render: () => html`
    <civds-file-upload
      label="Profile photo"
      name="photo"
      accept="image/*"
      max-size="2097152"
      hint="Maximum file size: 2 MB"
    ></civds-file-upload>
  `,
};

export const MultipleFiles: Story = {
  render: () => html`
    <civds-file-upload
      label="Supporting documents"
      name="documents"
      multiple
      accept=".pdf,.doc,.docx"
      hint="You can upload multiple files"
    ></civds-file-upload>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civds-file-upload
      label="Required document"
      name="document"
      error="Please upload a document"
      required
    ></civds-file-upload>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civds-file-upload
      label="Upload locked"
      name="locked"
      disabled
    ></civds-file-upload>
  `,
};
