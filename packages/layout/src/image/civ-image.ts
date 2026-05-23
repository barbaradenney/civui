import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn } from '@civui/core';

export type ImageRatio = '1:1' | '4:3' | '16:9' | '21:9' | '3:2' | 'auto';
export type ImageFit = 'cover' | 'contain';
export type ImageLoading = 'lazy' | 'eager';
export type ImageVariant = 'content' | 'thumbnail';
export type ThumbnailSize = '32' | '48' | '64' | '96' | '128';

/**
 * CivUI Image
 *
 * General-purpose accessible image. Distinct from `civ-image-preview`,
 * which is upload chrome (filename + filesize caption) for ID
 * documents and photos. Use `civ-image` for content imagery —
 * marketing visuals, illustrations, profile photos, thumbnail
 * avatars, anything that isn't a file-upload preview.
 *
 * **Defaults that bake in good behavior:**
 * - `loading="lazy"` — defers off-screen images.
 * - `decoding="async"` — never blocks render.
 * - `object-fit: cover` — the image fills its box without stretching.
 * - CSS `aspect-ratio` from `ratio` (or `width`/`height`) reserves
 *   layout space before the bytes arrive, preventing layout shift
 *   (CLS) — the gov-accessibility win you don't get from a raw
 *   `<img>` without dimensions.
 *
 * **Required alt.** WCAG 1.1.1 / Section 508 §1194.22(a). The
 * component dev-warns when `alt` is `undefined`. Pass `alt=""`
 * (empty string) for purely decorative images — that's the WAI-
 * documented opt-out, never omit the attribute. Filenames are
 * never used as alt fallback; .gov uploads often have opaque
 * names that read worse than nothing.
 *
 * **Variants:**
 * - `content` (default) — fluid full-width image, ratio-reserved.
 * - `thumbnail` — fixed pixel size on a Primer-style stepped
 *   scale (32 / 48 / 64 / 96 / 128 px). Use for avatars and
 *   inline thumbnails. `rounded` makes it circular.
 *
 * @element civ-image
 *
 * @prop {string} src - Image URL. Required.
 * @prop {string} alt - Alt text. Required. Pass `""` for decorative — never omit.
 * @prop {number} width - Intrinsic width in px. Used with `height` to compute aspect-ratio when `ratio` is `auto`.
 * @prop {number} height - Intrinsic height in px.
 * @prop {ImageRatio} ratio - Aspect ratio. Defaults to `auto` (uses `width`/`height` if both set).
 * @prop {ImageFit} fit - Object-fit. `cover` (default) fills the box; `contain` fits without cropping.
 * @prop {ImageLoading} loading - HTML lazy-loading attribute. `lazy` (default) defers off-screen images.
 * @prop {ImageVariant} variant - `content` (default, fluid) or `thumbnail` (fixed-size).
 * @prop {ThumbnailSize} size - Thumbnail edge length in px (32/48/64/96/128). Default `64`.
 * @prop {boolean} rounded - Render the thumbnail as a circle. Ignored for content variant.
 *
 * @example
 * ```html
 * <!-- Content image with explicit aspect ratio -->
 * <civ-image src="/hero.jpg" alt="A veteran salutes the flag" ratio="16:9"></civ-image>
 *
 * <!-- Avatar thumbnail -->
 * <civ-image src="/avatar.jpg" alt="John Smith" variant="thumbnail" size="48" rounded></civ-image>
 *
 * <!-- Decorative image (no announcement) -->
 * <civ-image src="/divider-flourish.svg" alt="" ratio="21:9"></civ-image>
 * ```
 */
@customElement('civ-image')
export class CivImage extends CivBaseElement {
  @property({ type: String }) src = '';

  /**
   * Alt text. Use empty string (`alt=""`) for decorative images. The
   * component intentionally has no default — omitting the attribute
   * fires a dev warning because Section 508 requires every `<img>`
   * to carry alt.
   */
  @property({ type: String }) alt: string | undefined = undefined;

  @property({ type: Number }) width: number | undefined = undefined;

  @property({ type: Number }) height: number | undefined = undefined;

  @property({ type: String, reflect: true }) ratio: ImageRatio = 'auto';

  @property({ type: String, reflect: true }) fit: ImageFit = 'cover';

  @property({ type: String }) loading: ImageLoading = 'lazy';

  @property({ type: String, reflect: true }) variant: ImageVariant = 'content';

  @property({ type: String, reflect: true }) size: ThumbnailSize = '64';

  @property({ type: Boolean, reflect: true }) rounded = false;

  private _warnedMissingAlt = false;
  private _warnedMissingDimensions = false;

  /**
   * CSS aspect-ratio value. Explicit `ratio` wins; otherwise compute
   * from intrinsic `width`/`height`; otherwise leave unset (the
   * browser uses the image's natural ratio once loaded, which costs
   * a CLS but is the only honest answer with no information).
   */
  private get _aspectRatioStyle(): string {
    if (this.ratio !== 'auto') return `aspect-ratio: ${this.ratio.replace(':', ' / ')};`;
    if (this.width && this.height) return `aspect-ratio: ${this.width} / ${this.height};`;
    return '';
  }

  override render() {
    // Dev nudges — fire once per instance.
    if (this.alt === undefined && !this._warnedMissingAlt) {
      devWarn(
        'civ-image',
        'no `alt` attribute set. Every image needs alt for Section 508 / WCAG 1.1.1. Pass `alt=""` (empty string) explicitly for purely decorative images — do not omit the attribute.',
      );
      this._warnedMissingAlt = true;
    }
    if (
      this.variant === 'content' &&
      this.ratio === 'auto' &&
      (!this.width || !this.height) &&
      !this._warnedMissingDimensions
    ) {
      devWarn(
        'civ-image',
        'no `ratio`, `width`, or `height` set. The box won\'t reserve layout space before the image loads (CLS risk). Set `ratio="16:9"` or pass intrinsic `width`/`height` in px.',
      );
      this._warnedMissingDimensions = true;
    }

    const altText = this.alt ?? '';

    if (this.variant === 'thumbnail') {
      // Thumbnail size + rounded handled via host attributes (CSS).
      return html`
        <img
          class="civ-image__img"
          src="${this.src}"
          alt="${altText}"
          loading="${this.loading}"
          decoding="async"
          width="${this.width ?? nothing}"
          height="${this.height ?? nothing}"
        />
      `;
    }

    // Content variant uses inline style for dynamic aspect-ratio
    // because the computed value depends on three props in
    // combination and inline avoids hand-shipping a class per ratio.
    const style = this._aspectRatioStyle;
    return html`
      <div class="civ-image__box" style="${style || nothing}">
        <img
          class="civ-image__img"
          src="${this.src}"
          alt="${altText}"
          loading="${this.loading}"
          decoding="async"
          width="${this.width ?? nothing}"
          height="${this.height ?? nothing}"
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-image': CivImage;
  }
}
