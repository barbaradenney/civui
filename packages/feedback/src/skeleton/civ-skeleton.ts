import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type SkeletonVariant = 'text' | 'heading' | 'block' | 'circle';

/**
 * CivUI Skeleton
 *
 * Content-shaped placeholder for waits longer than ~1s where the
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
 * **Reduced motion.** The shimmer animation is decorative and is
 * killed by CivUI's global `prefers-reduced-motion` rule. The
 * skeleton's static shape still reserves layout space, which is the
 * accessibility-critical behavior.
 *
 * @element civ-skeleton
 *
 * @prop {SkeletonVariant} variant - Shape: 'text' (default, one or more text lines), 'heading' (taller text block), 'block' (rectangular media / card body), 'circle' (avatar / icon).
 * @prop {string} width - CSS length for the skeleton width (e.g. '100%', '12rem', '80px'). Defaults to 100% for text/heading/block, 2.5rem for circle.
 * @prop {number} lines - Number of text lines to render. Only meaningful for the `text` variant. Default 1.
 *
 * @example
 * ```html
 * <!-- Heading + three lines of body text -->
 * <div aria-busy="true">
 *   <civ-skeleton variant="heading" width="60%"></civ-skeleton>
 *   <civ-skeleton variant="text" lines="3"></civ-skeleton>
 * </div>
 *
 * <!-- Avatar + name placeholder -->
 * <div aria-busy="true" class="civ-flex civ-gap-3">
 *   <civ-skeleton variant="circle" width="3rem"></civ-skeleton>
 *   <civ-skeleton variant="text" width="8rem"></civ-skeleton>
 * </div>
 * ```
 */
@customElement('civ-skeleton')
export class CivSkeleton extends CivBaseElement {
  @property({ type: String, reflect: true }) variant: SkeletonVariant = 'text';

  @property({ type: String }) width = '';

  @property({ type: Number }) lines = 1;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  private get _defaultWidth(): string {
    return this.variant === 'circle' ? '2.5rem' : '100%';
  }

  override render() {
    const w = this.width || this._defaultWidth;

    if (this.variant === 'text' && this.lines > 1) {
      // Multiple text lines — render N lines, last line shortened to
      // mimic a paragraph's natural ragged-right edge.
      const lines = Array.from({ length: this.lines }, (_, i) => {
        const isLast = i === this.lines - 1;
        const lineWidth = isLast ? '70%' : w;
        return html`<span
          class="civ-skeleton civ-skeleton--text"
          style="width: ${lineWidth}"
        ></span>`;
      });
      return html`<span class="civ-skeleton-stack">${lines}</span>`;
    }

    return html`<span
      class="civ-skeleton civ-skeleton--${this.variant}"
      style="width: ${w}"
    ></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-skeleton': CivSkeleton;
  }
}
