import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type TagVariant =
  | 'blue'
  | 'teal'
  | 'red'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'gray';

export type TagStyle = 'primary' | 'secondary';

/**
 * CivUI Tag
 *
 * A small status label rendered as a colored pill. Used to indicate
 * status (not started, in progress, error), categories, or metadata.
 *
 * Two emphasis levels:
 * - **primary** — bold/dark background with light text for high-emphasis status
 * - **secondary** (default) — light background with dark text for low-emphasis status
 *
 * Tag size is controlled by the density system — wrap in a parent with
 * `data-civ-scale="dense"` or `data-civ-scale="spacious"` to adjust.
 *
 * @element civ-tag
 *
 * @prop {string} label - Tag text content
 * @prop {TagVariant} variant - Color variant
 * @prop {TagStyle} tagStyle - Emphasis level: 'primary' (dark bg) or 'secondary' (light bg, default)
 *
 * @example
 * ```html
 * <civ-tag label="Denied" variant="red" tag-style="primary"></civ-tag>
 * <civ-tag label="Not started" variant="blue"></civ-tag>
 * <civ-tag label="Complete" variant="green" tag-style="primary"></civ-tag>
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

  override render() {
    const styleClass = this.tagStyle === 'primary'
      ? `civ-tag--${this.variant}-primary`
      : `civ-tag--${this.variant}`;

    const classes = ['civ-tag', styleClass].join(' ');

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
