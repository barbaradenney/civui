// Schema: packages/schema/src/components/civ-itemized-item.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type ItemizedIntent = 'neutral' | 'positive' | 'negative' | '';

/**
 * CivUI Itemized Item
 *
 * A single label + amount row inside `<civ-itemized-total>`. Display-only.
 * The amount is rendered as a number — formatting (currency symbol,
 * locale-correct separators) is supplied by the parent so every row in
 * a ledger shares the same format. Negative amounts render with a
 * locale-correct minus; `intent` controls color independently of sign.
 *
 * Use `value-label` when the row is non-numeric ("Pending", "Free", "—").
 * Rows with `value-label` are excluded from the auto-sum.
 *
 * @element civ-itemized-item
 *
 * @prop {string} label - The line-item label rendered on the left
 * @prop {number} amount - The line-item value; formatted by the parent
 * @prop {string} valueLabel - Override for non-numeric rows; excluded from the auto-sum
 * @prop {string} note - Optional secondary text rendered below the label
 * @prop {ItemizedIntent} intent - Color treatment for the amount (`positive`, `negative`, `neutral`). Default neutral.
 */
@customElement('civ-itemized-item')
export class CivItemizedItem extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: Number }) amount?: number;
  @property({ type: String, attribute: 'value-label' }) valueLabel = '';
  @property({ type: String }) note = '';
  @property({ type: String, reflect: true }) intent: ItemizedIntent = '';

  /**
   * Public hook so the parent can re-format this row when its
   * currency / locale change. Parent calls `requestUpdate()` on every
   * item after a relevant prop change; the child's render() then
   * re-reads the parent's format spec.
   */
  refresh(): void {
    this.requestUpdate();
  }

  private _formatAmount(): string {
    if (this.valueLabel) return this.valueLabel;
    if (typeof this.amount !== 'number' || Number.isNaN(this.amount)) return '';
    const parent = this.closest('civ-itemized-total') as
      | (HTMLElement & { formatAmount?: (n: number) => string })
      | null;
    if (parent && typeof parent.formatAmount === 'function') {
      return parent.formatAmount(this.amount);
    }
    return String(this.amount);
  }

  override render() {
    const intentClass = this.intent ? `civ-itemized-row__amount--${this.intent}` : '';
    const formatted = this._formatAmount();
    return html`
      <div class="civ-itemized-row">
        <div class="civ-itemized-row__label">
          <span class="civ-itemized-row__label-text">${this.label}</span>
          ${this.note
            ? html`<span class="civ-itemized-row__note">${this.note}</span>`
            : nothing}
        </div>
        <span class="civ-itemized-row__amount ${intentClass}">${formatted}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-itemized-item': CivItemizedItem;
  }
}
