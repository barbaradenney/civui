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
 * **Role.** Renders as `<div role="group">` with the `label` prop as
 * `aria-label`. The toolbar is a flex layout primitive only — it does
 * not implement WAI-ARIA Toolbar Pattern arrow-key navigation, so
 * `role="toolbar"` would mislead AT into expecting keyboard semantics
 * the component does not provide. `role="group"` communicates the
 * grouping without that contract; children keep their own Tab-stop
 * semantics.
 *
 * @element civ-toolbar
 *
 * @prop {string} label - Accessible name applied as aria-label on the group wrapper.
 *
 * @example
 * ```html
 * <civ-toolbar label="Applications toolbar">
 *   <civ-text-input label="Search" type="search"></civ-text-input>
 *   <civ-filter-chip-group></civ-filter-chip-group>
 *   <civ-button data-civ-toolbar-end variant="primary" label="Add new"></civ-button>
 * </civ-toolbar>
 * ```
 */
@customElement('civ-toolbar')
export class CivToolbar extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = '';

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
        role="group"
        aria-label="${this.label || nothing}"
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
