import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, interpolate, renderLabel, renderHint, renderError, t } from '@civui/core';

type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * Represents a file that was uploaded in a previous session and is now
 * persisted on the server. Used to hydrate `civ-file-upload` when restoring
 * a saved draft so the user can see what's already attached, remove items,
 * and continue.
 */
export interface InitialFile {
  /** Original filename. */
  name: string;
  /** File size in bytes. Used for display and duplicate detection. */
  size: number;
  /** MIME type. Optional — used for the image-preview heuristic. */
  type?: string;
  /** Server-side identifier. Echoed back via `civ-file-removed` and `kept-initial-ids` form data so consumers can diff. */
  id?: string;
  /** Optional download/preview URL. When provided, the file name renders as an `<a target="_blank">`. */
  url?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  /**
   * Real File object for browser-side uploads. Initial files (server-resident
   * restore-from-draft entries) carry a placeholder File so the existing
   * code paths (`files` getter, FormData submission for new uploads) still
   * work; check `isInitial` to distinguish.
   */
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  abortController?: AbortController;
  /** True for entries hydrated from `initialFiles` (server-resident, no real upload). */
  isInitial?: boolean;
  /** Server identifier copied from `InitialFile.id`. */
  id?: string;
  /** Download URL copied from `InitialFile.url`. */
  url?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Map MIME types and extensions to plain language labels. */
const FILE_TYPE_LABELS: Record<string, string> = {
  // Documents
  '.pdf': 'PDF',
  'application/pdf': 'PDF',
  '.doc': 'Word',
  '.docx': 'Word',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  '.xls': 'Excel',
  '.xlsx': 'Excel',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  '.ppt': 'PowerPoint',
  '.pptx': 'PowerPoint',
  '.csv': 'CSV',
  'text/csv': 'CSV',
  '.txt': 'plain text',
  'text/plain': 'plain text',
  '.rtf': 'RTF',
  // Images
  '.jpg': 'JPEG',
  '.jpeg': 'JPEG',
  'image/jpeg': 'JPEG',
  '.png': 'PNG',
  'image/png': 'PNG',
  '.gif': 'GIF',
  'image/gif': 'GIF',
  '.svg': 'SVG',
  'image/svg+xml': 'SVG',
  '.webp': 'WebP',
  'image/webp': 'WebP',
  '.tiff': 'TIFF',
  '.tif': 'TIFF',
  'image/tiff': 'TIFF',
  '.bmp': 'BMP',
  'image/bmp': 'BMP',
  '.heic': 'HEIC',
  // Wildcards
  'image/*': 'images',
  'audio/*': 'audio files',
  'video/*': 'video files',
  'text/*': 'text files',
  // Archives
  '.zip': 'ZIP',
  'application/zip': 'ZIP',
  '.gz': 'GZIP',
  '.tar': 'TAR',
};

/**
 * Convert an accept string like ".pdf,.jpg,image/*" to
 * plain language like "PDF, JPEG, images".
 */
function formatAcceptedTypes(accept: string): string {
  if (!accept) return '';
  const types = accept.split(',').map(s => s.trim());
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const type of types) {
    const label = FILE_TYPE_LABELS[type.toLowerCase()];
    if (label && !seen.has(label)) {
      seen.add(label);
      labels.push(label);
    } else if (!label && !seen.has(type)) {
      // Unknown type — show as-is but cleaned up
      seen.add(type);
      labels.push(type.replace(/^\./, '').toUpperCase());
    }
  }

  if (labels.length === 0) return accept;
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return labels.slice(0, -1).join(', ') + ', and ' + labels[labels.length - 1];
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
 * @fires civ-upload-cancel - When a file upload is cancelled, detail: { index, name }
 * @fires civ-upload-retry - When a file upload is retried, detail: { index, name, file }
 * @fires civ-file-removed - When any file is removed, detail: { index, name, isInitial, id? }
 *   For initial-files (isInitial=true), `id` echoes the server identifier so the
 *   consumer can issue a DELETE; for browser-side files, isInitial=false and no id.
 * @fires civ-analytics - Analytics tracking event on file add/remove
 *
 * Note: Event detail uses `{ files }` instead of the standard `{ value }`
 * because file data cannot be represented as a single string. Use the
 * `files` getter or `toFormData()` on the parent civ-form for submission.
 */
/** Camera-capture hint — passes through to the native <input type="file" capture> attribute. */
export type FileUploadCapture = 'user' | 'environment' | '';

@customElement('civ-file-upload')
export class CivFileUpload extends CivFormElement {
  @property({ type: String }) accept = '';
  @property({ type: Boolean }) multiple = false;
  @property({ type: Boolean, attribute: 'show-preview' }) showPreview = false;

