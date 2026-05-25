import type { ComponentSchema } from '../schema.types.js';

const schema: ComponentSchema = {
  $schema: '1.0',
  name: 'civ-file-upload',
  description: 'Accessible file upload with drag-and-drop, file type/size validation, and file list management. Submits as FormData with File objects.',
  category: 'form-control',
  extends: 'CivFormElement',
  isGroup: false,

  props: {
    accept: {
      type: 'string',
      description: 'Accepted file types. Web: comma-separated MIME types / extensions (`image/*,application/pdf`) for the HTML `accept` attribute. Native: a typed array of platform-idiomatic types (`[UTType]` on iOS, `List<String>` of MIME types on Android). Conceptually the same constraint, different wire format per platform',
      default: '',
      webOnly: true,
    },
    multiple: {
      type: 'boolean',
      description: 'Whether multiple files can be selected',
      default: false,
    },
    showPreview: {
      type: 'boolean',
      description: 'When true, image files render as thumbnails in the file list',
      default: false,
      attribute: 'show-preview',
    },
    capture: {
      type: 'enum',
      description: 'On mobile, hint which camera to open. Empty string keeps the standard file picker',
      default: '',
      values: ['', 'user', 'environment'],
    },
    variant: {
      type: 'enum',
      description: 'Visual **layout** of the file picker (not density — there is no density knob on file-upload today). `default` = standard medium dropzone with drag-and-drop. `inline` = pseudo-input + browse-button row, matching the layout of native `<input type="file">` for placement in dense forms (no drag-and-drop). `large` = taller drag target for landing pages or document-heavy workflows where upload is the primary page action. Previously named values `compact` and `full` were renamed to `inline` and `large` to disambiguate from the system-wide `spacing="sm"` density convention used by every other CivUI component',
      default: 'default',
      values: ['default', 'inline', 'large'],
    },
    initialFiles: {
      type: 'array',
      description: 'Server-resident files hydrated on mount (e.g. draft restore). Each item: {id, name, size, url?, type?}',
      items: {
        id: { type: 'string', description: 'Stable identifier for the server file', required: true },
        name: { type: 'string', description: 'Display file name', required: true },
        size: { type: 'number', description: 'File size in bytes', required: true },
        url: { type: 'string', description: 'Optional download/preview URL' },
        type: { type: 'string', description: 'Optional MIME type' },
      },
    },
    maxSize: {
      type: 'number',
      description: 'Maximum file size in bytes (0 = no limit)',
      default: 0,
      attribute: 'max-size',
    },
    maxFiles: {
      type: 'number',
      description: 'Maximum number of files (0 = no limit)',
      default: 0,
      attribute: 'max-files',
    },
    dragText: {
      type: 'string',
      description: 'Text shown in the dropzone',
      default: 'Drag files here or',
      attribute: 'drag-text',
    },
    browseText: {
      type: 'string',
      description: 'Text for the browse link in the dropzone',
      default: 'choose from folder',
      attribute: 'browse-text',
    },
    acceptedLabel: {
      type: 'string',
      description: 'Label prefix for accepted types display',
      default: 'Accepted: ',
      attribute: 'accepted-label',
    },
    maxSizeLabel: {
      type: 'string',
      description: 'Label prefix for max size display',
      default: 'Max size: ',
      attribute: 'max-size-label',
    },
    removeAriaLabel: {
      type: 'string',
      description: 'Aria label template for remove button ({name} interpolated)',
      default: 'Remove {name}',
      attribute: 'remove-aria-label',
    },
    filesListLabel: {
      type: 'string',
      description: 'Aria label for the file list region',
      default: 'Selected files',
      attribute: 'files-list-label',
    },
    fileAddedMessage: {
      type: 'string',
      description: 'Screen reader announcement when files are added ({count}, {total} interpolated)',
      default: '{count} file(s) added. {total} file(s) selected.',
      attribute: 'file-added-message',
    },
    fileRemovedMessage: {
      type: 'string',
      description: 'Screen reader announcement when a file is removed ({total} interpolated)',
      default: 'File removed. {total} file(s) selected.',
      attribute: 'file-removed-message',
    },
    fileSizeError: {
      type: 'string',
      description: 'Error template for oversized files ({name}, {size} interpolated)',
      default: '{name} exceeds maximum size of {size}',
      attribute: 'file-size-error',
    },
    fileTypeError: {
      type: 'string',
      description: 'Error template for invalid file types ({name} interpolated)',
      default: '{name} is not an accepted file type',
      attribute: 'file-type-error',
    },
    maxFilesError: {
      type: 'string',
      description: 'Error template when file limit is exceeded ({max} interpolated)',
      default: 'Maximum of {max} files allowed',
      attribute: 'max-files-error',
    },
  },

  methods: {
    setFileStatus: {
      description: 'Update a file\'s upload status from the consumer\'s upload pipeline. Drives the per-file UI state machine: `pending` (initial), `uploading` (spinner + progress bar + Cancel), `success` (check icon), `error` (error icon + Retry button + per-file error text from opts.error), `locked` (lock icon + inline password input + Unlock button — fires `civ-file-unlock` on submit). The transition clears `file.error` unless `opts.error` is provided, so transitions from error to a new state don\'t carry stale messages. Out-of-range index is a no-op',
      params: [
        { name: 'index', type: 'number', description: 'Zero-based index in the file list' },
        { name: 'status', type: 'string', description: 'One of: `pending` | `uploading` | `success` | `error` | `locked`' },
        { name: 'opts', type: 'object', description: 'Optional: `{ progress?: number, error?: string }`. `progress` is 0–100 for the progress bar (uploading only). `error` is per-file error text (typically used with `error` / `locked` states)', optional: true },
      ],
      returns: 'void',
    },
    getAbortController: {
      description: 'Lazily create and return an `AbortController` scoped to this file index, for the consumer to wire into their fetch call. Returning the same controller on repeat calls lets you signal cancellation from anywhere. Calling `cancel` from the Cancel button aborts the same controller; this is the integration seam. Returns `undefined` for an out-of-range index',
      params: [
        { name: 'index', type: 'number', description: 'Zero-based index in the file list' },
      ],
      returns: 'object',
    },
    removeFile: {
      description: 'Remove a file from the list by index. Fires the cancelable `civ-file-upload-before-remove` event first; if the consumer wires confirmation via that hook, they call `preventDefault()` and then re-invoke this with `{ skipConfirm: true }` from their confirm handler',
      params: [
        { name: 'index', type: 'number', description: 'Zero-based index in the file list' },
        { name: 'opts', type: 'object', description: 'Optional: `{ skipConfirm?: boolean }` bypasses the cancelable hook when the consumer already gathered user intent', optional: true },
      ],
      returns: 'void',
    },
  },

  events: {
    'civ-input': {
      description: 'Fires when files are added or removed',
      detail: {
        files: { type: 'File[]', description: 'Current array of selected files' },
      },
    },
    'civ-change': {
      description: 'Fires when files are added or removed (same timing as civ-input)',
      detail: {
        files: { type: 'File[]', description: 'Current array of selected files' },
      },
    },
    'civ-upload-cancel': {
      description: 'Fires when the user cancels an in-progress upload',
      detail: {
        index: { type: 'number', description: 'Index of the cancelled file in the list' },
        name: { type: 'string', description: 'Cancelled file name' },
      },
    },
    'civ-upload-retry': {
      description: 'Fires when the user retries a failed upload',
      detail: {
        index: { type: 'number', description: 'Index of the retried file' },
        name: { type: 'string', description: 'Retried file name' },
        file: { type: 'File', description: 'The File object being retried' },
      },
    },
    'civ-file-unlock': {
      description: 'Fires when the user submits a password for a password-protected file (e.g. encrypted PDF or ZIP). Triggered when the consumer marks a file as `locked` via `setFileStatus(index, "locked")` and the user enters a password and clicks Unlock. The file status moves to `uploading` immediately; the consumer\'s upload pipeline owns decryption (server-side via qpdf/pdftk, or client-side via pdf.js). Call `setFileStatus(index, "locked", { error: "Incorrect password" })` to re-prompt with the error visible.',
      detail: {
        index: { type: 'number', description: 'Index of the locked file' },
        name: { type: 'string', description: 'Locked file name' },
        file: { type: 'File', description: 'The File object being unlocked' },
        password: { type: 'string', description: 'The password the user entered. Treat as sensitive — log redaction, secure transport, do not persist beyond the decryption attempt. The component clears its internal buffer immediately after dispatch.' },
      },
    },
    'civ-file-upload-before-remove': {
      description: 'Cancelable. Fires before a file is removed. `preventDefault()` aborts. Listen here to insert a confirmation step (typically a `civ-modal`), then re-call `removeFile(index, { skipConfirm: true })` from the confirm handler. Detail matches `civ-file-removed` so the listener has everything it needs to build the modal copy',
      detail: {
        index: { type: 'number', description: 'Index of the file being removed' },
        name: { type: 'string', description: 'File name' },
        isInitial: { type: 'boolean', description: 'True if the file was hydrated from initialFiles (server-resident)' },
        id: { type: 'string', description: 'Stable identifier from initialFiles, when present' },
      },
    },
    'civ-file-removed': {
      description: 'Fires when a file is removed from the list (after upload completes or user-initiated)',
      detail: {
        index: { type: 'number', description: 'Index of the removed file' },
        name: { type: 'string', description: 'Removed file name' },
        isInitial: { type: 'boolean', description: 'True if the removed file was hydrated from initialFiles (server-resident)' },
        id: { type: 'string', description: 'Stable identifier from initialFiles, when present' },
      },
    },
  },

  a11y: {
    role: 'button',
    requiredIndicator: 'asterisk',
    errorAnnouncement: 'assertive',
    describedBy: ['hint', 'error'],
  },

  renderOrder: [
    {
      type: 'label',
      bindings: { text: 'label', required: 'required' },
    },
    {
      type: 'hint',
      condition: 'hint',
      bindings: { text: 'hint' },
    },
    {
      type: 'error',
      condition: 'error',
      bindings: { text: 'error' },
    },
    {
      type: 'slot',
    },
  ],

  form: {
    valueMode: 'file',
    formAssociated: true,
    resetBehavior: 'clear-files',
  },
};

export default schema;
