import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, announce, interpolate, t } from '@civui/core';

/**
 * CivUI Repeater
 *
 * "Add another" pattern for repeating form sections. Wraps a template
 * of form fields and lets users add/remove instances dynamically.
 *
 * The component captures its initial children as a template. Each row
 * is a clone of that template. Form field names within rows are
 * automatically indexed (e.g., `dependents[0].name`, `dependents[1].name`).
 *
 * Two modes are supported:
 * - `mode="inline"` (default) — all rows and their fields are visible on the page.
 *   Best for simple items with 1-3 fields.
 * - `mode="detail"` — rows display as summary cards. Clicking "Add" or "Edit"
 *   expands a row to show its fields. Only one row is expanded at a time.
 *   Best for complex items with 4+ fields.
 *
 * @element civ-repeater
 *
 * @example
 * ```html
 * <civ-repeater legend="Dependents" name="dependents" item-label="dependent" mode="detail" min="1" max="10">
 *   <civ-text-input label="First name" name="firstName"></civ-text-input>
 *   <civ-text-input label="Last name" name="lastName"></civ-text-input>
 * </civ-repeater>
 * ```
 *
 * @fires civ-repeater-add - When a row is added, detail: { index: number }
 * @fires civ-repeater-remove - When a row is removed, detail: { index: number }
 */
@customElement('civ-repeater')
export class CivRepeater extends CivBaseElement {
  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /** Base name for indexed form fields. */
  @property({ type: String }) name = '';

  /** Human-readable label for each item (used in button text and announcements). */
  @property({ type: String, attribute: 'item-label' }) itemLabel = 'item';

  /**
   * Display mode:
   * - `inline` (default) — all row fields visible on the page.
   * - `detail` — rows show as summary cards; fields expand on edit/add.
   */
  @property({ type: String }) mode: 'inline' | 'detail' = 'inline';

  /** Hint text displayed below the legend. */
  @property({ type: String }) hint = '';

  /** Error text displayed below the hint. */
  @property({ type: String }) error = '';

  /** Whether at least one row is required. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Whether the component is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Minimum number of rows. Defaults to 1. */
  @property({ type: Number }) min = 1;

  /** Maximum number of rows. 0 = unlimited. */
  @property({ type: Number }) max = 0;

  @state() private _rowCount = 0;

  private _editingIdx = -1;

  private _template: Node[] = [];
  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  private _templateCaptured = false;

  /** Current number of rows. */
  get rowCount(): number {
    return this._rowCount;
  }

  /** In detail mode, the index of the row currently being edited (-1 = none). */
  get editingIndex(): number {
    return this._editingIdx;
  }