  /**
   * Camera capture hint for mobile browsers (passes through to the native
   * `<input type="file">` `capture` attribute):
   * - `user` — front camera ("selfie" / liveness checks)
   * - `environment` — back camera (document scanning, photo upload)
   * - `''` (default) — no capture preference; user picks file or camera
   *
   * Only meaningful when `accept` matches a media type the camera can
   * produce (e.g. `accept="image/*"` or `accept="video/*"`). Desktop
   * browsers ignore this attribute.
   */
  @property({ type: String }) capture: FileUploadCapture = '';

  /**
   * Upload zone variant:
   * - `default` — medium dropzone with icon and text
   * - `compact` — inline text field with browse button (no drag zone)
   * - `full` — large dropzone filling available space
   */
  @property({ type: String }) variant: 'default' | 'compact' | 'full' = 'default';
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

  /**
   * Files that were uploaded in a previous session and are now persisted
   * on the server. Use to restore a saved draft so the user sees what's
   * already attached, can remove items, and continue. Set via JS property:
   *
   * ```js
   * el.initialFiles = [
   *   { id: 'srv-abc', name: 'tax-return.pdf', size: 1240000, url: '/files/srv-abc' },
   * ];
   * ```
   *
   * Hydrated once on first connect — subsequent property changes are
   * ignored to avoid mid-flow surprises (use `_files`-driven imperative
   * APIs if you need to manipulate the list at runtime).
   */
  @property({ type: Array, attribute: false }) initialFiles: InitialFile[] = [];

  @state() private _files: UploadedFile[] = [];
  @state() private _dragging = false;
  @state() private _showAllFiles = false;

  private static readonly _FILE_LIST_LIMIT = 20;

  /** IDs of initial files the user has removed since hydration. */
  private _removedInitialIds = new Set<string>();

  private _previewUrls = new Map<File, string>();
  private _progressAnnounceTimer?: ReturnType<typeof setTimeout>;
  private _hydratedFromInitial = false;

  private _boundDragOver = this._onDragOver.bind(this);
  private _boundDragLeave = this._onDragLeave.bind(this);
  private _boundDrop = this._onDrop.bind(this);

  get files(): File[] {
    return this._files.map((f) => f.file);
  }

  /** Update a file's upload status. Call from your upload handler. */
  setFileStatus(index: number, status: FileStatus, opts?: { progress?: number; error?: string }): void {
    const file = this._files[index];
    if (!file) return;
    const prevStatus = file.status;
    file.status = status;
    if (opts?.progress !== undefined) file.progress = opts.progress;
    if (opts?.error) file.error = opts.error;
    this.requestUpdate();

    // Screen reader announcements
    if (status === 'uploading') {
      this._announceProgress(file.name, file.progress);
    } else if (status === 'success') {
      this.announce(interpolate(t('fileUploadSuccess'), { name: file.name }));
    } else if (status === 'error' && prevStatus !== 'error') {
      this.announce(interpolate(t('fileUploadError'), { name: file.name, error: file.error || 'Unknown error' }));
    }
  }

  /** Get an AbortController for a file to enable cancellation. */
  getAbortController(index: number): AbortController | undefined {
    const file = this._files[index];
    if (!file) return undefined;
    if (!file.abortController) {
      file.abortController = new AbortController();
    }
    return file.abortController;
  }

