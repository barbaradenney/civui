import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type ListSpacing = 'default' | 'sm';

/**
 * CivUI List
 *
 * A flat container for `<civ-list-item>` rows. Renders as `<ul>` with
 * `role="list"`. Supports dividers between items, compact spacing,
 * and nesting (a `<civ-list>` inside a `<civ-list-item>` indents
 * automatically).
 *
 * @element civ-list
 *
 * @prop {boolean} dividers - Render a 1px divider between adjacent items.
 * @prop {ListSpacing} spacing - Density: 'default' or 'sm' (compact).
 *
 * @slot - List items (typically `<civ-list-item>`).
 *
 * @example
 * ```html
 * <civ-list dividers>
 *   <civ-list-item href="/dashboard">Dashboard</civ-list-item>
 *   <civ-list-item href="/claims">Claims</civ-list-item>
 * </civ-list>
 * ```
 */
@customElement('civ-list')
export class CivList extends LightDomSlotMixin(CivBaseElement) {
  /** Render a 1px divider between adjacent items. */
  @property({ type: Boolean }) dividers = false;

  /** Density — 'default' or 'sm' (compact). */
  @property({ type: String }) spacing: ListSpacing = 'default';

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
      this.dividers ? 'civ-list--dividers' : '',
      this.spacing === 'sm' ? 'civ-list--sm' : '',
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
