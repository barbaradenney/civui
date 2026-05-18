import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Tab Panel
 *
 * Content for a single tab inside `<civ-tabs>`. The parent matches
 * panels to tabs by `value` and toggles visibility based on the
 * selected tab.
 *
 * Panels carry `role="tabpanel"` on the host element and are linked to
 * their tab via `aria-labelledby` (wired up by the parent). The panel
 * itself is focusable (`tabindex="0"`) so keyboard users can scroll
 * panel content with the keyboard after activating a tab.
 *
 * @element civ-tab-panel
 *
 * @prop {string} value - Unique identifier — must match the corresponding `<civ-tab>`'s `value`
 *
 * @slot - Panel content.
 */
@customElement('civ-tab-panel')
export class CivTabPanel extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) value = '';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-tab-panel-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tabpanel');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`<div class="civ-tab-panel" data-civ-tab-panel-content></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tab-panel': CivTabPanel;
  }
}
