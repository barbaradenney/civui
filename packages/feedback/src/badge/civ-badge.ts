import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type BadgeVariant = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type BadgeStyle = 'primary' | 'secondary';

/**
 * CivUI Badge
 *
 * A compact status indicator. Use to communicate state ("Approved",
 * "Pending"), severity ("Error"), or as a notification dot. For
 * **numeric counts** (filter results, unread totals), use `civ-count`
 * — it has lighter chrome and primary/secondary emphasis levels
 * tuned for numbers. For categorization, use `civ-tag`.
 *
 * **Modes:**
 * - `label` — text status indicator (default)
 * - `dot` — small colored marker only; `label` becomes `aria-label`
 *
 * **Emphasis levels:**
 * - `secondary` (default) — light tint background with dark text
 * - `primary` — filled dark background with light text
 *
 * Always renders `role="status"` so assistive tech announces the state
 * (except in dot mode without a label, where the marker is decorative
 * and gets `aria-hidden="true"`).
 *
 * @element civ-badge
 *
 * @prop {string} label - Badge text (or accessible name when `dot`)
 * @prop {boolean} dot - Render as a dot only
 * @prop {BadgeVariant} variant - Semantic color
 * @prop {BadgeStyle} badgeStyle - Emphasis level: 'primary' or 'secondary' (default)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {boolean} overlay - Position absolutely in the top-end corner of a relative parent
 *
 * @example
 * ```html
 * <civ-badge label="Approved" variant="success"></civ-badge>
 * <civ-badge label="Denied" variant="error" badge-style="primary"></civ-badge>
 * <civ-badge dot label="Unread" variant="error"></civ-badge>
 * ```
 */
@customElement('civ-badge')
export class CivBadge extends CivBaseElement {
  /** Badge text (or accessible name when `dot` is true). */
  @property({ type: String }) label = '';

  /** Render as a small colored dot only (no text). */
  @property({ type: Boolean, reflect: true }) dot = false;

  /** Semantic color variant. */
  @property({ type: String }) variant: BadgeVariant = 'neutral';

  /** Emphasis: 'primary' (dark bg, light text) or 'secondary' (light bg, dark text). */
  @property({ type: String, attribute: 'badge-style' }) badgeStyle: BadgeStyle = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /**
   * Render in overlay (notification) mode — absolutely positioned in the
   * top-end corner of the parent. The parent must be `position: relative`
   * (or use the `civ-badge-anchor` utility class).
   */
  @property({ type: Boolean, reflect: true }) overlay = false;

  override render() {
    const classes = [
      'civ-badge',
      `civ-badge--${this.variant}`,
      `civ-badge--style-${this.badgeStyle}`,
    ];
    if (this.spacing === 'sm') classes.push('civ-badge--sm');
    if (this.dot) classes.push('civ-badge--dot');
    if (this.overlay) classes.push('civ-badge--overlay');

    if (this.dot) {
      // With no label, the dot is purely decorative — mark aria-hidden so AT
      // doesn't announce an empty live region. Callers who need AT exposure
      // must supply `label` (which becomes aria-label and adds role="status").
      if (!this.label) {
        return html`<span class="${classes.join(' ')}" aria-hidden="true"></span>`;
      }
      return html`
        <span class="${classes.join(' ')}" role="status" aria-label="${this.label}"></span>
      `;
    }

    return html`
      <span class="${classes.join(' ')}" role="status">${this.label || nothing}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-badge': CivBadge;
  }
}
