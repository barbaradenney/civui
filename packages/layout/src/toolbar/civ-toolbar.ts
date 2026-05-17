import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Toolbar
 *
 * Horizontal layout container for the row of controls above a list,
 * grid, or filtered collection — search input, filter chips, density
 * toggle, "Add new" button, etc.
 *
 * **Slot attributes:**
 * - `data-civ-toolbar-end` — children land on the trailing edge (typically primary actions)
 * - (default, no attribute) — children land on the leading edge (search, filters)
 *
 * On viewports ≤480px the start and end groups stack vertically so the
 * controls stay reachable on mobile.
 *
 * @element civ-toolbar
 *
 * @prop {string} caption - Accessible name applied as aria-label on the toolbar landmark.
 *
 * @example
 * ```html
 * <civ-toolbar caption="Applications toolbar">
 *   <civ-text-input placeholder="Search applications"></civ-text-input>
 *   <civ-filter-chip-group></civ-filter-chip-group>
 *   <civ-button data-civ-toolbar-end variant="primary">Add new</civ-button>
 * </civ-toolbar>
 * ```
 */
@customElement('civ-toolbar')
export class CivToolbar extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) caption = '';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-toolbar-end': '[data-civ-toolbar-end-content]',
      default: '[data-civ-toolbar-start-content]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const hasEnd = this._hasSlottedChildren('data-civ-toolbar-end');
    return html`
      <div
        class="civ-toolbar"
        role="toolbar"
        aria-label="${this.caption || nothing}"
      >
        <div class="civ-toolbar__start" data-civ-toolbar-start-content></div>
        ${hasEnd
          ? html`<div class="civ-toolbar__end" data-civ-toolbar-end-content></div>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-toolbar': CivToolbar;
  }
}
