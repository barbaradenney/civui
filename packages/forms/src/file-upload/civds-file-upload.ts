import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * CivDS File Upload
 *
 * File input with drag-and-drop, file list preview, size validation,
 * and remove capability. Uses ElementInternals for form participation.
 *
 * @element civds-file-upload
 *
 * @prop {string} label - Label text
 * @prop {string} name - Form field name
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {string} accept - Accepted file types (e.g. ".pdf,.jpg,image/*")
 * @prop {boolean} multiple - Allow multiple files
 * @prop {number} maxSize - Maximum file size in bytes (per file)
 * @prop {boolean} required - Whether a file is required
 * @prop {boolean} disabled - Whether the upload is disabled
 *
 * @fires civds-change - When files are added or removed
 */
@customElement('civds-file-upload')
export class CivdsFileUpload extends CivdsFormElement {
  @property({ type: String }) accept = '';
  @property({ type: Boolean }) multiple = false;
  @property({ type: Number, attribute: 'max-size' }) maxSize = 0;

  @state() private _files: UploadedFile[] = [];
  @state() private _dragging = false;

  private _boundDragOver = this._onDragOver.bind(this);
  private _boundDragLeave = this._onDragLeave.bind(this);
  private _boundDrop = this._onDrop.bind(this);

  get files(): File[] {
    return this._files.map((f) => f.file);
  }

  override render() {
    const dropzoneClasses = [
      'civds-block',
      'civds-w-full',
      'civds-border-2',
      'civds-border-dashed',
      'civds-rounded',
      'civds-p-6',
      'civds-text-center',
      'civds-transition-colors',
      this._dragging ? 'civds-border-primary civds-bg-primary-lightest' : '',
      this.error ? 'civds-border-error' : 'civds-border-base-light',
      this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed' : 'civds-cursor-pointer',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="civds-mb-4">
        ${this.label
          ? html`
              <label
                class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base"
                for="${this._inputId}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}

        <div
          class="${dropzoneClasses}"
          @dragover="${this._boundDragOver}"
          @dragleave="${this._boundDragLeave}"
          @drop="${this._boundDrop}"
          @click="${this._onDropzoneClick}"
          role="button"
          tabindex="${this.disabled ? '-1' : '0'}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          @keydown="${this._onDropzoneKeydown}"
        >
          <span class="civds-block civds-text-base-dark civds-text-base">
            Drag files here or
            <span class="civds-text-primary civds-underline">choose from folder</span>
          </span>
          ${this.accept
            ? html`<span class="civds-block civds-text-sm civds-text-base civds-mt-1">Accepted: ${this.accept}</span>`
            : nothing}
          ${this.maxSize > 0
            ? html`<span class="civds-block civds-text-sm civds-text-base civds-mt-0.5">Max size: ${formatFileSize(this.maxSize)}</span>`
            : nothing}
        </div>

        <input
          id="${this._inputId}"
          type="file"
          name="${this.name}"
          accept="${this.accept || nothing}"
          ?multiple="${this.multiple}"
          ?disabled="${this.disabled}"
          ?required="${this.required && this._files.length === 0}"
          class="civds-hidden"
          @change="${this._onFileSelect}"
          aria-hidden="true"
          tabindex="-1"
        />

        ${this._files.length > 0
          ? html`
              <ul class="civds-list-none civds-p-0 civds-mt-2 civds-space-y-1" aria-label="Selected files">
                ${this._files.map(
                  (file, index) => html`
                    <li class="civds-flex civds-items-center civds-justify-between civds-p-2 civds-bg-base-lightest civds-rounded civds-text-sm">
                      <span>
                        <span class="civds-font-semibold">${file.name}</span>
                        <span class="civds-text-base civds-ml-2">(${formatFileSize(file.size)})</span>
                      </span>
                      <button
                        type="button"
                        class="civds-text-error civds-text-sm civds-underline civds-bg-transparent civds-border-0 civds-cursor-pointer civds-p-0"
                        @click="${() => this._removeFile(index)}"
                        aria-label="Remove ${file.name}"
                        ?disabled="${this.disabled}"
                      >
                        Remove
                      </button>
                    </li>
                  `,
                )}
              </ul>
            `
          : nothing}
      </div>
    `;
  }

  private _onDropzoneClick(): void {
    if (this.disabled) return;
    const input = this.querySelector(`#${this._inputId}`) as HTMLInputElement;
    input?.click();
  }

  private _onDropzoneKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._onDropzoneClick();
    }
  }

  private _onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled) this._dragging = true;
  }

  private _onDragLeave(): void {
    this._dragging = false;
  }

  private _onDrop(e: DragEvent): void {
    e.preventDefault();
    this._dragging = false;
    if (this.disabled || !e.dataTransfer) return;
    this._addFiles(Array.from(e.dataTransfer.files));
  }

  private _onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    this._addFiles(Array.from(input.files));
    // Reset so the same file can be selected again
    input.value = '';
  }

  private _addFiles(newFiles: File[]): void {
    const validated: UploadedFile[] = [];

    for (const file of newFiles) {
      if (this.maxSize > 0 && file.size > this.maxSize) {
        this.error = `${file.name} exceeds maximum size of ${formatFileSize(this.maxSize)}`;
        continue;
      }
      validated.push({ name: file.name, size: file.size, type: file.type, file });
    }

    if (this.multiple) {
      this._files = [...this._files, ...validated];
    } else {
      this._files = validated.slice(0, 1);
    }

    this._updateFormData();
    this._dispatchChange();
    this.sendAnalytics('upload', { fileCount: this._files.length });
  }

  private _removeFile(index: number): void {
    this._files = this._files.filter((_, i) => i !== index);
    if (this._files.length === 0) this.error = '';
    this._updateFormData();
    this._dispatchChange();
    this.sendAnalytics('remove', { fileCount: this._files.length });
    this.announce(`File removed. ${this._files.length} file${this._files.length !== 1 ? 's' : ''} selected.`);
  }

  private _updateFormData(): void {
    if (this._files.length === 0) {
      this.value = '';
      this.updateFormValue(null);
    } else {
      this.value = this._files.map((f) => f.name).join(', ');
      const formData = new FormData();
      for (const f of this._files) {
        formData.append(this.name || 'file', f.file);
      }
      this.updateFormValue(formData);
    }
  }

  private _dispatchChange(): void {
    this.dispatchEvent(
      new CustomEvent('civds-change', {
        detail: { files: this._files.map((f) => f.file) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override formResetCallback(): void {
    this._files = [];
    this.value = '';
    this.error = '';
    this.updateFormValue(null);
    this.dispatchEvent(new CustomEvent('civds-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-file-upload': CivdsFileUpload;
  }
}
