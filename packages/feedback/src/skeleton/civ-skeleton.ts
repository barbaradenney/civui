import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, devWarn } from '@civui/core';

export type SkeletonShape = 'text' | 'heading' | 'block' | 'circle';

/**
 * Allowed CSS length units for the `width` prop. We don't accept
 * arbitrary CSS strings — only a single numeric value followed by a
 * recognized unit — to prevent multi-declaration CSS injection
 * (`width="100%; background: red"`).
 */
const WIDTH_PATTERN = /^\s*\d+(?:\.\d+)?\s*(?:px|%|rem|em|vw|vh|vmin|vmax|ch|fr)\s*$/;

/** Hard upper bound on `lines` so `lines="10000"` doesn't spin the renderer. */
const MAX_LINES = 50;

/**
 * CivUI Skeleton
 *
 * Content-shape placeholder for waits longer than ~1s where the
 * shape of incoming content is known (lists, cards, table rows, page
 * chrome). For shorter waits where the shape is unknown, use
 * `civ-spinner` instead.
 *
 * Each skeleton renders as a static container shaped like the
 * content it stands in for. Compose multiple skeletons in the
 * consumer's layout to mirror the real page; there is no
 * page-orchestrator component because the layouts diverge too much
 * to abstract.
 *
 * **Accessibility.** The skeleton element is decorative — it carries
 * `aria-hidden="true"` and is never announced. The *parent region*
 * is the one that signals loading state to assistive tech: set
 * `aria-busy="true"` on the region while skeletons are visible, flip
 * to `false` when real content lands. Don't add live-region roles to
 * the skeleton itself — they'd announce on every shimmer tick.
 *
 * The component dev-warns when a skeleton mounts into a parent that
 * doesn't have `aria-busy="true"` somewhere on the ancestor chain —
 * the most common skeleton misuse is forgetting the busy signal on
 * the surrounding region.
 *
 * **Reduced motion.** The shimmer animation is decorative and is
 * killed by CivUI's global `prefers-reduced-motion` rule. The
 * skeleton's static shape still reserves layout space, which is the
 * accessibility-critical behavior.
 *
 * @element civ-skeleton
 *
 * @prop {SkeletonShape} shape - Shape: 'text' (default, one or more text lines), 'heading' (taller text block), 'block' (rectangular media / card body), 'circle' (avatar / icon).
 * @prop {string} width - CSS length for the skeleton width (e.g. '100%', '12rem', '80px'). Defaults to 100% for text/heading/block, 2.5rem for circle. Invalid values fall back to the default with a dev-warn.
 * @prop {number} lines - Number of text lines to render. Only meaningful for the `text` variant. Default 1. Values below 1 render nothing; values above `MAX_LINES` (50) are clamped.
 *
 * @example
 * ```html
 * <!-- Heading + three lines of body text -->
 * <div aria-busy="true">
 *   <civ-skeleton shape="heading" width="60%"></civ-skeleton>
 *   <civ-skeleton shape="text" lines="3"></civ-skeleton>
 * </div>
 *
 * <!-- Avatar + name placeholder -->
 * <div aria-busy="true" class="civ-flex civ-gap-3">
 *   <civ-skeleton shape="circle" width="3rem"></civ-skeleton>
 *   <civ-skeleton shape="text" width="8rem"></civ-skeleton>
 * </div>
 * ```
 */
@customElement('civ-skeleton')
export class CivSkeleton extends CivBaseElement {
  @property({ type: String, reflect: true }) shape: SkeletonShape = 'text';

  @property({ type: String }) width = '';

  @property({ type: Number }) lines = 1;

  private _warnedNoAriaBusy = false;
  private _warnedInvalidWidth = false;

  override connectedCallback(): void {
    super.connectedCallback();
    // Set aria-hidden only if the consumer hasn't already set it
    // (preserving an explicit `aria-hidden="false"` opt-out for the
    // rare specialized case where the skeleton is the announcement).
    if (!this.hasAttribute('aria-hidden')) {
      this.setAttribute('aria-hidden', 'true');
    }
    // Walk up the ancestor chain looking for aria-busy="true". If
    // we don't find one, the skeleton is signaling visual loading
    // but not announcing it — fire a one-shot dev-warn.
    if (!this._warnedNoAriaBusy && !this._hasAriaBusyAncestor()) {
      devWarn(
        'civ-skeleton',
        'no ancestor has `aria-busy="true"`. Skeletons are decorative — the parent region must signal loading to assistive tech. Wrap your skeleton group in `<div aria-busy="true">` and flip to `false` when content lands.',
        // Dedupe so a list of N skeletons fires the warning once.
        'no-aria-busy',
      );
      this._warnedNoAriaBusy = true;
    }
  }

  private _hasAriaBusyAncestor(): boolean {
    let node: HTMLElement | null = this.parentElement;
    while (node) {
      if (node.getAttribute('aria-busy') === 'true') return true;
      node = node.parentElement;
    }
    return false;
  }

  private get _defaultWidth(): string {
    return this.shape === 'circle' ? '2.5rem' : '100%';
  }

  /**
   * Sanitize the `width` prop against CSS injection. If the value
   * doesn't match a single numeric+unit length, fall back to the
   * default with a dev-warn instead of interpolating arbitrary CSS
   * into a `style="width: …"` attribute.
   */
  private _safeWidth(raw: string): string {
    if (!raw) return this._defaultWidth;
    if (WIDTH_PATTERN.test(raw)) return raw.trim();
    if (!this._warnedInvalidWidth) {
      devWarn(
        'civ-skeleton',
        `\`width="${raw.slice(0, 40)}"\` is not a recognized CSS length (number + px/%/rem/em/vw/vh/vmin/vmax/ch/fr). Falling back to the default — skeleton widths must be a single length value so consumer-controlled input can't inject extra style declarations.`,
      );
      this._warnedInvalidWidth = true;
    }
    return this._defaultWidth;
  }

  override render() {
    // Bail when lines < 1 — `lines="0"` should render nothing, not
    // a single placeholder. Also catches lines=NaN (`<civ-skeleton lines="abc">`).
    if (this.shape === 'text' && !(this.lines >= 1)) return nothing;

    const w = this._safeWidth(this.width);

    if (this.shape === 'text' && this.lines > 1) {
      // Clamp to MAX_LINES so a malformed `lines="10000"` doesn't
      // tie up render. Multiple text lines — render N lines, last
      // line shortened to mimic a paragraph's natural ragged-right
      // edge.
      const n = Math.min(Math.floor(this.lines), MAX_LINES);
      const lines = Array.from({ length: n }, (_, i) => {
        const isLast = i === n - 1;
        const lineWidth = isLast ? '70%' : w;
        return html`<span
          class="civ-skeleton civ-skeleton--text"
          style="width: ${lineWidth}"
        ></span>`;
      });
      return html`<span class="civ-skeleton-stack">${lines}</span>`;
    }

    return html`<span
      class="civ-skeleton civ-skeleton--${this.shape}"
      style="width: ${w}"
    ></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-skeleton': CivSkeleton;
  }
}
