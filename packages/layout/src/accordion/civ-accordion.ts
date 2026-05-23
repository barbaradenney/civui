// Schema: packages/schema/src/components/civ-accordion.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivAccordionItem } from './civ-accordion-item.js';

/**
 * CivUI Accordion
 *
 * A grouped stack of full-width expandable rows. Children are
 * `<civ-accordion-item>`. Each item composes the same visual
 * language as `<civ-disclosure>` (chevron caret, 90° rotation on
 * open) but spans the row with a larger tap target.
 *
 * **Default behavior:** multiple items can be open at once. Pass
 * `single` to enforce one-open-at-a-time — when the user opens an
 * item, the parent collapses any other open siblings.
 *
 * The outer wrapper renders a rounded bordered group; items
 * separate with inter-item dividers.
 *
 * @element civ-accordion
 *
 * @prop {boolean} single - When true, opening one item closes any other open siblings
 *
 * @slot - One or more `<civ-accordion-item>` children
 *
 * @example
 * ```html
 * <civ-accordion>
 *   <civ-accordion-item label="Eligibility">…</civ-accordion-item>
 *   <civ-accordion-item label="How to apply">…</civ-accordion-item>
 *   <civ-accordion-item label="What to expect">…</civ-accordion-item>
 * </civ-accordion>
 * ```
 */
@customElement('civ-accordion')
export class CivAccordion extends LightDomSlotMixin(CivBaseElement) {
  /** When true, opening one item closes any other open siblings. */
  @property({ type: Boolean, reflect: true }) single = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-accordion-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-accordion-item-toggle', this._onItemToggle as EventListener);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('civ-accordion-item-toggle', this._onItemToggle as EventListener);
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <div class="civ-accordion__inner" data-civ-accordion-content></div>
    `;
  }

  /**
   * `single`-mode coordination. When an item dispatches the bubbling
   * `civ-accordion-item-toggle` with `open: true`, walk every other
   * item and close it. The `target !== item` guard prevents the
   * trigger from collapsing itself.
   */
  private _onItemToggle = (e: CustomEvent<{ open: boolean }>): void => {
    if (!this.single || !e.detail.open) return;
    const target = e.target as Element;
    const items = this.querySelectorAll<CivAccordionItem>('civ-accordion-item');
    for (const item of Array.from(items)) {
      if (item !== target && item.open) {
        item.open = false;
      }
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-accordion': CivAccordion;
  }
}
