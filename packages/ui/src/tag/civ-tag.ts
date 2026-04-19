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

/**
 * CivUI Tag
 *
 * A small status label rendered as a colored pill. Used to indicate
 * status (not started, in progress, error), categories, or metadata.
 *
 * @element civ-tag
 *
 * @prop {string} label - Tag text content
 * @prop {TagVariant} variant - Color variant
 *
 * @example
 * ```html
 * <civ-tag label="Not started" variant="blue"></civ-tag>
 * <civ-tag label="In progress" variant="teal"></civ-tag>
 * <civ-tag label="Complete" variant="green"></civ-tag>
 * <civ-tag label="Error" variant="red"></civ-tag>
 * ```
 */
@customElement('civ-tag')
export class CivTag extends CivBaseElement {
  /** Tag text. */
  @property({ type: String }) label = '';

  /** Color variant. */
  @property({ type: String }) variant: TagVariant = 'gray';

  override render() {
    return html`
      <span class="civ-tag civ-tag--${this.variant}">${this.label}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tag': CivTag;
  }
}
