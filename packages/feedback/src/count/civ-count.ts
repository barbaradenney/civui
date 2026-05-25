import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement } from '@civui/core';

export type CountIntent = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type CountEmphasis = 'primary' | 'secondary' | 'tertiary';
export type CountLive = 'off' | 'polite' | 'assertive';

/**
 * CivUI Count
 *
 * A numeric annotation — match counts on filter chips, item counts in
 * navigation, notification counters, etc. Lighter chrome than
 * `civ-badge` so it sits inside other components without competing
 * with their visual weight.
 *
 * **Styles** (`count-style`):
 * - `secondary` (default) — tinted background pill with semantic color text.
 *   Use inside chips, list items, nav links.
 * - `primary` — filled rounded pill with white text. Use for standalone
 *   or notification-style counters.
 * - `tertiary` — bare text with parentheses, e.g. "(12)". Minimal
 *   emphasis for inline counts.
 *
 * **Position** is independent of style: set `overlay` to absolutely
 * position the count in the top-end corner of a relatively-positioned
 * parent (use the `civ-badge-anchor` utility class), regardless of
 * whether the style is `secondary` or `primary`.
 *
 * **Accessibility:** counts are static annotations by default
 * (`live="off"`). Set `live="polite"` for inbox-style counters that
 * change as data updates and should announce.
 *
 * @element civ-count
 *
 * @prop {number | null} count - Numeric value. Render is skipped when null, undefined, or NaN.
 * @prop {number} max - Overflow threshold; values above render as `{max}+` (default 99)
 * @prop {CountIntent} intent - Semantic color (default 'neutral')
 * @prop {CountEmphasis} emphasis - Emphasis: 'secondary' (text only, default) or 'primary' (filled pill)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {boolean} overlay - Position absolutely in the top-end corner of a relative parent
 * @prop {CountLive} live - aria-live politeness: 'off' (default), 'polite', or 'assertive'
 *
 * @example
 * ```html
 * <civ-count count="24"></civ-count>
 * <civ-count count="3" intent="error" emphasis="primary"></civ-count>
 * <civ-count count="150" max="99" intent="info" overlay live="polite"></civ-count>
 * ```
 */
@customElement('civ-count')
export class CivCount extends CivBaseElement {
  /** Numeric value to render. Render is skipped when null, undefined, or NaN. */
  @property({ type: Number }) count: number | null = null;

  /** Overflow threshold; counts above render as "{max}+". */
  @property({ type: Number }) max = 99;

  /** Semantic color variant. */
  @property({ type: String }) intent: CountIntent = 'neutral';

  /** Emphasis: 'primary' (filled pill) or 'secondary' (text only, default). */
  @property({ type: String, attribute: 'emphasis' }) emphasis: CountEmphasis = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Notification-overlay positioning (top-end of a relative parent). */
  @property({ type: Boolean, reflect: true }) overlay = false;

  /** aria-live politeness for dynamic counters. Default `off` (static). */
  @property({ type: String }) live: CountLive = 'off';

  private get _displayCount(): string {
    return this.count! > this.max ? `${this.max}+` : String(this.count);
  }

  override render() {
    if (this.count === null || this.count === undefined || Number.isNaN(this.count)) {
      return nothing;
    }

    const classes = [
      'civ-count',
      `civ-count--${this.intent}`,
      `civ-count--style-${this.emphasis}`,
    ];
    if (this.spacing === 'sm') classes.push('civ-count--sm');
    if (this.overlay) classes.push('civ-count--overlay');

    const ariaLive = this.live === 'off' ? undefined : this.live;
    const role = this.live === 'off' ? undefined : 'status';

    return html`
      <span
        class="${classes.join(' ')}"
        role="${ifDefined(role)}"
        aria-live="${ifDefined(ariaLive)}"
      >${this.emphasis === 'tertiary' ? `(${this._displayCount})` : this._displayCount}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-count': CivCount;
  }
}
