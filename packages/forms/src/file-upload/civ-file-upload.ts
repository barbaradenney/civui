import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, interpolate } from '@civui/core';

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
 * CivUI File Upload
 *
 * File input with drag-and-drop, file list preview, size validation,
 * and remove capability. Uses ElementInternals for form participation.
 *
 * @element civ-file-upload
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
 * @fires civ-change - When files are added or removed
 */
@customElement('civ-file-upload')
export class CivFileUpload extends CivFormElement {
  @property({ type: String }) accept = '';
  @property({ type: Boolean }) multiple = false;
  @property({ type: Number, attribute: 'max-size' }) maxSize = 0;

  @property({ type: String, attribute: 'drag-text' }) dragText = 'Drag files here or';
  @property({ type: String, attribute: 'browse-text' }) browseText = 'choose from folder';
  @property({ type: String, attribute: 'accepted-label' }) acceptedLabel = 'Accepted: ';
  @property({ type: String, attribute: 'max-size-label' }) maxSizeLabel = 'Max size: ';
  @property({ type: String, attribute: 'remove-text' }) removeText = 'Remove';
  @property({ type: String, attribute: 'remove-aria-label' }) removeAriaLabel = 'Remove {name}';
  @property({ type: String, attribute: 'files-list-label' }) filesListLabel = 'Selected files';
  @property({ type: String, attribute: 'file-added-message' }) fileAddedMessage = '{count} file added. {total} file selected.';
  @property({ type: String, attribute: 'file-removed-message' }) fileRemovedMessage = 'File removed. {total} file selected.';
  @property({ type: String, attribute: 'file-size-error' }) fileSizeError = '{name} exceeds maximum size of {size}';

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
      'civ-block',
      'civ-w-full',
      'civ-border-2',
      'civ-border-dashed',
      'civ-rounded',
      'civ-p-6',
      'civ-text-center',
      'civ-transition-colors',
      'focus-visible:civ-focus-ring',
      this._dragging ? 'civ-border-primary civ-bg-primary-lightest' : '',
      this.error ? 'civ-border-error' : 'civ-border-base-light',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed' : 'civ-cursor-pointer',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="civ-mb-4">
        ${this.label
          ? html`
              <label
                class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base"
                for="${this._inputId}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
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
          data-dragging="${this._dragging || nothing}"
        >
          <span class="civ-block civ-text-base-dark civ-text-base">
            ${this.dragText}
            <span class="civ-text-primary civ-underline">${this.browseText}</span>
          </span>
          ${this.accept
            ? html`<span class="civ-block civ-text-sm civ-text-base civ-mt-1">${this.acceptedLabel}${this.accept}</span>`
            : nothing}
          ${this.maxSize > 0
            ? html`<span class="civ-block civ-text-sm civ-text-base civ-mt-0.5">${this.maxSizeLabel}${formatFileSize(this.maxSize)}</span>`
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
          class="civ-hidden"
          @change="${this._onFileSelect}"
          aria-hidden="true"
          tabindex="-1"
        />

        ${this._files.length > 0
          ? html`
              <ul class="civ-list-none civ-p-0 civ-mt-2 civ-space-y-1" aria-label="${this.filesListLabel}">
                ${this._files.map(
                  (file, index) => html`
                    <li class="civ-flex civ-items-center civ-justify-between civ-p-2 civ-bg-base-lightest civ-rounded civ-text-sm">
                      <span>
                        <span class="civ-font-semibold">${file.name}</span>
                        <span class="civ-text-base civ-ml-2">(${formatFileSize(file.size)})</span>
                      </span>
                      <button
                        type="button"
                        class="civ-text-error civ-text-sm civ-underline civ-bg-transparent civ-border-0 civ-cursor-pointer civ-py-1 civ-px-2 focus-visible:civ-focus-ring"
                        @click="${() => this._removeFile(index)}"
                        aria-label="${interpolate(this.removeAriaLabel, { name: file.name })}"
                        ?disabled="${this.disabled}"
                      >
                        ${this.removeText}
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
        this.error = interpolate(this.fileSizeError, { name: file.name, size: formatFileSize(this.maxSize) });
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
    this.announce(interpolate(this.fileAddedMessage, { count: validated.length, total: this._files.length }));
  }

  private _removeFile(index: number): void {
    this._files = this._files.filter((_, i) => i !== index);
    if (this._files.length === 0) this.error = '';
    this._updateFormData();
    this._dispatchChange();
    this.sendAnalytics('remove', { fileCount: this._files.length });
    this.announce(interpolate(this.fileRemovedMessage, { total: this._files.length }));
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
      new CustomEvent('civ-change', {
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
    this.dispatchEvent(new CustomEvent('civ-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-file-upload': CivFileUpload;
  }
}
