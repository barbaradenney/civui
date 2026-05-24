import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, dispatch, t } from '@civui/core';
import '@civui/overlays/popover';
import '@civui/actions/action-button';
import '@civui/inputs/checkbox';
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
 * **Built on `civ-popover`.** All the trigger / panel / click-outside /
 * positioning / mobile-sheet scaffolding lives in `civ-popover`. This
 * component layers on the column-visibility-specific bits: rendering
 * one checkbox per column, enforcing `minVisible`, and translating
 * checkbox toggles into `civ-column-visibility-change` events.
 *
 * **Why not built on `civ-menu`?** Menus are single-select with close-
 * on-activation semantics. A column visibility panel is multi-select:
 * the panel stays open while the user toggles several checkboxes. Both
 * components now share the same `civ-popover` primitive, but they
 * compose it with different panel roles (`menu` vs `group`) and
 * different keyboard models (arrow-key navigation between menu-items
 * vs. natural Tab through checkboxes).
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

  private _isHidden(key: string): boolean {
    return this.hiddenColumns.includes(key);
  }

  private _visibleCount(): number {
    return this.columns.length - this.hiddenColumns.length;
  }

  private _onToggleColumn(key: string, e: Event): void {
    const checked = (e as CustomEvent<{ checked: boolean }>).detail.checked;
    let next: string[];
    if (checked) {
      // Unhide.
      next = this.hiddenColumns.filter((k) => k !== key);
    } else {
      // Hide — but enforce minVisible.
      if (this._visibleCount() <= this.minVisible) {
        // Refuse the toggle. civ-checkbox already flipped its internal
        // `checked` to false in response to the inner input's change
        // event; restore both the host property and the inner <input>
        // synchronously so callers (and tests) see the restored state
        // without awaiting an extra update cycle.
        const target = e.target as HTMLElement & { checked?: boolean };
        target.checked = true;
        const input = target.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (input) input.checked = true;
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

  private _onPopoverOpen = (e: Event): void => {
    e.stopPropagation();
    if (!this.open) this.open = true;
  };

  private _onPopoverClose = (e: Event): void => {
    e.stopPropagation();
    if (this.open) this.open = false;
  };

  override render() {
    const labelText = this.label || t('columnVisibilityLabel');
    // `aria-haspopup` / `aria-expanded` / `aria-controls` on the trigger
    // are wired by civ-popover (which knows the panel's id), so they're
    // not authored here. The panel's `role="group"` + accessible name
    // are forwarded via the `panel-role` and `label` props below.
    return html`
      <civ-popover
        ?open="${this.open}"
        align="${this.align}"
        panel-role="group"
        trigger-haspopup="true"
        label="${t('columnVisibilityPanelLabel')}"
        no-tab-close
        @civ-popover-open="${this._onPopoverOpen}"
        @civ-popover-close="${this._onPopoverClose}"
      >
        <civ-action-button
          data-civ-popover-trigger
          class="civ-column-visibility__trigger"
          variant="tertiary"
          icon-start="view-column"
          icon-end="chevron-down"
          label="${labelText}"
        ></civ-action-button>
        <div class="civ-column-visibility__options">
          ${this.columns.map(
            (col) => html`
              <civ-checkbox
                class="civ-column-visibility__option"
                spacing="sm"
                label="${col.header}"
                .checked="${!this._isHidden(col.key)}"
                disable-analytics
                @civ-change="${(e: Event) => this._onToggleColumn(col.key, e)}"
              ></civ-checkbox>
            `,
          )}
        </div>
      </civ-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-column-visibility': CivColumnVisibility;
  }
}
