import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type TagVariant =
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
 * @prop {TagVariant} variant - Color variant (categorization palette)
 * @prop {TagStyle} tagStyle - Emphasis level: 'primary' (dark bg) or 'secondary' (light bg, default)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 *
 * @example
 * ```html
 * <civ-tag label="Healthcare" variant="blue"></civ-tag>
 * <civ-tag label="Disability" variant="purple" tag-style="primary"></civ-tag>
 * <civ-tag label="Education" variant="orange"></civ-tag>
 * ```
 */
@customElement('civ-tag')
export class CivTag extends CivBaseElement {
  /** Tag text. */
  @property({ type: String }) label = '';

  /** Color variant. */
  @property({ type: String }) variant: TagVariant = 'gray';

  /** Emphasis: 'primary' (dark bg, light text) or 'secondary' (light bg, dark text). */
  @property({ type: String, attribute: 'tag-style' }) tagStyle: TagStyle = 'secondary';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  override render() {
    const styleClass = this.tagStyle === 'primary'
      ? `civ-tag--${this.variant}-primary`
      : `civ-tag--${this.variant}`;

    const classes = [
      'civ-tag',
      styleClass,
      this.spacing === 'sm' ? 'civ-tag--sm' : '',
    ].filter(Boolean).join(' ');

    return html`
      <span class="${classes}">${this.label}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tag': CivTag;
  }
}
