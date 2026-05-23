import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, announce, t } from '@civui/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * CivUI Spinner
 *
 * Indeterminate loading indicator for short waits (200ms–~1s) where
 * the shape of incoming content is unknown — submit-in-flight, modal
 * opening, inline cell refresh. For longer waits with known content
 * shape, use `civ-skeleton` instead.
 *
 * **Accessibility model.** The host element is `role="img"` with
 * `aria-label="${label}"` so AT users who navigate to the spinner
 * after it has appeared hear the label ("Loading…, image"). On the
 * visibility transition (when `_visible` flips to true), the spinner
 * fires a single announcement via `@civui/core`'s shared `announce()`
 * queue — so concurrent spinners on the same page don't stack
 * "Loading… Loading… Loading…" announcements; the queue dedupes
 * identical messages within its short window.
 *
 * Inside a parent that already announces its own busy state (e.g.
 * `<civ-button loading>` which sets `aria-busy="true"`), pass
 * `decorative` to suppress both the host role/aria-label AND the
 * announcement — the parent's signal is enough, and stacking the
 * spinner's announcement under an aria-busy ancestor would be
 * buffered by some screen readers (NVDA, JAWS) anyway.
 *
 * **Flash protection.** Two timing props prevent the spinner from
 * appearing and disappearing in a blink:
 * - `delay` (default 200ms) — don't render anything until this much
 *   time has elapsed. Fast responses never show a spinner at all.
 * - `min-duration` (default 400ms) — once shown, stay visible for at
 *   least this long so the user perceives a state change rather than
 *   a flicker.
 *
 * Both timers are governed by the host being connected to the DOM.
 * Mount the element when work begins; remove it when work completes.
 * Reconnects reset visibility so the delay contract holds on every
 * mount cycle.
 *
 * **Reduced motion.** The spinner keeps rotating under
 * `prefers-reduced-motion` (slowed) because the motion conveys
 * "system isn't frozen" — it's functional, not decorative.
 *
 * @element civ-spinner
 *
 * @prop {SpinnerSize} size - 'sm' (16px), 'md' (24px, default), 'lg' (32px).
 * @prop {string} label - Accessible name announced once via `announce()`. Defaults to the locale's `spinnerDefaultLabel` ("Loading…" in English).
 * @prop {number} delay - Milliseconds to wait before rendering. Default 200.
 * @prop {number} minDuration - Minimum on-screen time once visible. Default 400.
 * @prop {boolean} decorative - Suppress all AT semantics (host role/aria-label and the announcement). Use when nesting inside a parent that already announces busy state.
 *
 * @example
 * ```html
 * <civ-spinner></civ-spinner>
 * <civ-spinner size="lg" label="Saving your application…"></civ-spinner>
 * ```
 */
@customElement('civ-spinner')
export class CivSpinner extends CivBaseElement {
  @property({ type: String, reflect: true }) size: SpinnerSize = 'md';

  /**
   * Spinner label. Defaults to the locale's `spinnerDefaultLabel`
   * lazily (via getter) so locale changes after class load apply.
   * Setting `label` explicitly skips the locale lookup.
   */
  @property({ type: String }) label = '';

  @property({ type: Number }) delay = 200;

  @property({ type: Number, attribute: 'min-duration' }) minDuration = 400;

  /**
   * When true, suppresses host role/aria-label and the visibility
   * announcement. The spinner becomes purely visual — use when the
   * parent already announces its busy state (e.g. inside civ-button[loading]).
   */
  @property({ type: Boolean, reflect: true }) decorative = false;

  @state() private _visible = false;

  private _delayTimer: ReturnType<typeof setTimeout> | null = null;
  private _shownAt = 0;
  private _announced = false;

  private get _effectiveLabel(): string {
    return this.label || t('spinnerDefaultLabel');
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Pre-paint state: clear any host AT semantics until _visible.
    // Host gets role/aria-label only when we're ready to show.
    if (this.delay <= 0) {
      this._show();
      return;
    }
    this._delayTimer = setTimeout(() => this._show(), this.delay);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._delayTimer !== null) {
      clearTimeout(this._delayTimer);
      this._delayTimer = null;
    }
    // Reset visibility state so reconnection re-runs the delay
    // contract instead of showing instantly with stale _shownAt.
    this._visible = false;
    this._shownAt = 0;
    this._announced = false;
    // Remove host AT semantics we may have applied.
    this.removeAttribute('role');
    this.removeAttribute('aria-label');
  }

  private _show(): void {
    this._delayTimer = null;
    this._shownAt = Date.now();
    this._visible = true;

    // Apply host AT semantics now that the spinner is visible — and
    // only when not decorative. AT users who navigate here will hear
    // "[label], image".
    if (!this.decorative) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this._effectiveLabel);
      // One-shot announcement via the shared queue so concurrent
      // spinners share a dedup window instead of stacking.
      if (!this._announced) {
        announce(this._effectiveLabel, 'polite');
        this._announced = true;
      }
    }
  }

  /**
   * If the consumer wants to programmatically remove the spinner
   * before `min-duration` has elapsed, await this promise first so
   * the visual minimum-on-screen guarantee holds.
   */
  async waitForMinDuration(): Promise<void> {
    if (!this._visible) return;
    const elapsed = Date.now() - this._shownAt;
    const remaining = this.minDuration - elapsed;
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
  }

  override render() {
    if (!this._visible) return html``;
    // Visual-only render — host carries the AT semantics (set in
    // `_show()`). The SVG is `aria-hidden` and the label isn't
    // rendered as visible text so the layout stays purely the icon.
    return html`
      <span class="civ-spinner civ-spinner--${this.size}">
        <svg
          class="civ-spinner__svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            class="civ-spinner__track"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          ></circle>
          <path
            class="civ-spinner__arc"
            d="M 12 2 A 10 10 0 0 1 22 12"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          ></path>
        </svg>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-spinner': CivSpinner;
  }
}
