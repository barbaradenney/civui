import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import '@civui/actions/button';

/**
 * CivUI Bulk Actions
 *
 * Selection-aware action bar that appears above or below a `civ-data-grid`
 * (or any other component with a selection model) when one or more rows
 * are selected. Shows "{count} {itemName(s)} selected" on the leading
 * edge, action buttons in the default slot, and a Clear button on the
 * trailing edge.
 *
 * Hidden via `display: none` when `count === 0` so default-slot action
 * buttons stay in the DOM across selection changes (don't get destroyed
 * when the bar appears/disappears).
 *
 * **Wiring with civ-data-grid:**
 *
 * ```ts
 * grid.addEventListener('civ-selection-change', (e) => {
 *   grid.selectedRowIds = e.detail.selectedRowIds;
 *   bulk.count = e.detail.selectedRowIds.length;
 * });
 * bulk.addEventListener('civ-clear-selection', () => {
 *   grid.selectedRowIds = [];
 *   bulk.count = 0;
 * });
 * ```
 *
 * @element civ-bulk-actions
 *
 * @prop {number} count - Currently-selected count. `0` hides the bar.
 * @prop {string} itemName - Singular noun used in status text (e.g. "row", "application").
 * @prop {string} itemNamePlural - Override the simple "+s" plural when the noun pluralizes differently.
 * @prop {string} clearLabel - Override the Clear button text.
 *
 * @fires civ-clear-selection - User clicked the Clear button.
 *
 * @example
 * ```html
 * <civ-bulk-actions count="3" item-name="application">
 *   <civ-button variant="secondary" icon-start="archive">Archive</civ-button>
 *   <civ-button variant="secondary" icon-start="delete" danger>Delete</civ-button>
 * </civ-bulk-actions>
 * ```
 */
@customElement('civ-bulk-actions')
export class CivBulkActions extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Number }) count = 0;
  @property({ type: String, attribute: 'item-name' }) itemName = 'item';
  @property({ type: String, attribute: 'item-name-plural' }) itemNamePlural = '';
  @property({ type: String, attribute: 'clear-label' }) clearLabel = '';

  override _getSlotConfig(): SlotConfig {
    return {
      default: '[data-civ-bulk-actions-content]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  private get _statusText(): string {
    const itemNoun = this.count === 1
      ? this.itemName
      : (this.itemNamePlural || `${this.itemName}s`);
    return t('bulkActionsSelectedLabel')
      .replace('{count}', String(this.count))
      .replace('{itemName}', itemNoun);
  }

  override render() {
    const hidden = this.count === 0;
    return html`
      <div
        class="civ-bulk-actions"
        role="region"
        aria-live="polite"
        ?hidden="${hidden}"
      >
        <p class="civ-bulk-actions__status">${this._statusText}</p>
        <div class="civ-bulk-actions__actions" data-civ-bulk-actions-content></div>
        <civ-button
          class="civ-bulk-actions__clear"
          variant="tertiary"
          label="${this.clearLabel || t('bulkActionsClearLabel')}"
          @click="${this._onClear}"
        ></civ-button>
      </div>
    `;
  }

  private _onClear(): void {
    dispatch(this, 'civ-clear-selection');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-bulk-actions': CivBulkActions;
  }
}
