import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Input Group
 *
 * Joins a form input and action button(s) flush together into a
 * single visual control. The container handles border-radius removal
 * so children render seamlessly connected.
 *
 * Works with any CivUI input (text-input, select, combobox) and
 * action buttons on either side.
 *
 * @element civ-input-group
 *
 * @example Basic search
 * ```html
 * <civ-input-group>
 *   <civ-text-input label="Search" name="q"></civ-text-input>
 *   <civ-action-button label="Search" emphasis="primary"></civ-action-button>
 * </civ-input-group>
 * ```
 *
 * @example Button on left
 * ```html
 * <civ-input-group>
 *   <civ-action-button label="$" emphasis="tertiary"></civ-action-button>
 *   <civ-text-input label="Amount" name="amount"></civ-text-input>
 * </civ-input-group>
 * ```
 */
@customElement('civ-input-group')
export class CivInputGroup extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-input-group-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <div class="civ-input-group" data-civ-input-group-content></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-input-group': CivInputGroup;
  }
}