  override render() {
    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required, showRequired: this.required && !this.hideRequiredIndicator })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}

        ${this.variant === 'compact'
          ? html`
            <div class="civ-flex civ-gap-2 civ-items-center">
              <span class="civ-input civ-flex-1 civ-truncate civ-text-muted">
                ${this._files.length > 0
                  ? this._files.map(f => f.name).join(', ')
                  : (this.dragText || t('fileUploadNoFileChosen'))}
              </span>
              <civ-action-button
                variant="secondary"
                label="${this.browseText || t('fileUploadBrowseText')}"
                @click="${this._onDropzoneClick}"
                ?disabled="${this.disabled}"
                class="civ-shrink-0"
              ></civ-action-button>
            </div>`
          : html`
            <div
              class="civ-dropzone ${this.variant === 'full' ? 'civ-dropzone--full' : ''} focus-visible:civ-focus-ring"
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
              <civ-icon name="upload" size="${this.variant === 'full' ? '2.5em' : '1.5em'}" class="civ-block civ-mb-2 civ-dropzone__icon"></civ-icon>
              <span class="civ-block civ-text-body civ-mb-3 civ-text-muted">
                ${this.dragText || t('fileUploadDragText')}
              </span>
              <span class="civ-btn civ-btn--tertiary civ-text-sm">${this.browseText || t('fileUploadBrowseText')}</span>
              ${this.accept
                ? html`<span class="civ-block civ-text-sm civ-text-muted civ-mt-1">${this.acceptedLabel || t('fileUploadAcceptedLabel')}${formatAcceptedTypes(this.accept)}</span>`
                : nothing}
              ${this.maxSize > 0
                ? html`<span class="civ-block civ-text-sm civ-text-muted civ-mt-0.5">${this.maxSizeLabel || t('fileUploadMaxSizeLabel')}${formatFileSize(this.maxSize)}</span>`
                : nothing}
            </div>`}

        <input
          id="${this._inputId}"
          type="file"
          name="${this.name}"
          accept="${this.accept || nothing}"
          capture="${this.capture || nothing}"
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
                ${(this._showAllFiles ? this._files : this._files.slice(0, CivFileUpload._FILE_LIST_LIMIT)).map(
                  (file, index) => html`
                    <li class="civ-file-item ${file.status === 'success' ? 'civ-file-item--success' : ''} ${file.status === 'error' ? 'civ-file-item--error' : ''}">
                      <div class="civ-flex-1">
                        <span class="civ-flex civ-items-center civ-gap-2">
                          ${this.showPreview && file.type?.startsWith('image/')
                            ? html`<img class="civ-file-preview" src="${this._getPreviewUrl(file.file)}" alt="" />`
                            : nothing}
                          ${file.status === 'success'
                            ? html`<span class="civ-icon civ-icon--check civ-text-success" aria-hidden="true"></span>`
                            : nothing}
                          ${file.status === 'error'
                            ? html`<span class="civ-icon civ-icon--error civ-text-error" aria-hidden="true"></span>`
                            : nothing}
                          ${file.isInitial && file.url
                            ? html`<a class="civ-font-semibold" href="${file.url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
                            : html`<span class="civ-font-semibold">${file.name}</span>`}
                          <span class="civ-ms-2">(${formatFileSize(file.size)})</span>
                        </span>
                        ${file.status === 'uploading' ? html`
                          <div class="civ-file-progress">
                            <div class="civ-file-progress-bar" style="width: ${file.progress}%" role="progressbar" aria-valuenow="${file.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${interpolate(t('fileUploadProgressAriaLabel'), { name: file.name })}"></div>
                          </div>
                        ` : nothing}
                        ${file.status === 'error' && file.error ? html`
                          <span class="civ-file-error-text">${file.error}</span>
                        ` : nothing}
                      </div>
                      <span class="civ-flex civ-items-center civ-gap-1">
                        ${file.status === 'uploading' ? html`
                          <civ-action-button
                            variant="tertiary"
                            label="${t('fileUploadCancelText')}"
                            aria-label="${interpolate(t('fileUploadCancelAriaLabel'), { name: file.name })}"
                            @click="${() => this._cancelUpload(index)}"
                          ></civ-action-button>
                        ` : nothing}
                        ${file.status === 'error' ? html`
                          <civ-action-button
                            variant="tertiary"
                            label="${t('fileUploadRetryText')}"
                            aria-label="${interpolate(t('fileUploadRetryAriaLabel'), { name: file.name })}"
                            @click="${() => this._retryUpload(index)}"
                          ></civ-action-button>
                        ` : nothing}
                        ${file.status !== 'uploading' ? html`
                          <civ-action-button
                            variant="tertiary"
                            danger
                            label="${this.removeText || t('fileUploadRemoveText')}"
                            aria-label="${interpolate(this.removeAriaLabel || t('fileUploadRemoveAriaLabel'), { name: file.name })}"
                            ?disabled="${this.disabled}"
                            @click="${() => this._removeFile(index)}"
                            class="civ-file-remove-btn"
                          ></civ-action-button>
                        ` : nothing}
                      </span>
                    </li>
                  `,
                )}
              </ul>
              ${!this._showAllFiles && this._files.length > CivFileUpload._FILE_LIST_LIMIT ? html`
                <button
                  type="button"
                  class="civ-btn civ-btn--tertiary civ-mt-2"
                  @click="${() => { this._showAllFiles = true; }}"
                >Show all ${this._files.length} files</button>
              ` : nothing}
            `
          : nothing}
      </div>
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._maybeHydrateInitialFiles();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    // initialFiles can land async (e.g. fetched after mount) — hydrate when
    // it first becomes non-empty. Subsequent reassignments after hydration
    // are ignored intentionally to avoid mid-flow surprises.
    if (changed.has('initialFiles')) {
      this._maybeHydrateInitialFiles();
    }
  }

  /**
   * Populate `_files` from `initialFiles` exactly once. Each entry becomes
   * a successful UploadedFile with `isInitial: true` so it's excluded from
   * upload lifecycle and FormData. Idempotent — safe to call multiple times.
   */
  private _maybeHydrateInitialFiles(): void {
    if (this._hydratedFromInitial) return;
    if (!this.initialFiles || this.initialFiles.length === 0) return;

    const hydrated: UploadedFile[] = this.initialFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type ?? '',
      // Placeholder File so the existing rendering / `files` getter shape
      // continues to work. Never sent in FormData (skipped by isInitial flag).
      file: new File([], f.name, { type: f.type ?? '' }),
      status: 'success' as FileStatus,
      progress: 100,
      isInitial: true,
      ...(f.id ? { id: f.id } : {}),
      ...(f.url ? { url: f.url } : {}),
    }));

    this._files = [...hydrated, ...this._files];
    this._hydratedFromInitial = true;
    this._updateFormData();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._revokeAllPreviewUrls();
    if (this._progressAnnounceTimer) {
      clearTimeout(this._progressAnnounceTimer);
    }
  }

  private _announceProgress(name: string, progress: number): void {
    if (this._progressAnnounceTimer) {
      clearTimeout(this._progressAnnounceTimer);
    }
    this._progressAnnounceTimer = setTimeout(() => {
      this.announce(interpolate(t('fileUploadUploading'), { name, progress: String(progress) }));
    }, 500);
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

  private _cancelUpload(index: number): void {
    const file = this._files[index];
    if (!file) return;
    if (file.abortController) {
      file.abortController.abort();
    }
    file.status = 'error';
    file.error = t('fileUploadCancelled');
    file.progress = 0;
    this.requestUpdate();
    dispatch(this, 'civ-upload-cancel', { index, name: file.name });
    this.announce(interpolate(t('fileUploadCancelledAnnounce'), { name: file.name }));
  }

  private _retryUpload(index: number): void {
    const file = this._files[index];
    if (!file) return;
    file.status = 'pending';
    file.error = undefined;
    file.progress = 0;
    file.abortController = undefined;
    this.requestUpdate();
    dispatch(this, 'civ-upload-retry', { index, name: file.name, file: file.file });
  }

  /**
   * Returns true if `file` is already in the current list. Matches by
   * name + size + lastModified for browser-side files (close enough to
   * "the same file" for UX purposes). Initial files (server-resident)
   * have no real `lastModified`, so they match on name + size only —
   * accepted as a reasonable trade since re-uploading a previously-saved
   * file is the expected reason a consumer would see a name+size match
   * after draft restore.
   */
  private _isDuplicate(file: File): boolean {
    return this._files.some((existing) => {
      if (existing.name !== file.name || existing.size !== file.size) return false;
      if (existing.isInitial) return true;
      return existing.file.lastModified === file.lastModified;
    });
  }

  private _addFiles(newFiles: File[]): void {
    const validated: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (file.size === 0) {
        errors.push(interpolate(t('fileUploadEmptyFile'), { name: file.name }));
        continue;
      }
      if (this._isDuplicate(file)) {
        errors.push(interpolate(t('fileUploadDuplicateError'), { name: file.name }));
        continue;
      }
      if (this.accept && !this._isFileTypeAccepted(file)) {
        errors.push(interpolate(this.fileTypeError || t('fileUploadFileTypeError'), { name: file.name, accepted: formatAcceptedTypes(this.accept) }));
        continue;
      }
      if (this.maxSize > 0 && file.size > this.maxSize) {
        errors.push(interpolate(this.fileSizeError || t('fileUploadFileSizeError'), { name: file.name, size: formatFileSize(this.maxSize) }));
        continue;
      }
      validated.push({ name: file.name, size: file.size, type: file.type, file, status: 'pending', progress: 0 });
    }

    // Accept files up to the maxFiles limit
    if (this.maxFiles > 0 && this.multiple) {
      const available = this.maxFiles - this._files.length;
      if (validated.length > available) {
        const rejected = validated.splice(available);
        for (const r of rejected) {
          errors.push(interpolate(this.maxFilesError || t('fileUploadMaxFilesError'), { max: this.maxFiles, name: r.name }));
        }
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
    if (removed) {
      this._revokePreviewUrl(removed.file);
      // Abort any in-progress upload
      if (removed.abortController) {
        removed.abortController.abort();
      }
      if (removed.isInitial && removed.id) {
        this._removedInitialIds.add(removed.id);
      }
    }
    this._files = this._files.filter((_, i) => i !== index);
    if (this._files.length === 0) this.error = '';
    this._updateFormData();
    this._dispatchChange();
    if (removed) {
      const detail: {
        index: number;
        name: string;
        isInitial: boolean;
        id?: string;
      } = {
        index,
        name: removed.name,
        isInitial: !!removed.isInitial,
      };
      if (removed.id) detail.id = removed.id;
      dispatch(this, 'civ-file-removed', detail);
    }
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

  /** IDs of initial files the user has removed since hydration. */
  get removedInitialFileIds(): string[] {
    return [...this._removedInitialIds];
  }

  /** IDs of initial files still present in the list. */
  get keptInitialFileIds(): string[] {
    return this._files.filter((f) => f.isInitial && f.id).map((f) => f.id!);
  }

  private _updateFormData(): void {
    const newFiles = this._files.filter((f) => !f.isInitial);
    const keptIds = this._files.filter((f) => f.isInitial && f.id).map((f) => f.id!);

    if (this._files.length === 0) {
      this.value = '';
      this.updateFormValue(null);
      return;
    }

    // Visible value reflects the full list (initial + new) so the standard
    // value-as-comma-list contract still works for consumers that only read
    // the value attribute. FormData carries a structural distinction:
    //   - new files: appended as File objects under `${name}`
    //   - kept initial files: appended as string ids under `${name}.kept-initial-ids`
    // The server can diff: ids it issued, minus kept-initial-ids = removed.
    this.value = this._files.map((f) => f.name).join(', ');

    if (newFiles.length === 0 && keptIds.length === 0) {
      // All-initial list with no IDs to track — submit nothing.
      this.updateFormValue(null);
      return;
    }

    const formData = new FormData();
    for (const f of newFiles) {
      formData.append(this.name || 'file', f.file);
    }
    const idKey = `${this.name || 'file'}.kept-initial-ids`;
    for (const id of keptIds) {
      formData.append(idKey, id);
    }
    this.updateFormValue(formData);
  }

  private _dispatchChange(): void {
    const files = this._files.map((f) => f.file);
    dispatch(this, 'civ-input', { files });
    dispatch(this, 'civ-change', { files });
  }

  override formResetCallback(): void {
    this._revokeAllPreviewUrls();
    this._files = [];
    this._removedInitialIds.clear();
    this._hydratedFromInitial = false;
    this.value = '';
    this.error = '';
    // Restore initial files so a draft-edit form snaps back to its
    // saved state on reset, matching native form-reset semantics.
    this._maybeHydrateInitialFiles();
    if (this._files.length === 0) this.updateFormValue(null);
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
