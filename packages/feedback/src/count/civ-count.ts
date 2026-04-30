import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement } from '@civui/core';

export type CountVariant = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type CountStyle = 'primary' | 'secondary';
export type CountLive = 'off' | 'polite' | 'assertive';

/**
 * CivUI Count
 *
 * A numeric annotation — match counts on filter chips, item counts in
 * navigation, notification counters, etc. Lighter chrome than
 * `civ-badge` so it sits inside other components without competing
 * with their visual weight.
 *
 * **Modes:**
 * - **Inline** (default `count-style="secondary"`): bare colored number,
 *   no background. Use inside chips, list items, nav links.
 * - **Pill** (`count-style="primary"`): filled background — for
 *   standalone or notification-style counters.
 * - **Overlay** (`overlay`): absolutely positioned over a relative
 *   parent, for the icon+count notification pattern. Use the
 *   `civ-badge-anchor` utility class on the parent.
 *
 * **Accessibility:** counts are static annotations by default
 * (`live="off"`). Set `live="polite"` for inbox-style counters that
 * change as data updates and should announce.
 *
 * @element civ-count
 *
 * @prop {number | null} count - Numeric value (required to render)
 * @prop {number} max - Overflow threshold; values above render as `{max}+` (default 99)
 * @prop {CountVariant} variant - Semantic color (default 'neutral')
 * @prop {CountStyle} countStyle - Emphasis: 'secondary' (text only, default) or 'primary' (filled pill)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {boolean} overlay - Position absolutely in the top-end corner of a relative parent
 * @prop {CountLive} live - aria-live politeness: 'off' (default), 'polite', or 'assertive'
 *
 * @example
 * ```html
 * <civ-count count="24"></civ-count>
 * <civ-count count="3" variant="error" count-style="primary"></civ-count>
 * <civ-count count="150" max="99" variant="info" overlay live="polite"></civ-count>
 * ```
 */
@customElement('civ-count')
export class CivCount extends CivBaseElement {
  /** Numeric value to render. */
  @property({ type: Number }) count: number | null = null;

  /** Overflow threshold; counts above render as "{max}+". */
  @property({ type: Number }) max = 99;

  /** Semantic color variant. */
  @property({ type: String }) variant: CountVariant = 'neutral';

  /** Emphasis: 'primary' (filled pill) or 'secondary' (text only, default). */
  @property({ type: String, attribute: 'count-style' }) countStyle: CountStyle = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Notification-overlay positioning (top-end of a relative parent). */
  @property({ type: Boolean, reflect: true }) overlay = false;

  /** aria-live politeness for dynamic counters. Default `off` (static). */
  @property({ type: String }) live: CountLive = 'off';

  private get _displayCount(): string {
    if (this.count === null || this.count === undefined) return '';
    return this.count > this.max ? `${this.max}+` : String(this.count);
  }

  override render() {
    if (this.count === null || this.count === undefined) return nothing;

    const classes = [
      'civ-count',
      `civ-count--${this.variant}`,
      `civ-count--style-${this.countStyle}`,
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
      >${this._displayCount}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-count': CivCount;
  }
}
