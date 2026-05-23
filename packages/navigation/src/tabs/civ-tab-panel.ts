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
    // tabindex is set in firstUpdated, after slot relocation, so we can
    // detect whether the panel contains its own focusable content.
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // Per WAI-ARIA APG, a tabpanel should be in the tab sequence only when
    // it contains no focusable descendants. With focusables inside, the
    // panel-level tabindex creates an extra tab stop between the active tab
    // and the first interactive control. We only auto-set tabindex when
    // the author hasn't supplied their own value.
    if (this.hasAttribute('tabindex')) return;
    const hasFocusable = this.querySelector(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!hasFocusable) this.setAttribute('tabindex', '0');
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
