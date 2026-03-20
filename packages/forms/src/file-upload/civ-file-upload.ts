import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, interpolate, renderLabel, renderHint, renderError, t } from '@civui/core';

const previewStyles = html`
  <style>
    .civ-file-preview {
      width: 2em;
      height: 2em;
      object-fit: cover;
      border-radius: var(--civ-border-radius-DEFAULT);
      border: 1px solid var(--civ-color-base-lighter);
    }
  </style>
`;

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
 * @prop {number} maxFiles - Maximum number of files allowed (0 = unlimited)
 * @prop {boolean} required - Whether a file is required
 * @prop {boolean} disabled - Whether the upload is disabled
 * @prop {boolean} showPreview - Show image thumbnail previews in the file list
 *
 * @fires civ-input - When files change, detail: { files: File[] }
 * @fires civ-change - When files are added or removed, detail: { files: File[] }
 * @fires civ-analytics - Analytics tracking event on file add/remove
 *
 * Note: Event detail uses `{ files }` instead of the standard `{ value }`
 * because file data cannot be represented as a single string. Use the
 * `files` getter or `toFormData()` on the parent civ-form for submission.
 */
@customElement('civ-file-upload')
export class CivFileUpload extends CivFormElement {
  @property({ type: String }) accept = '';
  @property({ type: Boolean }) multiple = false;
  @property({ type: Boolean, attribute: 'show-preview' }) showPreview = false;
  @property({ type: Number, attribute: 'max-size' }) maxSize = 0;
  @property({ type: Number, attribute: 'max-files' }) maxFiles = 0;

  @property({ type: String, attribute: 'drag-text' }) dragText = '';
  @property({ type: String, attribute: 'browse-text' }) browseText = '';
  @property({ type: String, attribute: 'accepted-label' }) acceptedLabel = '';
  @property({ type: String, attribute: 'max-size-label' }) maxSizeLabel = '';
  @property({ type: String, attribute: 'remove-text' }) removeText = '';
  @property({ type: String, attribute: 'remove-aria-label' }) removeAriaLabel = '';
  @property({ type: String, attribute: 'files-list-label' }) filesListLabel = '';
  @property({ type: String, attribute: 'file-added-message' }) fileAddedMessage = '';
  @property({ type: String, attribute: 'file-removed-message' }) fileRemovedMessage = '';
  @property({ type: String, attribute: 'file-size-error' }) fileSizeError = '';
  @property({ type: String, attribute: 'file-type-error' }) fileTypeError = '';
  @property({ type: String, attribute: 'max-files-error' }) maxFilesError = '';

  @state() private _files: UploadedFile[] = [];
  @state() private _dragging = false;

  private _previewUrls = new Map<File, string>();

  private _boundDragOver = this._onDragOver.bind(this);
  private _boundDragLeave = this._onDragLeave.bind(this);
  private _boundDrop = this._onDrop.bind(this);

  get files(): File[] {
    return this._files.map((f) => f.file);
  }

  override render() {
    return html`
      ${this.showPreview ? previewStyles : nothing}
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}

        <div
          class="civ-dropzone focus-visible:civ-focus-ring"
          @dragover="${this._boundDragOver}"
          @dragleave="${this._boundDragLeave}"
          @drop="${this._boundDrop}"
          @click="${this._onDropzoneClick}"
          role="button"
          tabindex="${this.disabled ? '-1' : '0'}"
          aria-label="${this.label}"
          aria-required="${this.required || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          aria-disabled="${this.disabled || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          @keydown="${this._onDropzoneKeydown}"
          data-dragging="${this._dragging ? '' : nothing}"
        >
          <span class="civ-block civ-text-body" style="color: var(--civ-color-base-dark)">
            ${this.dragText || t('fileUploadDragText')}
            <span class="civ-text-primary civ-underline">${this.browseText || t('fileUploadBrowseText')}</span>
          </span>
          ${this.accept
            ? html`<span class="civ-block civ-text-sm civ-text-muted civ-mt-1">${this.acceptedLabel || t('fileUploadAcceptedLabel')}${this.accept}</span>`
            : nothing}
          ${this.maxSize > 0
            ? html`<span class="civ-block civ-text-sm civ-text-muted civ-mt-0.5">${this.maxSizeLabel || t('fileUploadMaxSizeLabel')}${formatFileSize(this.maxSize)}</span>`
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
              <ul class="civ-list-none civ-p-0 civ-mt-2 civ-space-y-1" aria-label="${this.filesListLabel || t('fileUploadFilesListLabel')}">
                ${this._files.map(
                  (file, index) => html`
                    <li class="civ-file-item">
                      <span class="civ-flex civ-items-center civ-gap-2">
                        ${this.showPreview && file.type?.startsWith('image/')
                          ? html`<img class="civ-file-preview" src="${this._getPreviewUrl(file.file)}" alt="" />`
                          : nothing}
                        <span class="civ-font-semibold">${file.name}</span>
                        <span class="civ-ms-2">(${formatFileSize(file.size)})</span>
                      </span>
                      <button
                        type="button"
                        class="civ-file-remove-btn focus-visible:civ-focus-ring"
                        @click="${() => this._removeFile(index)}"
                        aria-label="${interpolate(this.removeAriaLabel || t('fileUploadRemoveAriaLabel'), { name: file.name })}"
                        ?disabled="${this.disabled}"
                      >
                        ${this.removeText || t('fileUploadRemoveText')}
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

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._revokeAllPreviewUrls();
  }

