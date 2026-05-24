// Schema: packages/schema/src/components/civ-file-upload.schema.ts

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, LegendHeadingMixin, dispatch, interpolate, renderLabel, renderFormHeader, t } from '@civui/core';
// Compose sibling primitives instead of re-implementing image preview
// chrome or a hand-rolled loading icon — civ-image gets lazy-load,
// decoding=async, and CLS-safe layout for free; civ-spinner gets the
// shared delay / min-duration flash protection + the announce queue.
import '@civui/layout/image';
import '@civui/feedback/spinner';

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
 * @fires civ-file-upload-before-remove - Cancelable. Fires before a file is removed. `preventDefault()` aborts the removal — wire this up to insert a confirmation step (e.g. a `civ-modal`), then re-call `removeFile(index, { skipConfirm: true })` from the confirm handler. Detail: { index, name, isInitial, id? }
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
export class CivFileUpload extends LegendHeadingMixin(CivFormElement) {
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
  private _filesListId = this.generateId('files');

  private _previewUrls = new Map<File, string>();
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
      this.announce(interpolate(t('fileUploadError'), { name: file.name, error: file.error || t('fileUploadUnknownError') }));
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
    const inner = html`
        ${this.readonly ? nothing : this._renderTrigger()}
        ${this._renderHiddenInput()}
        ${this._renderFileList()}
    `;

