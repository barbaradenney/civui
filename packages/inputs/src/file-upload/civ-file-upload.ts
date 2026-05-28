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
import '@civui/actions/action-button';
import '../text-input/civ-text-input.js';

type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'locked';

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
 * @fires civ-file-unlock - When the user submits a password for a password-protected file (e.g. encrypted PDF). Detail: { index, name, file, password }. Fired from the inline unlock affordance that appears when the consumer marks a file as `'locked'` via `setFileStatus(i, 'locked')`. The consumer's upload pipeline owns decryption — typically by retrying the upload with the password attached to the request, or by client-side decryption (PDF.js etc.). The file's status is moved to `'uploading'` immediately and the password buffer is cleared from the component. Set `setFileStatus(i, 'locked', { error: 'Incorrect password' })` to re-prompt with the error visible.
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
   * Upload zone visual layout:
   * - `default` — medium dropzone with drag-and-drop and inline browse pill
   * - `inline` — compact pseudo-input + browse button row (no dropzone,
   *   no drag-and-drop). Matches the layout of native `<input type="file">`
   *   for placement in dense forms. The previous value name `compact` was
   *   renamed in v0.x to disambiguate from the system-wide `spacing="sm"`
   *   density convention used by every other CivUI component
   * - `large` — taller drag target with `min-height: 250px`, for landing
   *   pages or document-heavy workflows where the upload is the primary
   *   action on the page. Previously named `full`
   *
   * These three values describe **layout**, not density. There is no
   * density / chrome-size knob on file-upload today (a future `spacing`
   * prop would be additive).
   */
  @property({ type: String }) variant: 'default' | 'inline' | 'large' = 'default';
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

  /**
   * Component-owned validation error message (file too large, wrong type,
   * duplicate, etc.). Kept separate from `this.error` so the picker can
   * clear OUR error on the user's next interaction without trampling the
   * consumer's externally-set error prop (server-side validation, form-
   * pattern orchestration). Display logic: validation error takes
   * precedence over consumer error when both are set, on the principle
   * that the validation message is tied to the user's most recent action.
   */
  @state() private _validationError = '';

  private static readonly _FILE_LIST_LIMIT = 20;

  /** IDs of initial files the user has removed since hydration. */
  private _removedInitialIds = new Set<string>();
  private _filesListId = this.generateId('files');

  private _previewUrls = new Map<File, string>();
  private _hydratedFromInitial = false;

  /**
   * Per-file password buffer for the inline unlock affordance. Keyed by the
   * `File` object reference so the entry survives `_files` array reshuffles
   * (e.g. when a sibling file is removed). Cleared on unlock dispatch and on
   * file removal so passwords don't linger in memory.
   */
  private _passwordEntries = new WeakMap<File, string>();

  /**
   * Counter for dragenter/dragleave events. The dropzone button has
   * descendant spans (the text + browse pill); native dragleave fires when
   * the cursor moves between descendants of the drop target, which would
   * otherwise flicker `_dragging` off. Tracking enter/leave as a depth
   * counter and only flipping `_dragging` when the depth returns to zero
   * keeps the highlight stable while the cursor is anywhere inside the zone.
   */
  private _dragDepth = 0;

  private _boundDragOver = this._onDragOver.bind(this);
  private _boundDragEnter = this._onDragEnter.bind(this);
  private _boundDragLeave = this._onDragLeave.bind(this);
  private _boundDrop = this._onDrop.bind(this);

  get files(): File[] {
    return this._files.map((f) => f.file);
  }

  /**
   * Update a file's upload status from the consumer's upload pipeline.
   * Transitions clear any stale `file.error` from a previous state — pass
   * `opts.error` explicitly to set a new one (typical with `'error'` /
   * `'locked'`). Out-of-range index is a no-op.
   */
  setFileStatus(index: number, status: FileStatus, opts?: { progress?: number; error?: string }): void {
    const existing = this._files[index];
    if (!existing) return;
    const prevStatus = existing.status;
    // Immutable update: rebuild the row so Lit's reactivity tracks the
    // change via array-element identity, not in-place mutation of a
    // @state()-tracked object. Clears `error` on every transition unless
    // a new one was passed — otherwise transitioning from error → locked
    // leaves the old "Server returned 503" sitting under the password input.
    const next: UploadedFile = {
      ...existing,
      status,
      progress: opts?.progress !== undefined ? opts.progress : existing.progress,
      error: opts?.error !== undefined ? opts.error : undefined,
    };
    this._files = this._files.map((f, i) => (i === index ? next : f));

    // Screen reader announcements
    if (status === 'uploading') {
      this._announceProgress(next.file, next.name, next.progress);
    } else if (status === 'success') {
      this.announce(interpolate(t('fileUploadSuccess'), { name: next.name }));
    } else if (status === 'error' && prevStatus !== 'error') {
      this.announce(interpolate(t('fileUploadError'), { name: next.name, error: next.error || t('fileUploadUnknownError') }));
    } else if (status === 'locked' && prevStatus !== 'locked') {
      this.announce(interpolate(t('fileUploadLockedText'), { name: next.name }));
    }
  }

  /** Get an AbortController for a file to enable cancellation. */
  getAbortController(index: number): AbortController | undefined {
    const file = this._files[index];
    if (!file) return undefined;
    if (file.abortController) return file.abortController;
    // Immutable update: install a fresh controller and record it on the
    // file row. AbortController identity matters here (cancel callers must
    // get the same instance back), so we cache the new one before returning.
    const controller = new AbortController();
    this._files = this._files.map((f, i) => (i === index ? { ...f, abortController: controller } : f));
    return controller;
  }

  /**
   * Effective error message — validation error (component-owned) takes
   * precedence over consumer-set `error` prop. Used for rendering, ARIA
   * attributes, and aria-describedby plumbing so every surface stays in
   * sync.
   */
  private get _displayedError(): string {
    return this._validationError || this.error;
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
          error: this._displayedError,
        })}
        ${inner}
      </div>
    `;
  }

  /**
   * Render the visible file-picker trigger — either the inline browse pill
   * (variant=inline) or the dropzone with drag-and-drop affordances
   * (variant=default | large). Both triggers carry `data-civ-file-trigger`
   * so focus-restoration logic (e.g. after removing the last file) can
   * locate the trigger without knowing the variant.
   */
  private _renderTrigger() {
    // Combine the question (this.label) with the action ("Browse") so the
    // accessible name contains the visible "Browse" text — WCAG 2.5.3 Label
    // in Name requires voice-control users saying "Browse" to be able to
    // activate the control.
    const browseText = this.browseText || t('fileUploadBrowseText');
    const triggerAriaLabel = `${this.label}, ${browseText}`;
    const triggerAriaDescribedBy =
      [this._ariaDescribedBy, this._files.length > 0 ? this._filesListId : '']
        .filter(Boolean)
        .join(' ') || nothing;

    if (this.variant === 'inline') {
      // Compact trigger summary matches native <input type="file"> behavior:
      //   - empty           → "No file chosen"
      //   - single file     → "filename.ext"
      //   - multiple + 1    → "filename.ext"
      //   - multiple + N>1  → "N files chosen" (with the full list rendered
      //                       below so the user can remove individual files)
      // Joining all names in the trigger when multiple ran out of room and
      // duplicated content that the list already showed; the count summary
      // is the canonical way to surface "many files" inline.
      const triggerText = this._files.length === 0
        ? (this.dragText || t('fileUploadNoFileChosen'))
        : this._files.length === 1
          ? this._files[0].name
          : interpolate(t('fileUploadFilesChosen'), { count: this._files.length });
      return html`
        <button
          type="button"
          class="civ-flex civ-items-stretch civ-w-full civ-bg-transparent civ-border-0 civ-p-0 civ-cursor-pointer civ-rounded"
          @click="${this._onDropzoneClick}"
          aria-label="${triggerAriaLabel}"
          aria-required="${this.required || nothing}"
          aria-invalid="${this._displayedError ? 'true' : nothing}"
          aria-describedby="${triggerAriaDescribedBy}"
          ?disabled="${this.disabled}"
          data-civ-file-trigger
        >
          <span class="civ-input civ-input--joined-end civ-flex-1 civ-truncate civ-text-start civ-rounded-s">
            ${triggerText}
          </span>
          <span class="civ-action-btn civ-action-btn--tertiary civ-action-btn--joined-start civ-shrink-0 civ-rounded-e">${browseText}</span>
        </button>`;
    }
    return html`
      <button
        type="button"
        class="civ-dropzone ${this.variant === 'large' ? 'civ-dropzone--large' : ''}"
        @dragenter="${this._boundDragEnter}"
        @dragover="${this._boundDragOver}"
        @dragleave="${this._boundDragLeave}"
        @drop="${this._boundDrop}"
        @click="${this._onDropzoneClick}"
        aria-label="${triggerAriaLabel}"
        aria-required="${this.required || nothing}"
        aria-invalid="${this._displayedError ? 'true' : nothing}"
        ?disabled="${this.disabled}"
        aria-describedby="${triggerAriaDescribedBy}"
        data-dragging="${this._dragging ? '' : nothing}"
        data-civ-file-trigger
      >
        <span class="civ-block civ-text-body civ-mb-1">
          ${this.dragText || t('fileUploadDragText')}
        </span>
        <span class="civ-action-btn civ-action-btn--tertiary">${browseText}</span>
        ${this.accept
          ? html`<span class="civ-block civ-text-sm civ-mt-1">${this.acceptedLabel || t('fileUploadAcceptedLabel')}${formatAcceptedTypes(this.accept)}</span>`
          : nothing}
        ${this.maxSize > 0
          ? html`<span class="civ-block civ-text-sm civ-mt-0.5">${this.maxSizeLabel || t('fileUploadMaxSizeLabel')}${formatFileSize(this.maxSize)}</span>`
          : nothing}
      </button>`;
  }

  /**
   * Render the offscreen native `<input type="file">` that backs the picker.
   * Intentionally omits the `required` attribute: HTML5 form validation
   * focuses required controls when they fail, and a tabindex=-1 +
   * aria-hidden input is not focusable — Chrome logs "An invalid form
   * control is not focusable" and the focus jumps nowhere. The dropzone
   * button carries `aria-required="true"` for AT, and `<civ-form>` /
   * consumers gate submission via `getFormData()` / `validate()`.
   */
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
   *
   * Inline + single: skipped — the inline trigger already shows the file
   * name; a single-row list below would just duplicate it.
   *
   * Inline + multiple: the list renders. The trigger collapses to a
   * "{N} files chosen" summary so the two surfaces aren't redundant, and
   * the list is the only way for the user to remove individual files.
   */
  private _renderFileList() {
    if (this.variant === 'inline' && !this.multiple) return nothing;
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
            ? html`<civ-icon name="check-circle" class="civ-shrink-0 civ-text-success" aria-hidden="true"></civ-icon>`
            : file.status === 'error'
              ? html`<civ-icon name="error" class="civ-shrink-0 civ-text-error" aria-hidden="true"></civ-icon>`
              : file.status === 'locked'
                ? html`<civ-icon name="lock" class="civ-shrink-0" aria-hidden="true"></civ-icon>`
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
            <div class="civ-progress-track civ-progress-track--sm civ-mt-1">
              <div class="civ-progress-fill" style="width: ${file.progress}%" role="progressbar" aria-valuenow="${file.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${interpolate(t('fileUploadProgressAriaLabel'), { name: file.name })}"></div>
            </div>
          ` : nothing}
          ${file.status === 'error' && file.error ? html`
            <span class="civ-file-error-text civ-block civ-mt-1">${file.error}</span>
          ` : nothing}
          ${file.status === 'locked' ? html`
            <div class="civ-file-item__unlock civ-mt-2" data-file-unlock>
              <civ-text-input
                label="${interpolate(t('fileUploadPasswordLabel'), { name: file.name })}"
                type="password"
                reveal-password
                autocomplete="off"
                error="${file.error || ''}"
                ?disabled="${this.disabled}"
                data-file-unlock-input
                @civ-input="${(e: CustomEvent<{ value: string }>) => this._onPasswordInput(index, e)}"
                @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); this._onUnlock(index); } }}"
              ></civ-text-input>
              <civ-action-button
                class="civ-mt-2"
                emphasis="secondary"
                label="${t('fileUploadUnlockText')}"
                aria-label="${interpolate(t('fileUploadUnlockAriaLabel'), { name: file.name })}"
                ?disabled="${this.disabled}"
                @click="${() => this._onUnlock(index)}"
              ></civ-action-button>
            </div>
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
    if (this._displayedError) ids.push(this._errorId);
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
   * Keyed by `File` reference so two files sharing a name (e.g. two
   * `scan.pdf` uploads) get independent milestone tracking.
   */
  private _progressMilestones = new WeakMap<File, number>();

  private _announceProgress(file: File, name: string, progress: number): void {
    const milestones = [25, 50, 75, 100];
    const lastAnnounced = this._progressMilestones.get(file) ?? 0;
    // Highest milestone reached so far; jumping from 50 to 100 announces 100, not 75.
    const reached = milestones.filter((m) => m <= progress).at(-1);
    if (reached === undefined || reached <= lastAnnounced) return;
    this._progressMilestones.set(file, reached);
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
    // Each picker interaction is a fresh attempt — drop any stale
    // validation error from the user's previous (rejected) selection.
    // Consumer-set `this.error` is untouched, so server-side and
    // form-pattern errors persist as the consumer expects.
    this._validationError = '';
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
   * unobserved promise rejection. Supports async callbacks — useful when
   * the callback needs to await a child component's own updateComplete
   * before reading from its rendered DOM.
   */
  private async _afterUpdate(context: string, fn: () => void | Promise<void>): Promise<void> {
    try {
      await this.updateComplete;
      await fn();
    } catch (err) {
      console.error(`civ-file-upload: failed after update (${context})`, err);
    }
  }

  private _onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled && !this.readonly) this._dragging = true;
  }

  /**
   * Track entry depth so dragleave-on-children doesn't flicker the
   * highlight. The dropzone button has descendant spans (text + browse
   * pill); native dragleave fires whenever the cursor crosses a child
   * boundary, so we count enter/leave pairs and only flip `_dragging`
   * off when the cursor truly exits the dropzone.
   */
  private _onDragEnter(e: DragEvent): void {
    e.preventDefault();
    if (this.disabled || this.readonly) return;
    this._dragDepth += 1;
    this._dragging = true;
  }

  private _onDragLeave(e?: DragEvent): void {
    if (this.disabled || this.readonly) return;
    this._dragDepth = Math.max(0, this._dragDepth - 1);
    if (this._dragDepth === 0) this._dragging = false;
    // Defensive: cursor leaving the document entirely surfaces as
    // `relatedTarget === null`. Force-reset so a missed dragenter
    // doesn't leave the highlight stuck.
    if (e && e.relatedTarget === null) {
      this._dragDepth = 0;
      this._dragging = false;
    }
  }

  private _onDrop(e: DragEvent): void {
    e.preventDefault();
    this._dragDepth = 0;
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
    this._files = this._files.map((f, i) => (i === index ? {
      ...f,
      status: 'error' as FileStatus,
      error: t('fileUploadCancelled'),
      progress: 0,
    } : f));
    dispatch(this, 'civ-upload-cancel', { index, name: file.name });
    this.announce(interpolate(t('fileUploadCancelledAnnounce'), { name: file.name }));
  }

  private _retryUpload(index: number): void {
    const file = this._files[index];
    if (!file) return;
    this._progressMilestones.delete(file.file);
    this._files = this._files.map((f, i) => (i === index ? {
      ...f,
      status: 'pending' as FileStatus,
      error: undefined,
      progress: 0,
      abortController: undefined,
    } : f));
    this.announce(interpolate(t('fileUploadRetryAnnounce'), { name: file.name }));
    dispatch(this, 'civ-upload-retry', { index, name: file.name, file: file.file });
  }

  private _onPasswordInput(index: number, event: CustomEvent<{ value: string }>): void {
    const file = this._files[index];
    if (!file) return;
    this._passwordEntries.set(file.file, event.detail.value ?? '');
  }

  private _onUnlock(index: number): void {
    const file = this._files[index];
    if (!file) return;
    const password = this._passwordEntries.get(file.file) ?? '';
    if (!password) {
      // Empty submit (button click or Enter on a blank field): announce
      // and refocus the password input. The previous silent no-op left
      // AT users with no feedback that anything happened.
      this.announce(interpolate(t('fileUploadPasswordEmpty'), { name: file.name }));
      const passwordInput = this.querySelectorAll<HTMLElement>('[data-file-unlock-input]')[index];
      passwordInput?.focus();
      return;
    }
    // Clear the buffer immediately — consumers receive the password via the
    // event payload; we don't keep it in memory beyond the dispatch.
    this._passwordEntries.delete(file.file);
    this._files = this._files.map((f, i) => (i === index ? {
      ...f,
      status: 'uploading' as FileStatus,
      error: undefined,
      progress: 0,
    } : f));
    this.announce(interpolate(t('fileUploadUnlockAnnounce'), { name: file.name }));
    dispatch(this, 'civ-file-unlock', { index, name: file.name, file: file.file, password });
    // The password input + Unlock button just unmounted (status moved off
    // 'locked'); focus would otherwise fall to document.body. Move it
    // onto the row's Cancel button (or remove button as fallback) so
    // keyboard users stay in context.
    void this._afterUpdate('restore focus after unlock', async () => {
      const actions = this.querySelectorAll<HTMLElement>('.civ-file-item__actions');
      const cluster = actions[index];
      if (!cluster) return;
      // civ-action-button has its own render cycle; await it so its inner
      // <button> exists before we try to focus. Without this, jsdom finds
      // no focusable child and focus is lost to document.body.
      const child = cluster.querySelector('civ-action-button') as HTMLElement & { updateComplete?: Promise<unknown> };
      if (child?.updateComplete) await child.updateComplete;
      // civ-action-button doesn't override focus(); reach the inner native
      // <button> directly so jsdom + real browsers both move focus.
      const focusable = cluster.querySelector<HTMLElement>('button');
      focusable?.focus();
    });
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
      this._validationError = errors.join('. ');
      // The rendered error element carries role="alert", so the change
      // is announced assertively by AT — no manual announce() needed.
    }

    if (validated.length === 0) return;

    // Clear validation error only if no validation errors occurred
    if (errors.length === 0) this._validationError = '';

    let addedCount: number;
    if (this.multiple) {
      this._files = [...this._files, ...validated];
      addedCount = validated.length;
    } else {
      // Single-file mode: the incoming file replaces the current selection.
      // Release the previous file's resources before swap — otherwise the
      // ObjectURL handle leaks for the lifetime of the component and an
      // in-flight upload of the replaced file keeps consuming network /
      // server resources for a file the user can no longer see.
      for (const old of this._files) {
        this._revokePreviewUrl(old.file);
        old.abortController?.abort();
        this._progressMilestones.delete(old.file);
        this._passwordEntries.delete(old.file);
      }
      this._files = validated.slice(0, 1);
      addedCount = this._files.length;
    }

    this._updateFormData();
    this._dispatchChange();
    this.sendAnalytics('upload', { fileCount: this._files.length });
    this.announce(interpolate(this.fileAddedMessage || t('fileUploadFileAddedMessage'), { count: addedCount, total: this._files.length }));
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
    // Clear any buffered unlock password so it doesn't linger in memory
    // after the user removes a file mid-unlock.
    this._passwordEntries.delete(removed.file);
    // Abort any in-progress upload
    if (removed.abortController) {
      removed.abortController.abort();
    }
    if (removed.isInitial && removed.id) {
      this._removedInitialIds.add(removed.id);
    }
    this._files = this._files.filter((_, i) => i !== index);
    // Removing the last file clears any pending validation error from
    // the previous add attempt. Consumer-set `this.error` is left
    // untouched — they own it.
    if (this._files.length === 0) this._validationError = '';
    if (this._files.length <= CivFileUpload._FILE_LIST_LIMIT) {
      this._showAllFiles = false;
    }
    this._progressMilestones.delete(removed.file);
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

    // Move focus to the next remove button, or the trigger if no files
    // remain. Use `[data-civ-file-trigger]` so the fallback works for every
    // variant — `.civ-dropzone` only exists on default/large, leaving focus
    // lost on the inline variant when the last file is removed.
    void this._afterUpdate('restore focus after file removal', () => {
      const buttons = this.querySelectorAll<HTMLButtonElement>('[data-file-remove]');
      if (buttons.length > 0) {
        const next = buttons[Math.min(index, buttons.length - 1)];
        next.focus();
      } else {
        const trigger = this.querySelector<HTMLElement>('[data-civ-file-trigger]');
        trigger?.focus();
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
    this._validationError = '';
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
