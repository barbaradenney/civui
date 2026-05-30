import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn } from '@civui/core';
// Compose the sibling civ-image primitive so consumers get the same
// accessibility + performance defaults (loading=lazy, decoding=async,
// CSS aspect-ratio reservation, optional WebP/AVIF format negotiation)
// without civ-image-preview having to re-implement them.
import '../image/civ-image.js';
import type { ImageRatio } from '../image/civ-image.js';

export type ImagePreviewSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * CivUI Image Preview
 *
 * Displays an uploaded or referenced image at a readable size with
 * optional filename and file size caption. Use for ID document uploads,
 * profile photos, damage photos, signature captures, and review pages.
 *
 * **Composition.** Internally renders a `<civ-image>` for the actual
 * image element, inheriting its accessibility + performance defaults
 * (lazy load, async decode, aspect-ratio reservation when dimensions
 * are provided, optional WebP/AVIF format negotiation via the
 * `webpSrc` / `avifSrc` props). This component owns the upload-preview
 * chrome — the `<figure>` wrapper, sizing tier, filename + filesize
 * caption — and delegates everything else to its sibling.
 *
 * @element civ-image-preview
 *
 * @prop {string} src - Image source URL or object URL.
 * @prop {string} webpSrc - Optional WebP alternate (forwarded to civ-image).
 * @prop {string} avifSrc - Optional AVIF alternate (forwarded to civ-image).
 * @prop {string} alt - Alt text for the image (required for accessibility).
 * @prop {string} filename - Optional filename displayed below the image.
 * @prop {string} fileSize - Optional file size displayed after filename.
 * @prop {ImagePreviewSize} size - Preview size: sm (120px), md (240px), lg (360px), full (100%).
 * @prop {number} width - Intrinsic width in px (forwarded to civ-image for CLS prevention).
 * @prop {number} height - Intrinsic height in px (forwarded to civ-image for CLS prevention).
 * @prop {ImageRatio} ratio - Aspect ratio (forwarded to civ-image; defaults to `auto`).
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

  /** Optional WebP alternate, forwarded to the inner civ-image. */
  @property({ type: String, attribute: 'webp-src' }) webpSrc = '';

  /** Optional AVIF alternate, forwarded to the inner civ-image. */
  @property({ type: String, attribute: 'avif-src' }) avifSrc = '';

  /** Alt text for the image. Required for accessibility. */
  @property({ type: String }) alt = '';

  /** Filename displayed below the image. */
  @property({ type: String }) filename = '';

  /** File size displayed after filename (e.g., "2.4 MB"). */
  @property({ type: String, attribute: 'file-size' }) fileSize = '';

  /** Preview size. */
  @property({ type: String }) size: ImagePreviewSize = 'md';

  /**
   * Intrinsic width in px. Forwarded to civ-image; when paired with
   * `height` (or `ratio`), reserves layout space before the image
   * loads so the figcaption doesn't jump (CLS prevention).
   */
  @property({ type: Number }) width: number | undefined = undefined;

  @property({ type: Number }) height: number | undefined = undefined;

  /** Aspect ratio (forwarded to civ-image). */
  @property({ type: String }) ratio: ImageRatio = 'auto';

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
    // image-preview is an upload-preview context where a decorative
    // ID document doesn't make sense, so we keep the stricter
    // `!this.alt` check here instead of delegating to civ-image's
    // looser `== null` rule (which permits decorative `alt=""`).
    if (!this.alt && !this._warnedMissingAlt) {
      devWarn(
        'civ-image-preview',
        'is missing an alt attribute. Images without alt text are inaccessible (WCAG 1.1.1). For an upload preview, the alt should describe what the image contains (e.g. "Front of driver\'s license").',
      );
      this._warnedMissingAlt = true;
    }

    return html`
      <figure class="civ-m-0 civ-p-0" style="max-width: ${this._maxWidth};">
        <civ-image
          class="civ-block civ-border civ-border-base-lighter civ-overflow-hidden"
          src="${this.src}"
          webp-src="${this.webpSrc || nothing}"
          avif-src="${this.avifSrc || nothing}"
          alt="${this.alt}"
          width="${this.width ?? nothing}"
          height="${this.height ?? nothing}"
          ratio="${this.ratio}"
        ></civ-image>
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
