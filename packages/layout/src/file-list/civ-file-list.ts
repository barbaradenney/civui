import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/** Protocols that are never allowed in file link href values. */
const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

export interface FileListItem {
  /** File name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** Optional download/preview URL. When set, name renders as a link. */
  url?: string;
  /** Optional MIME type for icon heuristic. */
  type?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * CivUI File List
 *
 * Read-only display of uploaded files. Use on review pages, confirmation
 * pages, and summary sections where the user can see what was uploaded
 * but cannot modify the list.
 *
 * For interactive file upload (add/remove/cancel/retry), use
 * `<civ-file-upload>` instead.
 *
 * @element civ-file-list
 *
 * @prop {FileListItem[]} files - Array of files to display.
 * @prop {string} label - Accessible label for the list.
 * @example
 * ```html
 * <civ-file-list label="Uploaded documents"></civ-file-list>
 * ```
 * ```js
 * el.files = [
 *   { name: 'DD214.pdf', size: 2400000, url: '/files/dd214.pdf' },
 *   { name: 'medical-records.pdf', size: 8100000 },
 * ];
 * ```
 */
@customElement('civ-file-list')
export class CivFileList extends CivBaseElement {
  /** Files to display. Set via JS property. */
  @property({ type: Array, attribute: false }) files: FileListItem[] = [];

  /** Accessible label for the file list. */
  @property({ type: String }) label = '';

  override render() {
    if (this.files.length === 0) return nothing;

    return html`
      <ul
        class="civ-list-none civ-p-0 civ-m-0"
        role="list"
        aria-label="${this.label || nothing}"
      >
        ${this.files.map(file => html`
          <li class="civ-file-item">
            <civ-icon name="download" class="civ-shrink-0"></civ-icon>
            <span class="civ-flex-1 civ-min-w-0">
              <span class="civ-block">
                ${file.url && !UNSAFE_HREF_PATTERN.test(file.url)
                  ? html`<a class="civ-font-bold" href="${file.url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
                  : html`<span class="civ-font-bold">${file.name}</span>`}
                <span class="civ-text-sm civ-ms-2">(${formatFileSize(file.size)})</span>
              </span>
            </span>
          </li>
        `)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-file-list': CivFileList;
  }
}
