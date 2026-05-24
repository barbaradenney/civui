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
 * **Modern image formats (WebP / AVIF).** Set `webp-src` and / or
 * `avif-src` to consumer-produced alternate-format files. When either
 * is set, the component wraps the `<img>` in a `<picture>` element
 * with `<source type="image/avif">` and `<source type="image/webp">`
 * children — the browser picks the first format it understands, so
 * modern browsers download the smaller AVIF/WebP and older browsers
 * fall back to the original `src` (JPEG / PNG / GIF). The component
 * does NOT convert anything itself; consumers produce the alternates
 * at build time, via a CDN, or by hand. See the docs page
 * (`/components/layout/image`) for the implementation guide.
 *
 * **Dropped attributes.** `srcset`, `sizes`, `usemap`, `ismap` are
 * not forwarded — responsive `srcset` / `<picture>` art direction
 * (multiple crops per breakpoint) is deliberately out of v1 scope.
 * Consumers attaching these to the host get a dev-warn. For
 * optimization-critical attributes that ARE forwarded, use the
 * `fetchpriority`, `crossorigin`, and `decoding` props.
 *
 * @element civ-image
 *
 * @prop {string} src - Image URL. Required. The "universal fallback" — used directly in `<img>` when no alternates are set, or as the `<picture>` fallback for browsers that don't understand WebP / AVIF.
 * @prop {string} webpSrc - URL to a WebP alternate. When set, the component renders `<picture>` with a `<source type="image/webp">` child. WebP saves ~25–35% vs JPEG at equivalent quality (Google's own measurement).
 * @prop {string} avifSrc - URL to an AVIF alternate. When set, the component renders an AVIF `<source>` above the WebP source. AVIF saves ~50% vs JPEG at equivalent quality but has narrower browser support, hence the layered fallback (AVIF → WebP → original).
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
 *
 * <!-- Modern formats with universal fallback (browser picks the smallest it supports) -->
 * <civ-image
 *   src="/photo.jpg"
 *   webp-src="/photo.webp"
 *   avif-src="/photo.avif"
 *   alt="A veteran salutes the flag"
 *   ratio="16:9"
 * ></civ-image>
 * ```
 */
@customElement('civ-image')
export class CivImage extends CivBaseElement {
  @property({ type: String }) src = '';

  /**
   * URL to a WebP alternate. When set (alone or alongside `avifSrc`),
   * the component renders a `<picture>` wrapper with the appropriate
   * `<source>` elements. The browser picks the smallest format it
   * supports; consumers produce these files at build time or via a
   * format-negotiating CDN.
   */
  @property({ type: String, attribute: 'webp-src' }) webpSrc = '';

  /**
   * URL to an AVIF alternate. AVIF beats WebP on compression but has
   * narrower browser support, so it's listed first inside `<picture>`
   * and falls through to WebP (if set), then to `src`.
   */
  @property({ type: String, attribute: 'avif-src' }) avifSrc = '';

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

    // The aspect-ratio sits inline on the <img> itself so `height: auto`
    // falls back to the natural ratio cleanly when no ratio is set —
    // and the same single render path handles content + thumbnail
    // variants.
    const imgTemplate = html`
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

    // When the consumer supplied modern-format alternates, wrap the
    // <img> in a <picture>. AVIF first (best compression but narrower
    // support), then WebP, then the universal <img> fallback. The
    // browser walks the sources top-down and picks the first MIME
    // type it understands; if neither is set we skip the wrapper.
    if (this.avifSrc || this.webpSrc) {
      return html`
        <picture>
          ${this.avifSrc
            ? html`<source type="image/avif" srcset="${this.avifSrc}" />`
            : nothing}
          ${this.webpSrc
            ? html`<source type="image/webp" srcset="${this.webpSrc}" />`
            : nothing}
          ${imgTemplate}
        </picture>
      `;
    }
    return imgTemplate;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-image': CivImage;
  }
}