    return html`
      <div class="civ-mb-4">
        ${renderFormHeader({
          label: renderLabel({
            label: this.label,
            inputId: this._inputId,
            required: this.required,
            headingLevel: this.headingLevel,
            size: this.size,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
        })}
        ${inner}
      </div>
    `;
  }

  /**
   * Render the visible file-picker trigger — either the compact "Browse" pill
   * or the full dropzone with drag/drop affordances.
   */
  private _renderTrigger() {
    if (this.variant === 'compact') {
      return html`
        <button
          type="button"
          class="civ-flex civ-items-stretch civ-w-full civ-bg-transparent civ-border-0 civ-p-0 civ-cursor-pointer civ-rounded"
          @click="${this._onDropzoneClick}"
          ?disabled="${this.disabled}"
        >
          <span class="civ-input civ-flex-1 civ-truncate civ-text-start civ-rounded-s" style="border-inline-end:0;border-start-end-radius:0;border-end-end-radius:0;">
            ${this._files.length > 0
              ? this._files.map(f => f.name).join(', ')
              : (this.dragText || t('fileUploadNoFileChosen'))}
          </span>
          <span class="civ-action-btn civ-action-btn--tertiary civ-shrink-0 civ-rounded-e" style="border-start-start-radius:0;border-end-start-radius:0;">${this.browseText || t('fileUploadBrowseText')}</span>
        </button>`;
    }
    return html`
      <button
        type="button"
        class="civ-dropzone ${this.variant === 'full' ? 'civ-dropzone--full' : ''}"
        @dragover="${this._boundDragOver}"
        @dragleave="${this._boundDragLeave}"
        @drop="${this._boundDrop}"
        @click="${this._onDropzoneClick}"
        aria-label="${this.label}"
        aria-required="${this.required || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
        aria-describedby="${[this._ariaDescribedBy, this._files.length > 0 ? this._filesListId : ''].filter(Boolean).join(' ') || nothing}"
        data-dragging="${this._dragging ? '' : nothing}"
      >
        <span class="civ-block civ-text-body civ-mb-1">
          ${this.dragText || t('fileUploadDragText')}
        </span>
        <span class="civ-action-btn civ-action-btn--tertiary">${this.browseText || t('fileUploadBrowseText')}</span>
        ${this.accept
          ? html`<span class="civ-block civ-text-sm civ-mt-1">${this.acceptedLabel || t('fileUploadAcceptedLabel')}${formatAcceptedTypes(this.accept)}</span>`
          : nothing}
        ${this.maxSize > 0
          ? html`<span class="civ-block civ-text-sm civ-mt-0.5">${this.maxSizeLabel || t('fileUploadMaxSizeLabel')}${formatFileSize(this.maxSize)}</span>`
          : nothing}
      </button>`;
  }

  /** Render the offscreen native `<input type="file">` that backs the picker. */
  private _renderHiddenInput() {
    return html`
      <input
        id="${this._inputId}"
        type="file"
        name="${this.name}"
        accept="${this.accept || nothing}"
        capture="${this.capture || nothing}"
        ?multiple="${this.multiple}"
        ?disabled="${this.disabled || this.readonly}"
        ?required="${this.required && this._files.length === 0}"
        class="civ-hidden"
        @change="${this._onFileSelect}"
        aria-hidden="true"
        tabindex="-1"
      />`;
  }

  /**
   * Render the selected-files list (status icon, name, progress bar, error,
   * action buttons) plus the "show all" expander when there are more than
   * `_FILE_LIST_LIMIT`. Returns `nothing` while the list is empty.
   */
  private _renderFileList() {
    if (this._files.length === 0) return nothing;
    const visible = this._showAllFiles ? this._files : this._files.slice(0, CivFileUpload._FILE_LIST_LIMIT);
    return html`
      <ul id="${this._filesListId}" class="civ-list-none civ-p-0 civ-mt-2" aria-label="${this.filesListLabel || t('fileUploadFilesListLabel')}">
        ${visible.map((file, index) => this._renderFileItem(file, index))}
      </ul>
      ${!this._showAllFiles && this._files.length > CivFileUpload._FILE_LIST_LIMIT ? html`
        <button
          type="button"
          class="civ-btn civ-btn--tertiary civ-mt-2"
          @click="${this._onShowAllFiles}"
        >${interpolate(t('fileUploadShowAll'), { count: this._files.length })}</button>
      ` : nothing}
    `;
  }

  /** Render a single file row: status icon, name (linkable for initial files), progress, error, actions. */
  private _renderFileItem(file: typeof this._files[number], index: number) {
    return html`
      <li class="civ-file-item">
        ${this.showPreview && file.type?.startsWith('image/')
          ? html`<civ-image
              class="civ-file-preview civ-shrink-0"
              src="${this._getPreviewUrl(file.file)}"
              alt=""
              variant="thumbnail"
              size="32"
            ></civ-image>`
          : file.status === 'success'
            ? html`<civ-icon name="check-circle" class="civ-shrink-0 civ-text-success"></civ-icon>`
            : file.status === 'error'
              ? html`<civ-icon name="error" class="civ-shrink-0 civ-text-error"></civ-icon>`
              : file.status === 'uploading'
                ? html`<civ-spinner size="sm" decorative class="civ-shrink-0"></civ-spinner>`
                : nothing}
        <div class="civ-file-item__content">
          <span class="civ-block">
            ${file.isInitial && file.url
              ? html`<a href="${file.url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
              : html`${file.name}`}
            <span class="civ-text-sm">(${formatFileSize(file.size)})</span>
          </span>
          ${file.status === 'uploading' ? html`
            <div class="civ-progress-track civ-progress-track--compact civ-mt-1">
              <div class="civ-progress-fill" style="width: ${file.progress}%" role="progressbar" aria-valuenow="${file.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${interpolate(t('fileUploadProgressAriaLabel'), { name: file.name })}"></div>
            </div>
          ` : nothing}
          ${file.status === 'error' && file.error ? html`
            <span class="civ-file-error-text civ-block civ-mt-1">${file.error}</span>
          ` : nothing}
        </div>
        ${this.readonly ? nothing : html`<span class="civ-file-item__actions">
          ${file.status === 'uploading' ? html`
            <civ-action-button
              emphasis="tertiary"
              label="${t('fileUploadCancelText')}"
              aria-label="${interpolate(t('fileUploadCancelAriaLabel'), { name: file.name })}"
              @click="${() => this._cancelUpload(index)}"
            ></civ-action-button>
          ` : nothing}
          ${file.status === 'error' ? html`
            <civ-action-button
              emphasis="tertiary"
              label="${t('fileUploadRetryText')}"
              aria-label="${interpolate(t('fileUploadRetryAriaLabel'), { name: file.name })}"
              @click="${() => this._retryUpload(index)}"
            ></civ-action-button>
          ` : nothing}
          ${file.status !== 'uploading' ? html`
            <button
              type="button"
              class="civ-close-btn"
              aria-label="${interpolate(this.removeAriaLabel || t('fileUploadRemoveAriaLabel'), { name: file.name })}"
              ?disabled="${this.disabled}"
              @click="${() => this.removeFile(index)}"
              data-file-remove
            ><civ-icon name="close" aria-hidden="true"></civ-icon></button>
          ` : nothing}
        </span>`}
      </li>
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._maybeHydrateInitialFiles();
  }

  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    return ids.join(' ');
  }

  override willUpdate(changed: Map<string, unknown>): void {
    // initialFiles can land async (e.g. fetched after mount) — hydrate when
    // it first becomes non-empty. Subsequent reassignments after hydration
    // are ignored intentionally to avoid mid-flow surprises. Run before
    // render so the hydration state is reflected in this update cycle
    // instead of triggering a second update.
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
  }

  /**
   * Announce upload progress at quarter milestones (25/50/75/100) per
   * file. Continuous announcements would be too noisy on long uploads
   * — AT users only need confirmation that progress is happening.
   * The map tracks the highest milestone announced per file name so
   * we don't re-announce the same threshold if progress oscillates.
   */
  private _progressMilestones = new Map<string, number>();

  private _announceProgress(name: string, progress: number): void {
    const milestones = [25, 50, 75, 100];
    const lastAnnounced = this._progressMilestones.get(name) ?? 0;
    // Highest milestone reached so far; jumping from 50 to 100 announces 100, not 75.
    const reached = milestones.filter((m) => m <= progress).at(-1);
    if (reached === undefined || reached <= lastAnnounced) return;
    this._progressMilestones.set(name, reached);
    this.announce(interpolate(t('fileUploadUploading'), { name, progress: String(reached) }));
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
    if (this.disabled || this.readonly) return;
    const input = this.querySelector(`#${this._inputId}`) as HTMLInputElement;
    input?.click();
  }

  /**
   * Reveal hidden files past the list limit. The toggle button itself
   * disappears, so move focus onto the first newly-revealed remove
   * button — otherwise focus is lost and AT users have no signal that
   * the list grew. Announce the change for screen readers that aren't
   * tracking focus position.
   */
  private _onShowAllFiles(): void {
    const previouslyVisible = CivFileUpload._FILE_LIST_LIMIT;
    this._showAllFiles = true;
    this.announce(interpolate(t('fileUploadShowAllAnnounce'), { count: this._files.length }));
    void this._afterUpdate('focus first newly-revealed remove button', () => {
      const buttons = this.querySelectorAll<HTMLButtonElement>('[data-file-remove]');
      buttons[previouslyVisible]?.focus();
    });
  }

  /**
   * Run a callback after the next render completes. Surfaces a thrown
   * error through console.error rather than swallowing it as an
   * unobserved promise rejection.
   */
  private async _afterUpdate(context: string, fn: () => void): Promise<void> {
    try {
      await this.updateComplete;
      fn();
    } catch (err) {
      console.error(`civ-file-upload: failed after update (${context})`, err);
    }
  }

  private _onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled && !this.readonly) this._dragging = true;
  }

  private _onDragLeave(): void {
    this._dragging = false;
  }

  private _onDrop(e: DragEvent): void {
    e.preventDefault();
    this._dragging = false;
    if (this.disabled || this.readonly || !e.dataTransfer) return;
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
    this._progressMilestones.delete(file.name);
    this.requestUpdate();
    this.announce(interpolate(t('fileUploadRetryAnnounce'), { name: file.name }));
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

  /**
   * Remove a file by index. Fires a cancelable
   * `civ-file-upload-before-remove` event first; consumers wiring
   * confirmation call `e.preventDefault()` and then re-call
   * `removeFile(index, { skipConfirm: true })` from their confirm
   * handler to bypass the hook on the re-entry pass.
   *
   * @param opts.skipConfirm  Bypass the cancelable hook. Used by the
   *   consumer's confirmation flow when they've already gathered
   *   user intent via a modal.
   */
  removeFile(index: number, opts: { skipConfirm?: boolean } = {}): void {
    const removed = this._files[index];
    if (!removed) return;

    // Cancelable pre-flight — match the shape of `civ-file-removed`
    // so the listener has everything it needs to build the modal copy.
    if (!opts.skipConfirm) {
      const beforeDetail: {
        index: number;
        name: string;
        isInitial: boolean;
        id?: string;
      } = {
        index,
        name: removed.name,
        isInitial: !!removed.isInitial,
      };
      if (removed.id) beforeDetail.id = removed.id;
      const allowed = dispatch(
        this,
        'civ-file-upload-before-remove',
        beforeDetail,
        /* cancelable */ true,
      );
      if (!allowed) return;
    }

    this._revokePreviewUrl(removed.file);
    // Abort any in-progress upload
    if (removed.abortController) {
      removed.abortController.abort();
    }
    if (removed.isInitial && removed.id) {
      this._removedInitialIds.add(removed.id);
    }
    this._files = this._files.filter((_, i) => i !== index);
    if (this._files.length === 0) this.error = '';
    if (this._files.length <= CivFileUpload._FILE_LIST_LIMIT) {
      this._showAllFiles = false;
    }
    this._progressMilestones.delete(removed.name);
    this._updateFormData();
    this._dispatchChange();
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
    this.sendAnalytics('remove', { fileCount: this._files.length });
    this.announce(interpolate(this.fileRemovedMessage || t('fileUploadFileRemovedMessage'), { name: removed.name, total: this._files.length }));

    // Move focus to the next remove button, or the dropzone if no files remain
    void this._afterUpdate('restore focus after file removal', () => {
      const buttons = this.querySelectorAll<HTMLButtonElement>('[data-file-remove]');
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
