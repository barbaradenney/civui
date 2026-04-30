import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement } from '@civui/core';

export type BadgeVariant = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type BadgeStyle = 'primary' | 'secondary';

/**
 * CivUI Badge
 *
 * A compact status or count indicator. Use to communicate state
 * ("Approved", "Pending"), severity ("Error"), or a numeric count
 * ("5 unread"). For categorization, use `civ-tag` instead.
 *
 * **Modes** (precedence: dot > count > label):
 * - `label` — text status indicator (default)
 * - `count` — numeric badge; values above `max` render as "{max}+"
 * - `dot` — small colored marker only; `label` becomes `aria-label`
 *
 * **Emphasis levels:**
 * - `secondary` (default) — light tint background with dark text
 * - `primary` — filled dark background with light text
 *
 * Always renders `role="status"` so assistive tech announces the state.
 *
 * @element civ-badge
 *
 * @prop {string} label - Badge text (or accessible name when `dot`)
 * @prop {number | null} count - Numeric value; renders as count badge
 * @prop {number} max - Overflow threshold for count (default 99)
 * @prop {boolean} dot - Render as a dot only
 * @prop {BadgeVariant} variant - Semantic color
 * @prop {BadgeStyle} badgeStyle - Emphasis level: 'primary' (dark bg) or 'secondary' (light bg, default)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 *
 * @example
 * ```html
 * <civ-badge label="Approved" variant="success"></civ-badge>
 * <civ-badge label="Denied" variant="error" badge-style="primary"></civ-badge>
 * <civ-badge count="12" variant="info" spacing="sm"></civ-badge>
 * <civ-badge dot label="Unread" variant="error"></civ-badge>
 * ```
 */
@customElement('civ-badge')
export class CivBadge extends CivBaseElement {
  /** Badge text (or accessible name when `dot` is true). */
  @property({ type: String }) label = '';

  /** Numeric value; when set, renders as a count badge. */
  @property({ type: Number }) count: number | null = null;

  /** Overflow threshold for count display. */
  @property({ type: Number }) max = 99;

  /** Render as a small colored dot only (no text). */
  @property({ type: Boolean, reflect: true }) dot = false;

  /** Semantic color variant. */
  @property({ type: String }) variant: BadgeVariant = 'neutral';

  /** Emphasis: 'primary' (dark bg, light text) or 'secondary' (light bg, dark text). */
  @property({ type: String, attribute: 'badge-style' }) badgeStyle: BadgeStyle = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  private get _displayCount(): string {
    if (this.count === null || this.count === undefined) return '';
    return this.count > this.max ? `${this.max}+` : String(this.count);
  }

  override render() {
    const classes = [
      'civ-badge',
      `civ-badge--${this.variant}`,
      `civ-badge--style-${this.badgeStyle}`,
    ];
    if (this.spacing === 'sm') classes.push('civ-badge--sm');
    if (this.dot) classes.push('civ-badge--dot');

    if (this.dot) {
      return html`
        <span
          class="${classes.join(' ')}"
          role="status"
          aria-label="${ifDefined(this.label || undefined)}"
        ></span>
      `;
    }

    const content = this.count !== null && this.count !== undefined
      ? this._displayCount
      : this.label;

    return html`
      <span class="${classes.join(' ')}" role="status">${content || nothing}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-badge': CivBadge;
  }
}
