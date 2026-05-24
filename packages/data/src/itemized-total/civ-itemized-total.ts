// Schema: packages/schema/src/components/civ-itemized-total.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivItemizedItem, ItemizedIntent } from './civ-itemized-item.js';
import './civ-itemized-item.js';

/**
 * CivUI Itemized Total
 *
 * Display-only ledger surface: a list of `<civ-itemized-item>` rows
 * followed by a single total row. The total auto-sums the children's
 * `amount` values; pass `total-amount` to override with a server-
 * calculated figure (the safer default for financial work). Children
 * with a non-numeric `value-label` are excluded from the auto-sum.
 *
 * `currency` and `locale` are read once at mount and passed to each
 * row's formatter — every line in the ledger shares the same format.
 * If the props change at runtime, all rows are refreshed.
 *
 * The container is flat (no border-radius, no card chrome) per the
 * design rule that only interactive elements get rounded corners.
 * Compose inside `<civ-card>` or `<civ-callout>` when a surface is
 * needed.
 *
 * @element civ-itemized-total
 *
 * @prop {string} heading - Optional heading rendered above the rows
 * @prop {number} headingLevel - Heading level (h2–h6) when `heading` is set; default 3
 * @prop {string} totalLabel - Label for the total row (default "Total")
 * @prop {number} totalAmount - Override for the total; defaults to the auto-sum
 * @prop {string} currency - ISO 4217 currency code for `Intl.NumberFormat` (default "USD")
 * @prop {string} locale - BCP 47 locale for `Intl.NumberFormat`; defaults to the browser locale
 * @prop {ItemizedIntent} totalIntent - Color treatment for the total row only
 *
 * @slot - `<civ-itemized-item>` children
 */
@customElement('civ-itemized-total')
export class CivItemizedTotal extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) heading = '';
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel: 2 | 3 | 4 | 5 | 6 = 3;
  @property({ type: String, attribute: 'total-label' }) totalLabel = 'Total';
  @property({ type: Number, attribute: 'total-amount' }) totalAmount?: number;
  @property({ type: String }) currency = 'USD';
  @property({ type: String }) locale = '';
  @property({ type: String, attribute: 'total-intent', reflect: true })
  totalIntent: ItemizedIntent = '';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-itemized-content]' };
  }

  /**
   * Format a numeric amount using the container's `currency` and
   * `locale`. Falls back to `String(n)` if `Intl.NumberFormat` rejects
   * the inputs (unsupported currency code, etc.).
   */
  formatAmount(n: number): string {
    if (typeof n !== 'number' || Number.isNaN(n)) return '';
    try {
      const fmt = new Intl.NumberFormat(this.locale || undefined, {
        style: 'currency',
        currency: this.currency || 'USD',
      });
      return fmt.format(n);
    } catch {
      return String(n);
    }
  }

  /**
   * Read every `<civ-itemized-item>` child, whether it has been
   * relocated into the rendered list container yet or is still
   * captured in `_slottedChildren` waiting for first relocation.
   * Both sources are checked so the first render's auto-sum is
   * accurate — without that, the initial paint shows `0` and a
   * follow-up state update would trip Lit's "update after update"
   * warning.
   */
  private _items(): CivItemizedItem[] {
    const fromDom = this.querySelectorAll<CivItemizedItem>('civ-itemized-item');
    if (fromDom.length > 0) return Array.from(fromDom);
    const captured = this._slottedChildren.get('default') ?? [];
    const items: CivItemizedItem[] = [];
    for (const node of captured) {
      if (
        node instanceof HTMLElement &&
        node.tagName.toLowerCase() === 'civ-itemized-item'
      ) {
        items.push(node as CivItemizedItem);
      }
    }
    return items;
  }

  private _computeTotal(): number {
    return this._items().reduce((acc, item) => {
      if (item.valueLabel) return acc;
      const v = item.amount;
      return acc + (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
    }, 0);
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed);
    // Currency / locale changes affect every row's rendering. Format
    // changes don't move the total, but they DO change how it reads.
    if (changed.has('currency') || changed.has('locale')) {
      for (const item of this._items()) item.refresh();
    }
  }

  override render() {
    const displayTotal =
      typeof this.totalAmount === 'number' && !Number.isNaN(this.totalAmount)
        ? this.totalAmount
        : this._computeTotal();
    const totalIntentClass = this.totalIntent
      ? `civ-itemized-total__total--${this.totalIntent}`
      : '';
    return html`
      <div class="civ-itemized-total">
        ${this.heading
          ? html`<p
              class="civ-itemized-total__heading"
              role="heading"
              aria-level="${this.headingLevel}"
            >${this.heading}</p>`
          : nothing}
        <div class="civ-itemized-total__items" data-civ-itemized-content></div>
        <div class="civ-itemized-total__total ${totalIntentClass}">
          <span class="civ-itemized-total__total-label">${this.totalLabel}</span>
          <span class="civ-itemized-total__total-amount"
            >${this.formatAmount(displayTotal)}</span
          >
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-itemized-total': CivItemizedTotal;
  }
}
