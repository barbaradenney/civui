import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI List
 *
 * A flat container for `<civ-list-item>` rows. Renders as `<ul>` with
 * `role="list"`. Optional `dividers` adds a thin separator between
 * adjacent items.
 *
 * Use this for any vertical row collection: side navigation, settings
 * menus, link collections, task lists, search results.
 *
 * @element civ-list
 *
 * @prop {boolean} dividers - Render a 1px divider between adjacent items.
 *
 * @slot - List items (typically `<civ-list-item>`, but anything block-level works).
 *
 * @example
 * ```html
 * <civ-list dividers>
 *   <civ-list-item href="/dashboard">Dashboard</civ-list-item>
 *   <civ-list-item href="/claims">Claims</civ-list-item>
 *   <civ-list-item>Pending invites</civ-list-item>
 * </civ-list>
 * ```
 */
@customElement('civ-list')
export class CivList extends LightDomSlotMixin(CivBaseElement) {
  /** Render a 1px divider between adjacent items. */
  @property({ type: Boolean }) dividers = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-list-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const classes = [
      'civ-list-none',
      'civ-p-0',
      'civ-m-0',
      this.dividers ? 'civ-divide-y civ-divide-base-lighter' : '',
    ].filter(Boolean).join(' ');

    return html`
      <ul class="${classes}" role="list" data-civ-list-content></ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-list': CivList;
  }
}
