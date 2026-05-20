import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '@civui/core';
import './civ-file-upload.js';
import type { CivFileUpload } from './civ-file-upload.js';

const meta: Meta = {
  title: 'Forms/Inputs/File Upload',
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

// ── Default ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Upload a document',
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
    <civ-file-upload label="${args.label}" hint="${args.hint}" error="${args.error}" name="${args.name}"
        accept="${args.accept}"
        ?multiple="${args.multiple}"
        max-size="${args.maxSize}"
        max-files="${args.maxFiles}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"></civ-file-upload>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-file-upload label="Upload supporting document" hint="PDF or image files only, maximum 10 MB" name="document" accept=".pdf,.jpg,.png"></civ-file-upload>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-file-upload label="Upload required document" error="Upload at least one document to continue" name="document" required></civ-file-upload>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-file-upload label="Upload identification" name="identification" accept=".pdf,.jpg,.png" required></civ-file-upload>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-file-upload label="Upload locked" name="locked" disabled></civ-file-upload>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-file-upload label="Normal" name="normal"></civ-file-upload>
      <civ-file-upload label="With hint" hint="PDF files only, max 5 MB" name="hint" accept=".pdf"></civ-file-upload>
      <civ-file-upload label="With error" error="Upload a document" name="error" required></civ-file-upload>
      <civ-file-upload label="Required" name="required" required></civ-file-upload>
      <civ-file-upload label="Disabled" name="disabled" disabled></civ-file-upload>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-file-upload label="Upload document" hint="PDF only" name="dense-doc" accept=".pdf"></civ-file-upload>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-file-upload label="Upload document" hint="PDF only" name="default-doc" accept=".pdf"></civ-file-upload>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-file-upload label="Upload document" hint="PDF only" name="spacious-doc" accept=".pdf"></civ-file-upload>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const MultipleFiles: Story = {
  render: () => html`
    <civ-file-upload label="Supporting documents" hint="You can upload up to 5 files. Accepted formats: PDF, Word." name="documents"
        multiple
        max-files="5"
        accept=".pdf,.doc,.docx"></civ-file-upload>
  `,
};

export const ImagePreview: Story = {
  render: () => html`
    <civ-file-upload label="Upload identification photo" hint="Upload a clear photo of your government-issued ID. JPEG or PNG only." name="id-photo"
        accept="image/jpeg,image/png"
        show-preview></civ-file-upload>
  `,
};

export const CompactVariant: Story = {
  render: () => html`
    <civ-file-upload label="Resume" hint="PDF or Word document, max 5 MB" name="resume"
        variant="compact"
        accept=".pdf,.doc,.docx"></civ-file-upload>
  `,
};

export const FullVariant: Story = {
  render: () => html`
    <civ-file-upload label="Upload case documents" hint="Drag all related documents here. Accepted: PDF, JPEG, PNG, TIFF. Maximum 10 files." name="case-docs"
        variant="full"
        multiple
        accept=".pdf,.jpg,.png,.tiff"
        max-files="10"
        show-preview></civ-file-upload>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-m-0 civ-mb-2">Compact -- inline in dense forms</h3>
        <civ-file-upload label="Attachment" name="attachment" variant="compact" accept=".pdf"></civ-file-upload>
      </div>
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-m-0 civ-mb-2">Default -- standard forms</h3>
        <civ-file-upload label="Supporting document" name="doc" accept=".pdf,.jpg"></civ-file-upload>
      </div>
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-m-0 civ-mb-2">Full -- document-heavy workflows</h3>
        <civ-file-upload label="Case file upload" name="case-files" variant="full" multiple show-preview accept=".pdf,.jpg,.png"></civ-file-upload>
      </div>
    </div>
  `,
};

// ── Upload Simulation ─────────────────────────────────────────

export const UploadSimulation: Story = {
  render: () => {
    const simulate = (e: Event) => {
      const el = (e.target as HTMLElement).closest('civ-file-upload') as CivFileUpload;
      if (!el) return;
      const detail = (e as CustomEvent).detail;
      if (!detail?.files?.length) return;

      const totalFiles = el.files?.length ?? detail.files.length;
      const newCount = detail.files.length;
      const startIndex = totalFiles - newCount;
      for (let i = startIndex; i < totalFiles; i++) {
        const fileIndex = i;
        el.setFileStatus(fileIndex, 'uploading', { progress: 0 });
        el.getAbortController(fileIndex);

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
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
      <civ-file-upload label="Upload documents (simulated)" hint="Add files to see simulated upload progress. Some uploads will randomly fail to demonstrate error handling and retry." name="simulation"
          multiple
          max-files="5"
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

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentDocumentSubmission: Story = {
  name: 'Usage: Document Submission',
  render: () => html`
    <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Upload required documents</h3>
    <p class="civ-m-0 civ-mb-4" style="color: #565c65;">Upload clear copies of the following documents to support your application.</p>
    <civ-file-upload label="Government-issued identification" hint="Driver's license, passport, or state ID. JPEG, PNG, or PDF." name="id-doc"
        accept=".pdf,.jpg,.png"
        required></civ-file-upload>
    <civ-file-upload label="Proof of residence" hint="Utility bill, bank statement, or lease agreement from the last 90 days." name="proof-of-residence"
        accept=".pdf,.jpg,.png"></civ-file-upload>
    <civ-file-upload label="Additional supporting documents" hint="Upload any other documents that support your application. Up to 5 files." name="supporting"
        multiple
        max-files="5"
        accept=".pdf,.jpg,.png,.doc,.docx"></civ-file-upload>
  `,
};

// ── Camera capture (mobile) ───────────────────────────────────

export const CaptureEnvironment: Story = {
  name: 'Capture: back camera (document scan)',
  parameters: {
    docs: {
      description: {
        story:
          'On mobile, `capture="environment"` opens the back camera so the user can photograph a document directly. Pair with `accept="image/*"`. Desktop browsers ignore the attribute and behave as a normal file picker.',
      },
    },
  },
  render: () => html`
    <civ-file-upload label="Driver's license photo" hint="Take a photo of your license, or upload one from your device" name="license"
        accept="image/*"
        capture="environment"></civ-file-upload>
  `,
};

export const CaptureUser: Story = {
  name: 'Capture: front camera (selfie)',
  parameters: {
    docs: {
      description: {
        story:
          '`capture="user"` opens the front-facing camera — used for liveness checks or "selfie with ID" flows.',
      },
    },
  },
  render: () => html`
    <civ-file-upload label="Identity verification photo" hint="Take a photo of your face for identity verification" name="selfie"
        accept="image/*"
        capture="user"></civ-file-upload>
  `,
};

// ── Duplicate detection ───────────────────────────────────────

export const DuplicateDetection: Story = {
  name: 'Duplicate detection',
  parameters: {
    docs: {
      description: {
        story:
          'Adding a file already in the list (matched by name + size + lastModified) is rejected with a "{name} is already in the list" error. Removing a file then re-adding it works as expected.',
      },
    },
  },
  render: () => html`
    <civ-file-upload label="Supporting documents" hint="Try selecting the same file twice — the second add is rejected." name="docs" multiple></civ-file-upload>
  `,
};

// ── Draft restore (initialFiles) ───────────────────────────────

export const InitialFiles: Story = {
  name: 'Draft restore (initial files)',
  parameters: {
    docs: {
      description: {
        story:
          'Hydrate the file list from a previous session (saved draft). Set the `initialFiles` JS property with `{ id, name, size, type?, url? }` entries. Files marked as initial render with the success state — no upload required. The `id` is echoed back via the `civ-file-removed` event when the user removes the file, so consumers can issue server-side deletes.',
      },
    },
  },
  render: () => html`
    <civ-file-upload label="Supporting documents" name="docs"
        multiple
        .initialFiles="${[
          { id: 'srv-001', name: 'tax-return-2025.pdf', size: 1240000, type: 'application/pdf', url: 'https://example.test/files/srv-001' },
          { id: 'srv-002', name: 'w2.pdf', size: 380000, type: 'application/pdf', url: 'https://example.test/files/srv-002' },
        ]}"></civ-file-upload>
  `,
};
