import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, clickOutside, dispatch, generateId, t } from '@civui/core';
import type { GridColumn } from '../data-grid/civ-data-grid.types.js';

/**
 * CivUI Column Visibility
 *
 * A popover that lets users toggle which columns of a `civ-data-grid`
 * are visible. Renders a trigger button + checkbox panel — the consumer
 * wires the panel's `civ-column-visibility-change` event back into the
 * grid's `columns` array by flipping `column.hidden` on each entry.
 *
 * **Composition pattern:**
 *
 * ```ts
 * const grid = document.querySelector('civ-data-grid')!;
 * const cols = document.querySelector('civ-column-visibility')!;
 *
 * const allColumns = [ ... ];
 * grid.columns = allColumns;
 * cols.columns = allColumns;
 * cols.hiddenColumns = [];
 *
 * cols.addEventListener('civ-column-visibility-change', (e) => {
 *   const hidden = e.detail.hiddenColumns;
 *   cols.hiddenColumns = hidden;
 *   grid.columns = allColumns.map((c) => ({ ...c, hidden: hidden.includes(c.key) }));
 * });
 * ```
 *
 * The bar is **controlled** — `hiddenColumns` is the source of truth;
 * the component never mutates it without dispatching first.
 *
 * **Why not built on civ-menu?** Menus are single-select with close-on-
 * click semantics. A column visibility panel is multi-select: the panel
 * stays open while the user toggles several checkboxes. Different
 * keyboard model (Space toggles, no Enter-to-select-and-close), so this
 * component renders its own popover.
 *
 * **Why a native `<button>` trigger and not `civ-action-button`?**
 * The trigger needs `aria-haspopup`, `aria-expanded`, and `aria-controls`
 * on the focusable element. Putting them on the host (`<civ-action-button>`)
 * leaves the focusable inner `<button>` without those ARIA attributes —
 * screen readers reading the focused button would hear "Columns, button"
 * with no popup affordance. Using a native `<button>` styled with the
 * existing `.civ-action-btn` utility classes gives the same visual with
 * the ARIA on the right element.
 *
 * **Empty columns array.** When `columns` is `[]` the trigger still
 * renders and the panel opens to an empty group. Consumers are expected
 * to populate `columns` before showing the component; an empty panel
 * is a benign edge case rather than an error.
 *
 * @element civ-column-visibility
 *
 * @prop {Array} columns - The full column set (`GridColumn[]`). Mirrored from the grid.
 * @prop {string[]} hiddenColumns - Keys of columns currently hidden (controlled).
 * @prop {string} label - Trigger button text. Defaults to i18n "Columns".
 * @prop {number} minVisible - Minimum visible columns. Prevents the user from hiding everything. Default 1.
 * @prop {'start' | 'end'} align - Horizontal alignment of the panel relative to the trigger. Default 'end'.
 * @prop {boolean} open - Controlled open state. Reflects as the `open` attribute.
 *
 * @fires civ-column-visibility-change - { hiddenColumns, visibleColumns } — user toggled a column.
 */
@customElement('civ-column-visibility')
export class CivColumnVisibility extends CivBaseElement {
  @property({ attribute: false }) columns: GridColumn[] = [];
  @property({ attribute: false }) hiddenColumns: string[] = [];
  @property({ type: String }) label = '';
  @property({ type: Number, attribute: 'min-visible' }) minVisible = 1;
  @property({ type: String }) align: 'start' | 'end' = 'end';
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private _instanceId = generateId('civ-column-visibility');

  private _clickOutside = clickOutside(this, () => this._close());
  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundOnKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundOnKeydown);
    this._clickOutside.remove();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('open')) {
      if (this.open) this._clickOutside.add();
      else this._clickOutside.remove();
    }
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close(true);
    }
  }

  private _close(returnFocus = false): void {
    if (!this.open) return;
    this.open = false;
    if (returnFocus) {
      const trigger = this.querySelector<HTMLElement>(
        '.civ-column-visibility__trigger',
      );
      trigger?.focus?.();
    }
  }

  private _toggle(): void {
    this.open = !this.open;
  }

  private _isHidden(key: string): boolean {
    return this.hiddenColumns.includes(key);
  }

  private _visibleCount(): number {
    return this.columns.length - this.hiddenColumns.length;
  }

  private _onToggleColumn(key: string, e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    let next: string[];
    if (checked) {
      // Unhide.
      next = this.hiddenColumns.filter((k) => k !== key);
    } else {
      // Hide — but enforce minVisible.
      if (this._visibleCount() <= this.minVisible) {
        // Refuse the toggle. The user's interactive `.checked = false`
        // mutated the DOM directly, but Lit's property binding caches
        // the previous value (true) and treats a re-render as a no-op.
        // Restore by flipping the input back manually.
        (e.target as HTMLInputElement).checked = true;
        return;
      }
      next = this.hiddenColumns.includes(key)
        ? this.hiddenColumns
        : [...this.hiddenColumns, key];
    }
    const visible = this.columns.map((c) => c.key).filter((k) => !next.includes(k));
    dispatch(this, 'civ-column-visibility-change', {
      hiddenColumns: next,
      visibleColumns: visible,
    });
  }

  override render() {
    const labelText = this.label || t('columnVisibilityLabel');
    const panelClasses = [
      'civ-column-visibility__panel',
      'civ-bottom-sheet',
      `civ-column-visibility__panel--align-${this.align}`,
    ].join(' ');
    const panelId = `${this._instanceId}-panel`;
    return html`
      <button
        type="button"
        class="civ-action-btn civ-action-btn--tertiary civ-column-visibility__trigger"
        aria-haspopup="true"
        aria-expanded="${this.open ? 'true' : 'false'}"
        aria-controls="${panelId}"
        @click="${this._toggle}"
      >
        <civ-icon name="view-column" aria-hidden="true"></civ-icon>
        <span class="civ-column-visibility__trigger-label">${labelText}</span>
        <civ-icon name="chevron-down" aria-hidden="true"></civ-icon>
      </button>
      ${this.open
        ? html`
            <div
              id="${panelId}"
              class="${panelClasses}"
              role="group"
              aria-label="${t('columnVisibilityPanelLabel')}"
            >
              ${this.columns.map(
                (col) => html`
                  <label class="civ-column-visibility__option">
                    <input
                      type="checkbox"
                      .checked="${!this._isHidden(col.key)}"
                      @change="${(e: Event) => this._onToggleColumn(col.key, e)}"
                    />
                    <span class="civ-column-visibility__option-label">${col.header}</span>
                  </label>
                `,
              )}
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-column-visibility': CivColumnVisibility;
  }
}
