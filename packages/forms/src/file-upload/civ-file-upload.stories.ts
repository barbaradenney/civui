import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './civ-file-upload.js';
import type { CivFileUpload } from './civ-file-upload.js';

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

export const CompactVariant: Story = {
  render: () => html`
    <civ-file-upload
      label="Resume"
      name="resume"
      variant="compact"
      accept=".pdf,.doc,.docx"
      hint="PDF or Word document, max 5 MB"
    ></civ-file-upload>
  `,
};

export const FullVariant: Story = {
  render: () => html`
    <civ-file-upload
      label="Upload case documents"
      name="case-docs"
      variant="full"
      multiple
      accept=".pdf,.jpg,.png,.tiff"
      max-files="10"
      show-preview
      hint="Drag all related documents here. Accepted: PDF, JPEG, PNG, TIFF. Maximum 10 files."
    ></civ-file-upload>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-mb-2" style="color: var(--civ-color-base-dark)">Compact — inline in dense forms</h3>
        <civ-file-upload label="Attachment" name="attachment" variant="compact" accept=".pdf"></civ-file-upload>
      </div>
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-mb-2" style="color: var(--civ-color-base-dark)">Default — standard forms</h3>
        <civ-file-upload label="Supporting document" name="doc" accept=".pdf,.jpg"></civ-file-upload>
      </div>
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-mb-2" style="color: var(--civ-color-base-dark)">Full — document-heavy workflows</h3>
        <civ-file-upload label="Case file upload" name="case-files" variant="full" multiple show-preview accept=".pdf,.jpg,.png"></civ-file-upload>
      </div>
    </div>
  `,
};

export const WithProgress: Story = {
  render: () => {
    const setupFiles = (el: CivFileUpload) => {
      // Create mock files with different statuses
      const pending = new File(['pending content'], 'application-form.pdf', { type: 'application/pdf' });
      const uploading = new File(['uploading content'], 'id-scan.jpg', { type: 'image/jpeg' });
      const success = new File(['success content'], 'tax-return.pdf', { type: 'application/pdf' });
      const errored = new File(['error content'], 'bank-statement.pdf', { type: 'application/pdf' });

      // Simulate adding files via the internal input
      const dt = new DataTransfer();
      dt.items.add(pending);
      dt.items.add(uploading);
      dt.items.add(success);
      dt.items.add(errored);

      // Wait for element to be ready, then programmatically add and set statuses
      el.updateComplete.then(() => {
        const input = el.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Set statuses after files are added
        requestAnimationFrame(() => {
          el.setFileStatus(1, 'uploading', { progress: 45 });
          el.setFileStatus(2, 'success');
          el.setFileStatus(3, 'error', { error: 'Network timeout. Please check your connection and try again.' });
        });
      });
    };

    return html`
      <civ-file-upload
        label="Document upload with status indicators"
        name="status-demo"
        multiple
        max-files="10"
        hint="This demo shows files in all four states: pending, uploading, success, and error."
        ${/* @ts-expect-error Lit ref workaround */ ''}
        @civ-change="${(e: Event) => {
          // Only run setup once
          const el = (e.target as HTMLElement).closest('civ-file-upload') as CivFileUpload;
          if (el && !el.hasAttribute('data-setup')) {
            el.setAttribute('data-setup', '');
          }
        }}"
        .updateComplete="${Promise.resolve().then(() => {
          setTimeout(() => {
            const el = document.querySelector('civ-file-upload[name="status-demo"]') as CivFileUpload;
            if (el && !el.hasAttribute('data-setup')) {
              el.setAttribute('data-setup', '');
              setupFiles(el);
            }
          }, 100);
        })}"
      ></civ-file-upload>
    `;
  },
};

export const UploadSimulation: Story = {
  render: () => {
    const simulate = (e: Event) => {
      const el = (e.target as HTMLElement).closest('civ-file-upload') as CivFileUpload;
      if (!el) return;
      const detail = (e as CustomEvent).detail;
      if (!detail?.files?.length) return;

      // Simulate upload for each newly added file
      const startIndex = detail.files.length - 1;
      for (let i = 0; i <= startIndex; i++) {
        const fileIndex = i;
        el.setFileStatus(fileIndex, 'uploading', { progress: 0 });
        el.getAbortController(fileIndex);

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // 80% chance of success, 20% chance of error for demo
            if (Math.random() > 0.2) {
              el.setFileStatus(fileIndex, 'success');
            } else {
              el.setFileStatus(fileIndex, 'error', { error: 'Server returned 503 Service Unavailable' });
            }
          } else {
            el.setFileStatus(fileIndex, 'uploading', { progress });
          }
        }, 300);
      }
    };

    return html`
      <civ-file-upload
        label="Upload documents (simulated)"
        name="simulation"
        multiple
        max-files="5"
        hint="Add files to see simulated upload progress. Some uploads will randomly fail to demonstrate error handling and retry."
        @civ-change="${simulate}"
        @civ-upload-retry="${(e: Event) => {
          const el = (e.target as HTMLElement).closest('civ-file-upload') as CivFileUpload;
          const detail = (e as CustomEvent).detail;
          if (!el || detail?.index === undefined) return;
          const fileIndex = detail.index;
          el.setFileStatus(fileIndex, 'uploading', { progress: 0 });
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 10;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              el.setFileStatus(fileIndex, 'success');
            } else {
              el.setFileStatus(fileIndex, 'uploading', { progress });
            }
          }, 250);
        }}"
      ></civ-file-upload>
    `;
  },
};