  private _getPreviewUrl(file: File): string {
    let url = this._previewUrls.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this._previewUrls.set(file, url);
    }
    return url;
  }

  private _revokeAllPreviewUrls(): void {
    for (const url of this._previewUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this._previewUrls.clear();
  }

  private _revokePreviewUrl(file: File): void {
    const url = this._previewUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this._previewUrls.delete(file);
    }
  }

  protected override _syncFormValue(): void {
    // File upload manages its own FormData via _updateFormData()
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

  private _isFileTypeAccepted(file: File): boolean {
    if (!this.accept) return true;
    const accepted = this.accept.split(',').map((s) => s.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return accepted.some((pattern) => {
      if (pattern.startsWith('.')) {
        // Extension match (e.g. ".pdf")
        return fileName.endsWith(pattern);
      }
      if (pattern.endsWith('/*')) {
        // MIME type wildcard (e.g. "image/*")
        return fileType.startsWith(pattern.slice(0, -1));
      }
      // Exact MIME type match (e.g. "application/pdf")
      return fileType === pattern;
    });
  }

  private _addFiles(newFiles: File[]): void {
    const validated: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (this.accept && !this._isFileTypeAccepted(file)) {
        errors.push(interpolate(this.fileTypeError || t('fileUploadFileTypeError'), { name: file.name }));
        continue;
      }
      if (this.maxSize > 0 && file.size > this.maxSize) {
        errors.push(interpolate(this.fileSizeError || t('fileUploadFileSizeError'), { name: file.name, size: formatFileSize(this.maxSize) }));
        continue;
      }
      validated.push({ name: file.name, size: file.size, type: file.type, file });
    }

    // Accept files up to the maxFiles limit
    if (this.maxFiles > 0 && this.multiple) {
      const available = this.maxFiles - this._files.length;
      if (validated.length > available) {
        validated.splice(available);
        errors.push(interpolate(this.maxFilesError || t('fileUploadMaxFilesError'), { max: this.maxFiles }));
      }
    }

    if (errors.length > 0) {
      this.error = errors.join('. ');
      // Base class updated() announces errors assertively — no manual announce needed
    }

    if (validated.length === 0) return;

    // Clear error only if no validation errors occurred
    if (errors.length === 0) this.error = '';

    if (this.multiple) {
      this._files = [...this._files, ...validated];
    } else {
      this._files = validated.slice(0, 1);
    }

    this._updateFormData();
    this._dispatchChange();
    this.sendAnalytics('upload', { fileCount: this._files.length });
    this.announce(interpolate(this.fileAddedMessage || t('fileUploadFileAddedMessage'), { count: validated.length, total: this._files.length }));
  }

  private _removeFile(index: number): void {
    const removed = this._files[index];
    if (removed) this._revokePreviewUrl(removed.file);
    this._files = this._files.filter((_, i) => i !== index);
    if (this._files.length === 0) this.error = '';
    this._updateFormData();
    this._dispatchChange();
    this.sendAnalytics('remove', { fileCount: this._files.length });
    this.announce(interpolate(this.fileRemovedMessage || t('fileUploadFileRemovedMessage'), { total: this._files.length }));

    // Move focus to the next remove button, or the dropzone if no files remain
    this.updateComplete.then(() => {
      const buttons = this.querySelectorAll<HTMLButtonElement>('.civ-file-remove-btn');
      if (buttons.length > 0) {
        const next = buttons[Math.min(index, buttons.length - 1)];
        next.focus();
      } else {
        const dropzone = this.querySelector<HTMLElement>('.civ-dropzone');
        dropzone?.focus();
      }
    });
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
    const files = this._files.map((f) => f.file);
    dispatch(this, 'civ-input', { files });
    dispatch(this, 'civ-change', { files });
  }

  override formResetCallback(): void {
    this._revokeAllPreviewUrls();
    this._files = [];
    this.value = '';
    this.error = '';
    this.updateFormValue(null);
    const input = this.querySelector(`#${this._inputId}`) as HTMLInputElement | null;
    if (input) input.value = '';
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-file-upload': CivFileUpload;
  }
}
