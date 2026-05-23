// Schema: packages/schema/src/components/civ-back-to-top.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Back to Top
 *
 * Floating chip-style button anchored to the bottom-right viewport
 * corner. Appears once the user has scrolled past `threshold`
 * pixels; clicking smooth-scrolls back to the top.
 *
 * **Visibility detection.** Uses an absolutely-positioned 1px
 * sentinel inserted into `<body>` at `threshold` from the top,
 * observed via `IntersectionObserver`. When the sentinel is in
 * view (user is near the top), the button hides. When the
 * sentinel scrolls out of view (user is past the threshold), the
 * button shows. This avoids `scroll` event listeners, which fire
 * hundreds of times per second on long pages.
 *
 * **Reduced motion.** Honors `prefers-reduced-motion: reduce` —
 * the scroll-to-top jump is instant for users who opted out of
 * animations.
 *
 * **Stacking.** Renders at `var(--civ-z-overlay)` so it sits
 * above page content and below modal-class overlays.
 *
 * @element civ-back-to-top
 *
 * @prop {string} label - Accessible name for the button. Default:
 *   "Back to top". Also shown as a tooltip via `title`.
 * @prop {number} threshold - Pixels scrolled before the button
 *   appears. Default: `400`.
 *
 * @example
 * ```html
 * <civ-back-to-top></civ-back-to-top>
 *
 * <!-- Custom label + threshold -->
 * <civ-back-to-top label="Scroll to top" threshold="800"></civ-back-to-top>
 * ```
 */
@customElement('civ-back-to-top')
export class CivBackToTop extends CivBaseElement {
  @property({ type: String }) label = 'Back to top';
  @property({ type: Number }) threshold = 400;
  /**
   * Reflected so the global `[hidden]` HTML rule applies
   * `display: none` automatically. Starts true (the button is
   * invisible until the user scrolls past the threshold).
   */
  @property({ type: Boolean, reflect: true }) hidden = true;

  private _sentinel?: HTMLElement;
  private _observer?: IntersectionObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this._installSentinel();
  }

  override disconnectedCallback(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    this._sentinel?.remove();
    this._sentinel = undefined;
    super.disconnectedCallback();
  }

  override updated(changes: Map<PropertyKey, unknown>): void {
    super.updated(changes);
    // If threshold changes at runtime, re-position the sentinel.
    if (changes.has('threshold') && this._sentinel) {
      this._sentinel.style.top = `${this.threshold}px`;
    }
  }

  private _installSentinel(): void {
    // Insert a 1px transparent sentinel at the threshold position.
    // The IntersectionObserver fires when this element crosses the
    // viewport's top edge — cheap, jank-free, no scroll listener.
    const sentinel = document.createElement('div');
    sentinel.setAttribute('data-civ-back-to-top-sentinel', '');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = `position: absolute; top: ${this.threshold}px; left: 0; width: 1px; height: 1px; pointer-events: none;`;
    document.body.appendChild(sentinel);
    this._sentinel = sentinel;

    // jsdom and very old browsers don't implement IntersectionObserver —
    // skip the observer setup and leave the button in its default
    // (hidden) state instead of throwing.
    if (typeof IntersectionObserver === 'undefined') return;

    this._observer = new IntersectionObserver(
      (entries) => {
        // Sentinel in view = user near top → hide button.
        // Sentinel out of view = user past threshold → show button.
        this.hidden = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    this._observer.observe(sentinel);
  }

  private _onClick(): void {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  override render() {
    return html`
      <button
        type="button"
        class="civ-back-to-top__button"
        aria-label="${this.label}"
        title="${this.label}"
        @click="${this._onClick}"
      >
        <civ-icon name="chevron-up" aria-hidden="true"></civ-icon>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-back-to-top': CivBackToTop;
  }
}
