import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-file-upload.js';

const meta: Meta = {
  title: 'Forms/File Upload',
  component: 'civ-file-upload',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    accept: { control: 'text' },
    multiple: { control: 'boolean' },
    maxSize: { control: 'number' },
    maxFiles: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Upload a file',
    name: 'document',
    hint: '',
    error: '',
    accept: '',
    multiple: false,
    maxSize: 0,
    maxFiles: 0,
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <civ-file-upload
      label="${args.label}"
      name="${args.name}"
      hint="${args.hint}"
      error="${args.error}"
      accept="${args.accept}"
      ?multiple="${args.multiple}"
      max-size="${args.maxSize}"
      max-files="${args.maxFiles}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    ></civ-file-upload>
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

export const ImagePreview: Story = {
  render: () => html`
    <civ-file-upload
      label="Upload identification photo"
      name="id-photo"
      accept="image/jpeg,image/png"
      show-preview
      hint="Upload a clear photo of your government-issued ID. JPEG or PNG only."
    ></civ-file-upload>
  `,
};

export const MaxFiles: Story = {
  render: () => html`
    <civ-file-upload
      label="Supporting documents"
      name="supporting-docs"
      multiple
      max-files="3"
      accept=".pdf,.jpg,.png"
      hint="Upload up to 3 files. Accepted formats: PDF, JPEG, PNG."
    ></civ-file-upload>
  `,
};
