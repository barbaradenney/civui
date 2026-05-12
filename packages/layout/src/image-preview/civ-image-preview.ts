import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn } from '@civui/core';

export type ImagePreviewSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * CivUI Image Preview
 *
 * Displays an uploaded or referenced image at a readable size with
 * optional filename and file size caption. Use for ID document uploads,
 * profile photos, damage photos, signature captures, and review pages.
 *
 * @element civ-image-preview
 *
 * @prop {string} src - Image source URL or object URL.
 * @prop {string} alt - Alt text for the image (required for accessibility).
 * @prop {string} filename - Optional filename displayed below the image.
 * @prop {string} fileSize - Optional file size displayed after filename.
 * @prop {ImagePreviewSize} size - Preview size: sm (120px), md (240px), lg (360px), full (100%).
 *
 * @example
 * ```html
 * <civ-image-preview
 *   src="/uploads/id-front.jpg"
 *   alt="Front of driver's license"
 *   filename="id-front.jpg"
 *   file-size="2.4 MB"
 * ></civ-image-preview>
 * ```
 */
@customElement('civ-image-preview')
export class CivImagePreview extends CivBaseElement {
  /** Image source URL or object URL. */
  @property({ type: String }) src = '';

  /** Alt text for the image. Required for accessibility. */
  @property({ type: String }) alt = '';

  /** Filename displayed below the image. */
  @property({ type: String }) filename = '';

  /** File size displayed after filename (e.g., "2.4 MB"). */
  @property({ type: String, attribute: 'file-size' }) fileSize = '';

  /** Preview size. */
  @property({ type: String }) size: ImagePreviewSize = 'md';

  /** Tracks whether the missing-alt dev warning has fired for this instance. */
  private _warnedMissingAlt = false;

  private get _maxWidth(): string {
    switch (this.size) {
      case 'sm': return '120px';
      case 'md': return '240px';
      case 'lg': return '360px';
      case 'full': return '100%';
      default: return '240px';
    }
  }

  override render() {
    if (!this.src) return nothing;
    // Dev-only nudge: warn once per instance when alt is missing.
    // `devWarn` handles the CIV_DEV gate; the instance flag stays so the
    // warning doesn't fire on every render of the same element. Helper's
    // built-in `dedupeKey` would collapse across instances, which would
    // hide a legitimate second consumer making the same mistake.
    if (!this.alt && !this._warnedMissingAlt) {
      devWarn(
        'civ-image-preview',
        'is missing an alt attribute. Images without alt text are inaccessible (WCAG 1.1.1). If the image is purely decorative, set alt="" explicitly.',
      );
      this._warnedMissingAlt = true;
    }

    return html`
      <figure class="civ-m-0 civ-p-0" style="max-width: ${this._maxWidth};">
        <img
          src="${this.src}"
          alt="${this.alt}"
          class="civ-block civ-w-full civ-rounded civ-border civ-border-base-lighter"
          loading="lazy"
        />
        ${this.filename || this.fileSize ? html`
          <figcaption class="civ-mt-1 civ-text-sm">
            ${this.filename ? html`<span class="civ-font-bold">${this.filename}</span>` : nothing}
            ${this.fileSize ? html`<span class="civ-ms-1">(${this.fileSize})</span>` : nothing}
          </figcaption>
        ` : nothing}
      </figure>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-image-preview': CivImagePreview;
  }
}
