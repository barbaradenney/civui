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
    <civ-form-field
      label="${args.label}"
      hint="${args.hint}"
      error="${args.error}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
    >
      <civ-file-upload
        name="${args.name}"
        accept="${args.accept}"
        ?multiple="${args.multiple}"
        max-size="${args.maxSize}"
        max-files="${args.maxFiles}"
        ?required="${args.required}"
        ?disabled="${args.disabled}"
      ></civ-file-upload>
    </civ-form-field>
  `,
};

// ── Individual States ─────────────────────────────────────────

export const WithHint: Story = {
  render: () => html`
    <civ-form-field label="Upload supporting document" hint="PDF or image files only, maximum 10 MB">
      <civ-file-upload name="document" accept=".pdf,.jpg,.png"></civ-file-upload>
    </civ-form-field>
  `,
};

export const WithError: Story = {
  render: () => html`
    <civ-form-field label="Upload required document" error="Upload at least one document to continue" required>
      <civ-file-upload name="document" required></civ-file-upload>
    </civ-form-field>
  `,
};

export const Required: Story = {
  render: () => html`
    <civ-form-field label="Upload identification" required>
      <civ-file-upload name="identification" accept=".pdf,.jpg,.png" required></civ-file-upload>
    </civ-form-field>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <civ-form-field label="Upload locked" disabled>
      <civ-file-upload name="locked" disabled></civ-file-upload>
    </civ-form-field>
  `,
};

// ── All States ────────────────────────────────────────────────

export const AllStates: Story = {
  name: 'All States',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <civ-form-field label="Normal">
        <civ-file-upload name="normal"></civ-file-upload>
      </civ-form-field>
      <civ-form-field label="With hint" hint="PDF files only, max 5 MB">
        <civ-file-upload name="hint" accept=".pdf"></civ-file-upload>
      </civ-form-field>
      <civ-form-field label="With error" error="Upload a document" required>
        <civ-file-upload name="error" required></civ-file-upload>
      </civ-form-field>
      <civ-form-field label="Required" required>
        <civ-file-upload name="required" required></civ-file-upload>
      </civ-form-field>
      <civ-form-field label="Disabled" disabled>
        <civ-file-upload name="disabled" disabled></civ-file-upload>
      </civ-form-field>
    </div>
  `,
};

// ── Density Scale ─────────────────────────────────────────────

