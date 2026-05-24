import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type TagColor =
  | 'blue'
  | 'orange'
  | 'purple'
  | 'gray';

export type TagStyle = 'primary' | 'secondary';

/**
 * CivUI Tag
 *
 * A small label rendered as a colored pill for **categorization** —
 * topics, taxonomies, filter chips, metadata. For status indicators
 * ("Approved", "Pending", "Error") or numeric counts, use `civ-badge`
 * instead — it carries `role="status"` and is restricted to semantic
 * colors.
 *
 * Two emphasis levels:
 * - **primary** — bold/dark background with light text for high-emphasis
 * - **secondary** (default) — light background with dark text for low-emphasis
 *
 * Tag size is controlled by the density system — wrap in a parent with
 * `data-civ-scale="dense"` or `data-civ-scale="spacious"` to adjust.
 *
 * @element civ-tag
 *
 * @prop {string} label - Tag text content
 * @prop {TagColor} color - Color variant (categorization palette)
 * @prop {TagStyle} tagStyle - Emphasis level: 'primary' (dark bg) or 'secondary' (light bg, default)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the label
 *
 * @example
 * ```html
 * <civ-tag label="Personal" color="blue" icon-start="person"></civ-tag>
 * <civ-tag label="Important" color="purple" tag-style="primary" icon-start="star"></civ-tag>
 * <civ-tag label="Mailed" color="orange"></civ-tag>
 * ```
 */
@customElement('civ-tag')
export class CivTag extends CivBaseElement {
  /** Tag text. */
  @property({ type: String }) label = '';

  /** Color variant. */
  @property({ type: String }) color: TagColor = 'gray';

  /** Emphasis: 'primary' (dark bg, light text) or 'secondary' (light bg, dark text). */
  @property({ type: String, attribute: 'tag-style' }) tagStyle: TagStyle = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Icon name to render before the label. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  override render() {
    const styleClass = this.tagStyle === 'primary'
      ? `civ-tag--${this.color}-primary`
      : `civ-tag--${this.color}`;

    const classes = [
      'civ-tag',
      styleClass,
      this.spacing === 'sm' ? 'civ-tag--sm' : '',
      this.iconStart ? 'civ-tag--with-icon' : '',
    ].filter(Boolean).join(' ');

    return html`
      <span class="${classes}">${this.iconStart
        ? html`<civ-icon name="${this.iconStart}" class="civ-tag__icon" aria-hidden="true"></civ-icon>`
        : nothing}${this.label}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tag': CivTag;
  }
}