  override connectedCallback(): void {
    // Capture children as a clonable template before Lit's first render
    // destroys them (Light DOM). Only capture on first connection.
    if (!this._templateCaptured) {
      this._template = Array.from(this.childNodes).map(n => n.cloneNode(true));
      this._templateCaptured = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    // Build initial rows up to min count
    const initial = this.mode === 'detail' ? this.min : Math.max(this.min, 1);
    for (let i = 0; i < initial; i++) {
      this._appendRow(i);
    }
    this._rowCount = initial;
    // In detail mode, collapse all rows initially
    if (this.mode === 'detail') {
      this._collapseAllRows();
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const canAdd = this.max === 0 || this._rowCount < this.max;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}

        <div data-civ-repeater-rows></div>

        ${canAdd ? html`
          <civ-button
            variant="secondary"
            label="${interpolate(t('repeaterAddButton'), { item: this.itemLabel })}"
            ?disabled="${this.disabled}"
            @click="${this._addRow}"
            class="civ-mt-3"
          ></civ-button>
        ` : nothing}
      </fieldset>
    `;
  }

  /** Programmatically add a row. */
  addRow(): void {
    if (this.max > 0 && this._rowCount >= this.max) return;
    this._addRow();
  }

  /** Programmatically remove a row by index. */
  removeRow(index: number): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const rows = container.querySelectorAll(':scope > [data-civ-repeater-row]');
    if (index < 0 || index >= rows.length) return;
    if (this._rowCount <= this.min) return;
    rows[index].remove();
    this._rowCount--;
    this._reindexRows();
    dispatch(this, 'civ-repeater-remove', { index });
    announce(interpolate(t('repeaterItemRemoved'), { item: this.itemLabel, index: String(index + 1) }));
  }

  private _addRow(): void {
    if (this.max > 0 && this._rowCount >= this.max) return;
    const index = this._rowCount;
    this._appendRow(index);
    this._rowCount++;
    dispatch(this, 'civ-repeater-add', { index });
    announce(interpolate(t('repeaterItemAdded'), { item: this.itemLabel, index: String(index + 1) }));

    // In detail mode, expand the new row for editing
    if (this.mode === 'detail') {
      this._collapseAllRows();
      this._expandRow(index);
      this._editingIdx = index;
    }
  }

  private _appendRow(index: number): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;

    const row = document.createElement('div');
    row.setAttribute('data-civ-repeater-row', String(index));
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label',
      interpolate('{item} {index}', { item: this.itemLabel, index: String(index + 1) }));
    row.classList.add('civ-repeater-row', 'civ-card');

    if (this.mode === 'detail') {
      // Summary bar — visible when row is collapsed
      const summary = document.createElement('div');
      summary.setAttribute('data-civ-repeater-summary', '');
      summary.classList.add('civ-flex', 'civ-justify-between', 'civ-items-center');

      const summaryText = document.createElement('span');
      summaryText.classList.add('civ-font-medium');
      summaryText.textContent = `${this.itemLabel} ${index + 1}`;
      summary.appendChild(summaryText);

      const summaryActions = document.createElement('span');
      summaryActions.classList.add('civ-flex', 'civ-gap-2');

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'civ-btn civ-btn--tertiary focus-visible:civ-focus-ring';
      editBtn.textContent = t('repeaterEditButton');
      editBtn.setAttribute('aria-label',
        interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
      editBtn.addEventListener('click', () => {
        this._collapseAllRows();
        const idx = this._getRowIndex(row);
        this._expandRow(idx);
        this._editingIdx = idx;
        announce(interpolate('Editing {item} {index}', { item: this.itemLabel, index: String(idx + 1) }));
      });
      summaryActions.appendChild(editBtn);

      if (this._rowCount >= this.min || index >= this.min) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'civ-btn civ-btn--danger-text';
        removeBtn.textContent = t('repeaterRemoveButton');
        removeBtn.setAttribute('aria-label',
          interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
        removeBtn.addEventListener('click', () => {
          this.removeRow(this._getRowIndex(row));
        });
        summaryActions.appendChild(removeBtn);
      }

      summary.appendChild(summaryActions);
      row.appendChild(summary);

      // Detail fields container — visible when row is expanded
      const detail = document.createElement('div');
      detail.setAttribute('data-civ-repeater-detail', '');

      for (const node of this._template) {
        detail.appendChild(node.cloneNode(true));
      }

      // Save and cancel buttons
      const detailActions = document.createElement('div');
      detailActions.classList.add('civ-flex', 'civ-gap-2', 'civ-mt-3');

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'civ-btn civ-btn--primary focus-visible:civ-focus-ring';
      saveBtn.textContent = interpolate(t('repeaterSaveButton'), { item: this.itemLabel });
      saveBtn.addEventListener('click', () => {
        this._collapseAllRows();
        this._updateSummaryText(row, this._getRowIndex(row));
        this._editingIdx = -1;
        announce(interpolate(t('repeaterItemSaved'), { item: this.itemLabel, index: String(this._getRowIndex(row) + 1) }));
      });
      detailActions.appendChild(saveBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'civ-btn civ-btn--secondary focus-visible:civ-focus-ring';
      cancelBtn.textContent = t('repeaterCancelButton');
      cancelBtn.addEventListener('click', () => {
        this._collapseAllRows();
        this._editingIdx = -1;
      });
      detailActions.appendChild(cancelBtn);

      detail.appendChild(detailActions);
      row.appendChild(detail);

      // Index field names in the detail container
      this._indexRowFields(detail, index);
    } else {
      // Inline mode — clone template directly into row
      for (const node of this._template) {
        row.appendChild(node.cloneNode(true));
      }

      // Index field names
      this._indexRowFields(row, index);

      // Add remove button if allowed
      if (this._rowCount >= this.min || index >= this.min) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'civ-btn civ-btn--danger-text civ-mt-2';
        removeBtn.textContent = t('repeaterRemoveButton');
        removeBtn.setAttribute('aria-label',
          interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
        removeBtn.addEventListener('click', () => {
          this.removeRow(this._getRowIndex(row));
        });
        row.appendChild(removeBtn);
      }
    }

    container.appendChild(row);
  }

  private _getRowIndex(row: Element): number {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return -1;
    const rows = Array.from(container.querySelectorAll(':scope > [data-civ-repeater-row]'));
    return rows.indexOf(row);
  }

  private _indexRowFields(row: Element, index: number): void {
    // Only index direct children with [name] — not inner rendered inputs
    // from CivUI components (which manage their own name attributes).
    for (const child of row.children) {
      const baseName = child.getAttribute('name');
      if (!baseName) continue;
      const prefix = this.name || 'items';
      child.setAttribute('name', `${prefix}[${index}].${baseName}`);
    }
  }

  /** Collapse all rows to summary view (detail mode). */
  private _collapseAllRows(): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const rows = container.querySelectorAll(':scope > [data-civ-repeater-row]');
    rows.forEach(row => {
      const summary = row.querySelector('[data-civ-repeater-summary]') as HTMLElement | null;
      const detail = row.querySelector('[data-civ-repeater-detail]') as HTMLElement | null;
      if (summary) summary.style.display = '';
      if (detail) detail.style.display = 'none';
    });
  }

  /** Expand a specific row to show its fields (detail mode). */
  private _expandRow(index: number): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const row = container.querySelectorAll(':scope > [data-civ-repeater-row]')[index];
    if (!row) return;
    const summary = row.querySelector('[data-civ-repeater-summary]') as HTMLElement | null;
    const detail = row.querySelector('[data-civ-repeater-detail]') as HTMLElement | null;
    if (summary) summary.style.display = 'none';
    if (detail) detail.style.display = '';
  }

  /** Update the summary text for a row based on its field values. */
  private _updateSummaryText(row: Element, index: number): void {
    const summaryText = row.querySelector('[data-civ-repeater-summary] > span') as HTMLElement | null;
    if (!summaryText) return;

    // Build summary from field values in the detail container
    const detail = row.querySelector('[data-civ-repeater-detail]');
    if (!detail) return;

    const values: string[] = [];
    const fields = detail.querySelectorAll('[data-civ-form-field]');
    for (const field of fields) {
      const val = (field as HTMLElement & { value?: string }).value;
      if (val && typeof val === 'string' && val.trim()) {
        values.push(val.trim());
      }
    }

    summaryText.textContent = values.length > 0
      ? values.slice(0, 3).join(', ')
      : `${this.itemLabel} ${index + 1}`;
  }

  private _reindexRows(): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const rows = container.querySelectorAll(':scope > [data-civ-repeater-row]');
    rows.forEach((row, i) => {
      row.setAttribute('data-civ-repeater-row', String(i));
      row.setAttribute('aria-label',
        interpolate('{item} {index}', { item: this.itemLabel, index: String(i + 1) }));

      if (this.mode === 'detail') {
        // Reindex fields inside the detail container
        const detail = row.querySelector('[data-civ-repeater-detail]');
        if (detail) {
          for (const child of detail.children) {
            const current = child.getAttribute('name');
            if (!current) continue;
            const newName = current.replace(/\[\d+\]/, `[${i}]`);
            child.setAttribute('name', newName);
          }
        }
        // Update edit button aria-label
        const editBtn = row.querySelector('.civ-btn--tertiary');
        if (editBtn) {
          editBtn.setAttribute('aria-label',
            interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(i + 1) }));
        }
        // Update summary text
        this._updateSummaryText(row, i);
      } else {
        // Inline mode — reindex direct children
        for (const child of row.children) {
          const current = child.getAttribute('name');
          if (!current) continue;
          const newName = current.replace(/\[\d+\]/, `[${i}]`);
          child.setAttribute('name', newName);
        }
      }

      // Update remove button aria-label (both modes)
      const removeBtn = row.querySelector('.civ-btn--danger-text');
      if (removeBtn) {
        removeBtn.setAttribute('aria-label',
          interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(i + 1) }));
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-repeater': CivRepeater;
  }
}