export const DensityScale: Story = {
  name: 'Density Scale',
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-6">
      <div data-civ-scale="dense">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Dense</p>
        <civ-form-field label="Upload document" hint="PDF only">
          <civ-file-upload name="dense-doc" accept=".pdf"></civ-file-upload>
        </civ-form-field>
      </div>
      <div>
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Default</p>
        <civ-form-field label="Upload document" hint="PDF only">
          <civ-file-upload name="default-doc" accept=".pdf"></civ-file-upload>
        </civ-form-field>
      </div>
      <div data-civ-scale="spacious">
        <p class="civ-m-0 civ-mb-2 civ-font-semibold">Spacious</p>
        <civ-form-field label="Upload document" hint="PDF only">
          <civ-file-upload name="spacious-doc" accept=".pdf"></civ-file-upload>
        </civ-form-field>
      </div>
    </div>
  `,
};

// ── Variants ──────────────────────────────────────────────────

export const MultipleFiles: Story = {
  render: () => html`
    <civ-form-field label="Supporting documents" hint="You can upload up to 5 files. Accepted formats: PDF, Word.">
      <civ-file-upload
        name="documents"
        multiple
        max-files="5"
        accept=".pdf,.doc,.docx"
      ></civ-file-upload>
    </civ-form-field>
  `,
};

export const ImagePreview: Story = {
  render: () => html`
    <civ-form-field label="Upload identification photo" hint="Upload a clear photo of your government-issued ID. JPEG or PNG only.">
      <civ-file-upload
        name="id-photo"
        accept="image/jpeg,image/png"
        show-preview
      ></civ-file-upload>
    </civ-form-field>
  `,
};

export const CompactVariant: Story = {
  render: () => html`
    <civ-form-field label="Resume" hint="PDF or Word document, max 5 MB">
      <civ-file-upload
        name="resume"
        variant="compact"
        accept=".pdf,.doc,.docx"
      ></civ-file-upload>
    </civ-form-field>
  `,
};

export const FullVariant: Story = {
  render: () => html`
    <civ-form-field label="Upload case documents" hint="Drag all related documents here. Accepted: PDF, JPEG, PNG, TIFF. Maximum 10 files.">
      <civ-file-upload
        name="case-docs"
        variant="full"
        multiple
        accept=".pdf,.jpg,.png,.tiff"
        max-files="10"
        show-preview
      ></civ-file-upload>
    </civ-form-field>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div class="civ-flex civ-flex-col civ-gap-8">
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-m-0 civ-mb-2">Compact -- inline in dense forms</h3>
        <civ-form-field label="Attachment">
          <civ-file-upload name="attachment" variant="compact" accept=".pdf"></civ-file-upload>
        </civ-form-field>
      </div>
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-m-0 civ-mb-2">Default -- standard forms</h3>
        <civ-form-field label="Supporting document">
          <civ-file-upload name="doc" accept=".pdf,.jpg"></civ-file-upload>
        </civ-form-field>
      </div>
      <div>
        <h3 class="civ-text-sm civ-font-bold civ-m-0 civ-mb-2">Full -- document-heavy workflows</h3>
        <civ-form-field label="Case file upload">
          <civ-file-upload name="case-files" variant="full" multiple show-preview accept=".pdf,.jpg,.png"></civ-file-upload>
        </civ-form-field>
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
      <civ-form-field label="Upload documents (simulated)" hint="Add files to see simulated upload progress. Some uploads will randomly fail to demonstrate error handling and retry.">
        <civ-file-upload
          name="simulation"
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
      </civ-form-field>
    `;
  },
};

// ── Usage Example ─────────────────────────────────────────────

export const GovernmentDocumentSubmission: Story = {
  name: 'Usage: Document Submission',
  render: () => html`
    <h3 class="civ-m-0 civ-mb-4 civ-text-xl">Upload required documents</h3>
    <p class="civ-m-0 civ-mb-4" style="color: #565c65;">Upload clear copies of the following documents to support your application.</p>
    <civ-form-field label="Government-issued identification" hint="Driver's license, passport, or state ID. JPEG, PNG, or PDF." required>
      <civ-file-upload
        name="id-doc"
        accept=".pdf,.jpg,.png"
        required
      ></civ-file-upload>
    </civ-form-field>
    <civ-form-field label="Proof of residence" hint="Utility bill, bank statement, or lease agreement from the last 90 days.">
      <civ-file-upload
        name="proof-of-residence"
        accept=".pdf,.jpg,.png"
      ></civ-file-upload>
    </civ-form-field>
    <civ-form-field label="Additional supporting documents" hint="Upload any other documents that support your application. Up to 5 files.">
      <civ-file-upload
        name="supporting"
        multiple
        max-files="5"
        accept=".pdf,.jpg,.png,.doc,.docx"
      ></civ-file-upload>
    </civ-form-field>
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
    <civ-form-field label="Driver's license photo" hint="Take a photo of your license, or upload one from your device">
      <civ-file-upload
        name="license"
        accept="image/*"
        capture="environment"
      ></civ-file-upload>
    </civ-form-field>
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
    <civ-form-field label="Identity verification photo" hint="Take a photo of your face for identity verification">
      <civ-file-upload
        name="selfie"
        accept="image/*"
        capture="user"
      ></civ-file-upload>
    </civ-form-field>
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
    <civ-form-field label="Supporting documents" hint="Try selecting the same file twice — the second add is rejected.">
      <civ-file-upload name="docs" multiple></civ-file-upload>
    </civ-form-field>
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
    <civ-form-field label="Supporting documents">
      <civ-file-upload
        name="docs"
        multiple
        .initialFiles="${[
          { id: 'srv-001', name: 'tax-return-2025.pdf', size: 1240000, type: 'application/pdf', url: 'https://example.test/files/srv-001' },
          { id: 'srv-002', name: 'w2.pdf', size: 380000, type: 'application/pdf', url: 'https://example.test/files/srv-002' },
        ]}"
      ></civ-file-upload>
    </civ-form-field>
  `,
};
