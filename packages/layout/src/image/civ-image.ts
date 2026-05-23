import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn, warnInvalidProp } from '@civui/core';

export type ImageRatio = '1:1' | '4:3' | '16:9' | '21:9' | '3:2' | 'auto';
export type ImageFit = 'cover' | 'contain';
export type ImageLoading = 'lazy' | 'eager';
export type ImageDecoding = 'async' | 'sync' | 'auto';
export type ImageFetchPriority = 'auto' | 'high' | 'low';
export type ImageCrossOrigin = '' | 'anonymous' | 'use-credentials';
export type ImageVariant = 'content' | 'thumbnail';
export type ThumbnailSize = '32' | '48' | '64' | '96' | '128';

const VALID_THUMB_SIZES: readonly ThumbnailSize[] = ['32', '48', '64', '96', '128'] as const;

/** Attributes the host accepts as a courtesy from consumers used to `<img>`. */
const DROPPED_IMG_ATTRS = ['srcset', 'sizes', 'usemap', 'ismap'] as const;

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
 * component dev-warns when `alt` is `undefined` or `null`. Pass
 * `alt=""` (empty string) for purely decorative images — that's
 * the WAI-documented opt-out. When `alt` is undefined the
 * component renders NO `alt` attribute (rather than the misleading
 * `alt=""`), so the bug is visible to QA — screen readers fall
 * back to filename, which is ugly but at least audible.
 *
 * **Variants:**
 * - `content` (default) — fluid full-width image, ratio-reserved.
 * - `thumbnail` — fixed pixel size on a Primer-style stepped
 *   scale (32 / 48 / 64 / 96 / 128 px). Use for avatars and
 *   inline thumbnails. `rounded` makes it circular.
 *
 * **Dropped attributes.** `srcset`, `sizes`, `usemap`, `ismap` are
 * not forwarded — `<picture>` art direction is deliberately out of
 * v1 scope. Consumers attaching these to the host get a dev-warn.
 * For optimization-critical attributes that ARE forwarded, use the
 * `fetchpriority`, `crossorigin`, and `decoding` props.
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
 * @prop {ImageDecoding} decoding - Native `decoding` hint. `async` (default) never blocks render; `sync` blocks paint (use for above-the-fold LCP images).
 * @prop {ImageFetchPriority} fetchPriority - Resource priority hint. `high` for LCP images, `low` for below-the-fold.
 * @prop {ImageCrossOrigin} crossOrigin - CORS mode (`''` / `'anonymous'` / `'use-credentials'`).
 * @prop {string} referrerPolicy - HTML `referrerpolicy` attribute, passed through verbatim.
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
 *
 * <!-- Above-the-fold hero with priority hint -->
 * <civ-image src="/hero.jpg" alt="..." ratio="16:9" loading="eager" decoding="sync" fetch-priority="high"></civ-image>
 * ```
 */
@customElement('civ-image')
export class CivImage extends CivBaseElement {
  @property({ type: String }) src = '';

  /**
   * Alt text. Use empty string (`alt=""`) for decorative images.
   * No default — when undefined, the component renders NO `alt`
   * attribute so the omission is visible at runtime (browsers
   * fall back to filename), AND fires a dev warning.
   */
  @property({ type: String }) alt: string | undefined = undefined;

  @property({ type: Number }) width: number | undefined = undefined;

  @property({ type: Number }) height: number | undefined = undefined;

  @property({ type: String, reflect: true }) ratio: ImageRatio = 'auto';

  @property({ type: String, reflect: true }) fit: ImageFit = 'cover';

  @property({ type: String }) loading: ImageLoading = 'lazy';

  @property({ type: String }) decoding: ImageDecoding = 'async';

  @property({ type: String, attribute: 'fetch-priority' }) fetchPriority: ImageFetchPriority = 'auto';

  @property({ type: String, attribute: 'crossorigin' }) crossOrigin: ImageCrossOrigin = '';

  @property({ type: String, attribute: 'referrerpolicy' }) referrerPolicy = '';

  @property({ type: String, reflect: true }) variant: ImageVariant = 'content';

  @property({ type: String, reflect: true }) size: ThumbnailSize = '64';

  @property({ type: Boolean, reflect: true }) rounded = false;

  private _warnedMissingAlt = false;
  private _warnedMissingDimensions = false;
  private _warnedInvalidSize = false;
  private _warnedDroppedAttrs = false;
  private _warnedRoundedOnContent = false;

  /**
   * Inline aspect-ratio CSS value. Explicit `ratio` wins; otherwise
   * derive from intrinsic `width`/`height`; otherwise return empty
   * (the img falls back to `height: auto` so it renders at the
   * natural ratio once loaded — visible, but CLS-prone).
   */
  private get _aspectRatioStyle(): string {
    if (this.ratio !== 'auto') return `aspect-ratio: ${this.ratio.split(':').join(' / ')};`;
    if (
      Number.isFinite(this.width) && this.width! > 0 &&
      Number.isFinite(this.height) && this.height! > 0
    ) {
      return `aspect-ratio: ${this.width} / ${this.height};`;
    }
    return '';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Sniff `<img>` attributes the consumer probably expected to be
    // forwarded. We don't silently absorb them — fire a one-shot
    // dev-warn pointing at the supported alternatives.
    if (!this._warnedDroppedAttrs) {
      const dropped = DROPPED_IMG_ATTRS.filter((a) => this.hasAttribute(a));
      if (dropped.length > 0) {
        devWarn(
          'civ-image',
          `\`${dropped.join('`, `')}\` ${dropped.length === 1 ? 'is' : 'are'} not forwarded to the underlying <img>. \`<picture>\` art direction is deliberately out of v1 scope. For LCP optimization, use the \`fetch-priority\`, \`decoding\`, and \`loading\` props.`,
        );
        this._warnedDroppedAttrs = true;
      }
    }
  }

  override render() {
    // ── Dev nudges — fire once per instance ────────────────────────
    // `== null` catches both undefined (initial omission) and null
    // (set via removeAttribute('alt') after the fact).
    if (this.alt == null && !this._warnedMissingAlt) {
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
        'content image has no `ratio` and is missing one of `width` / `height`. The box can\'t reserve layout space (CLS risk). Set `ratio="16:9"` OR pass BOTH `width` and `height` in px.',
      );
      this._warnedMissingDimensions = true;
    }
    // Validate `size` token — invalid values land on the host but no
    // CSS rule matches, so the thumbnail would render unsized.
    if (
      this.variant === 'thumbnail' &&
      !VALID_THUMB_SIZES.includes(this.size) &&
      !this._warnedInvalidSize
    ) {
      warnInvalidProp(
        'civ-image',
        'size',
        `one of ${VALID_THUMB_SIZES.map((s) => `"${s}"`).join(' | ')}`,
        this.size,
      );
      this._warnedInvalidSize = true;
    }
    // `rounded` only applies to thumbnails — flag the mistake instead
    // of silently making a content image circular.
    if (this.variant === 'content' && this.rounded && !this._warnedRoundedOnContent) {
      devWarn(
        'civ-image',
        '`rounded` is thumbnail-only — content-variant images ignore it. If you want circular content imagery, wrap the image and apply `border-radius` yourself.',
      );
      this._warnedRoundedOnContent = true;
    }

    // Required-src guard — without src, render nothing rather than
    // shipping a broken-image glyph to production.
    if (!this.src) return nothing;

    // Width/height pass-through must reject NaN and non-positive
    // values — `??` only catches null/undefined, so a non-numeric
    // attribute (`width="auto"`) would otherwise leak `NaN` to the
    // rendered <img>.
    const intrinsicW = Number.isFinite(this.width) && this.width! > 0 ? this.width : nothing;
    const intrinsicH = Number.isFinite(this.height) && this.height! > 0 ? this.height : nothing;

    // Alt: render only when defined. When undefined, the browser
    // falls back to filename — ugly but VISIBLE, so QA catches it.
    // Production never silently passes the image off as decorative.
    const altAttr = this.alt == null ? nothing : this.alt;

    const ratioStyle = this._aspectRatioStyle;

    // The box wrapper carried aspect-ratio in the v1 design, but
    // `.civ-image__img { height: 100% }` collapses to 0 when the box
    // has no ratio. Putting the aspect-ratio directly on the <img>
    // lets `height: auto` fall back to the natural ratio cleanly
    // when no ratio is set — and unifies the content/thumbnail
    // render paths.
    return html`
      <img
        class="civ-image__img"
        src="${this.src}"
        alt="${altAttr}"
        loading="${this.loading}"
        decoding="${this.decoding}"
        fetchpriority="${this.fetchPriority === 'auto' ? nothing : this.fetchPriority}"
        crossorigin="${this.crossOrigin || nothing}"
        referrerpolicy="${this.referrerPolicy || nothing}"
        width="${intrinsicW}"
        height="${intrinsicH}"
        style="${ratioStyle || nothing}"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-image': CivImage;
  }
}
