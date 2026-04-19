import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Divider
 *
 * A horizontal rule for visually separating content sections.
 * Renders as an `<hr>` with consistent styling from design tokens.
 *
 * @element civ-divider
 *
 * @prop {string} spacing - Vertical spacing: 'default' (md) or 'sm'
 *
 * @example
 * ```html
 * <civ-divider></civ-divider>
 * <civ-divider spacing="sm"></civ-divider>
 * ```
 */
@customElement('civ-divider')
export class CivDivider extends CivBaseElement {
  /** Vertical spacing around the divider. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  override render() {
    const classes = [
      'civ-divider',
      this.spacing === 'sm' ? 'civ-divider--sm' : '',
    ].filter(Boolean).join(' ');

    return html`<hr class="${classes}" />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-divider': CivDivider;
  }
}
