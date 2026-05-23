import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * CivUI Spinner
 *
 * Indeterminate loading indicator for short waits (200ms–~1s) where
 * the shape of incoming content is unknown — submit-in-flight, modal
 * opening, inline cell refresh. For longer waits with known content
 * shape, use `civ-skeleton` instead.
 *
 * The host carries `role="status"` and `aria-live="polite"` so the
 * `label` (visually hidden) is announced to assistive tech the first
 * time the spinner appears. The SVG itself is `aria-hidden`.
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
 *
 * **Reduced motion.** The spinner keeps rotating under
 * `prefers-reduced-motion` (slowed) because the motion conveys
 * "system isn't frozen" — it's functional, not decorative. This is
 * the lone carve-out in CivUI's otherwise global motion-kill rule.
 *
 * @element civ-spinner
 *
 * @prop {SpinnerSize} size - 'sm' (16px), 'md' (24px, default), 'lg' (32px).
 * @prop {string} label - Accessible name announced via `aria-live`. Default "Loading…".
 * @prop {number} delay - Milliseconds to wait before rendering. Default 200.
 * @prop {number} minDuration - Minimum on-screen time once visible. Default 400.
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

  @property({ type: String }) label = 'Loading…';

  @property({ type: Number }) delay = 200;

  @property({ type: Number, attribute: 'min-duration' }) minDuration = 400;

  @state() private _visible = false;

  private _delayTimer: ReturnType<typeof setTimeout> | null = null;
  private _shownAt = 0;

  override connectedCallback(): void {
    super.connectedCallback();
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
  }

  private _show(): void {
    this._delayTimer = null;
    this._shownAt = Date.now();
    this._visible = true;
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
    return html`
      <span class="civ-spinner civ-spinner--${this.size}" role="status" aria-live="polite">
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
        <span class="civ-sr-only">${this.label}</span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-spinner': CivSpinner;
  }
}
