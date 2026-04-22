import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Button Group
 *
 * Joins adjacent action buttons into a connected toolbar. Removes
 * inner border-radius so buttons sit flush together.
 *
 * @element civ-button-group
 *
 * @prop {'horizontal' | 'vertical'} orientation - Layout direction
 *
 * @example
 * ```html
 * <civ-button-group>
 *   <civ-action-button label="Bold"></civ-action-button>
 *   <civ-action-button label="Italic"></civ-action-button>
 *   <civ-action-button label="Underline"></civ-action-button>
 * </civ-button-group>
 * ```
 */
@customElement('civ-button-group')
export class CivButtonGroup extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) orientation: 'horizontal' | 'vertical' = 'horizontal';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-button-group-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const classes = this.orientation === 'vertical'
      ? 'civ-button-group--vertical'
      : 'civ-button-group';

    return html`
      <div class="${classes}" role="toolbar" data-civ-button-group-content></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-button-group': CivButtonGroup;
  }
}
