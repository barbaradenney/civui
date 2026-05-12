import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, announce, interpolate, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/actions/button';
import '@civui/actions/action-button';
import '../form-step/civ-form-step.js';

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
 * - `mode="form-steps"` — rows display as summary cards. Clicking "Add" or
 *   "Edit" opens a multi-step form to fill the item. Best for complex items
 *   with 4+ fields.
 *
 * @element civ-repeater
 *
 * @example
 * ```html
 * <civ-repeater legend="Dependents" name="dependents" item-label="dependent" mode="form-steps" min="1" max="10">
 *   <civ-text-input label="First name" name="firstName"></civ-text-input>
 *   <civ-text-input label="Last name" name="lastName"></civ-text-input>
 * </civ-repeater>
 * ```
 *
 * @fires civ-repeater-add - When a row is added, detail: { index: number }
 * @fires civ-repeater-remove - When a row is removed, detail: { index: number }
 * @fires civ-repeater-form-steps-open - When the form-steps flow opens, detail: { index, isNew }
 * @fires civ-repeater-form-steps-close - When the form-steps flow closes, detail: { index, action: 'save' | 'cancel' }
 */
@customElement('civ-repeater')
export class CivRepeater extends CivBaseElement {
  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /**
   * Promote the legend to a heading via `role="heading"` + `aria-level=N`.
   * Use sparingly — typically only when this repeater is the primary
   * section on a page (level 1) or the top section inside a form-step
   * (level 2 or 3).
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the legend. Default and `sm` render at body size;
   * `md`/`lg`/`xl` increase the size for use as a section/page heading.
   * At `[data-civ-scale="fluid"]`, `xl` renders very large.
   */
  @property({ type: String }) size?: LabelSize;

  /** Base name for indexed form fields. */
  @property({ type: String }) name = '';

  /** Human-readable label for each item (used in button text and announcements). */
  @property({ type: String, attribute: 'item-label' }) itemLabel = 'item';

  /**
   * Display mode:
   * - `inline` (default) — all row fields visible on the page. Best for
   *   simple items with 1-3 fields.
   * - `form-steps` — rows show as summary cards; the multi-step form opens
   *   on add/edit. Best for complex items with 4+ fields.
   */
  @property({ type: String }) mode: 'inline' | 'form-steps' = 'inline';

  /** Hint text displayed below the legend. */
  @property({ type: String }) hint = '';

  /** Error text displayed below the hint. */
  @property({ type: String }) error = '';

  /** Whether at least one row is required. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Whether the component is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Mark the form-steps sub-flow as emotionally sensitive (form-steps mode only). */
  @property({ type: Boolean, attribute: 'form-steps-sensitive' }) formStepsSensitive = false;

  /** Show "Save and come back later" in the form-steps sub-flow (form-steps mode only). */
  @property({ type: Boolean, attribute: 'form-steps-show-pause' }) formStepsShowPause = false;

  /** Minimum number of rows. Defaults to 1. */
  @property({ type: Number }) min = 1;

  /** Maximum number of rows. 0 = unlimited. */
  @property({ type: Number }) max = 0;

  @state() private _rowCount = 0;

  @state() private _formStepsActive = false;
  @state() private _formStepsEditIndex = -1;
  private _rowData: Map<number, Record<string, string>> = new Map();

  private _template: Node[] = [];
  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  private _templateCaptured = false;

  /** Current number of rows. */
  get rowCount(): number {
    return this._rowCount;
  }

  override connectedCallback(): void {
    // Capture children as a clonable template before Lit's first render
    // destroys them (Light DOM). Only capture on first connection.
    if (!this._templateCaptured) {
      this._template = Array.from(this.childNodes).map(n => n.cloneNode(true));
      this._templateCaptured = true;
    }
    super.connectedCallback();
    // Seed `_rowCount` before the first render so the template (e.g. the
    // "Add" button's `canAdd` check) reflects the right count. Doing this
    // in `firstUpdated` would mutate reactive state after the update
    // committed, triggering a second render. The actual row DOM is appended
    // in `firstUpdated` since it needs the rendered list container.
    this._rowCount = this.mode === 'form-steps' ? 0 : Math.max(this.min, 1);
  }

  override firstUpdated(): void {
    if (this.mode === 'form-steps') return;
    for (let i = 0; i < this._rowCount; i++) {
      this._appendRow(i);
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const canAdd = this.max === 0 || this._rowCount < this.max;
    const showList = !this._formStepsActive;

    const legendText = this._formStepsActive
      ? (this._formStepsEditIndex >= 0
          ? interpolate(t('repeaterFormStepsEditTitle'), { item: this.itemLabel, index: String(this._formStepsEditIndex + 1) })
          : interpolate(t('repeaterFormStepsAddTitle'), { item: this.itemLabel }))
      : this.legend;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${showList ? describedBy || nothing : nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: legendText, required: showList ? this.required : false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: showList ? this.hint : '', errorId: this._errorId, error: showList ? this.error : '', fieldset: true })}

        <div
          data-civ-repeater-rows
          class="${this._formStepsActive ? 'civ-hidden' : ''}"
          @click="${this._onRowsClick}"
        ></div>

        ${this._formStepsActive ? html`
          <div
            data-civ-repeater-form-steps
            @civ-step-complete="${this._onStepComplete}"
          ></div>
          <div class="civ-mt-4">
            <civ-button
              variant="secondary"
              label="${t('repeaterCancelButton')}"
              @click="${this._cancelFormSteps}"
            ></civ-button>
          </div>
        ` : nothing}

        ${showList && canAdd ? html`
          <civ-button
            variant="secondary"
            icon-start="plus"
            label="${interpolate(t('repeaterAddButton'), { item: this.itemLabel })}"
            ?disabled="${this.disabled}"
            @click="${this.mode === 'form-steps' ? this._openFormStepsForAdd : this._addRow}"
            class="civ-mt-3"
          ></civ-button>
        ` : nothing}
      </fieldset>
    `;
  }

  /**
   * Delegated click handler bound via Lit on `[data-civ-repeater-rows]`.
   * Dispatches to remove / edit based on the action attribute on the
   * clicked button. Routing through one Lit-managed listener keeps every
   * per-row button cleanup-free (Lit disconnects this listener on host
   * teardown).
   */
  private _onRowsClick = (e: Event): void => {
    const target = (e.target as Element | null)?.closest<HTMLElement>(
      '[data-civ-repeater-action]',
    );
    if (!target) return;
    const row = target.closest('[data-civ-repeater-row]');
    if (!row) return;
    const index = this._getRowIndex(row);
    if (index < 0) return;
    const action = target.getAttribute('data-civ-repeater-action');
    if (action === 'remove') {
      this.removeRow(index);
    } else if (action === 'edit') {
      this._openFormStepsForEdit(index);
    }
  };

  /**
   * Delegated `civ-step-complete` listener bound via Lit on
   * `[data-civ-repeater-form-steps]`. Replaces the per-form-step
   * AbortController previously used to deregister the listener — Lit
   * owns the lifecycle now.
   */
  private _onStepComplete = (): void => {
    const index = this._formStepsEditIndex >= 0 ? this._formStepsEditIndex : this._rowCount;
    this._saveFormSteps(index);
  };

  /** Programmatically add a row. */
  addRow(): void {
    if (this.max > 0 && this._rowCount >= this.max) return;
    this._addRow();
  }

  /** Programmatically remove a row by index. */
  removeRow(index: number): void {
    // Close form-steps if editing the row being removed
    if (this._formStepsActive && this._formStepsEditIndex === index) {
      this._formStepsActive = false;
      this._formStepsEditIndex = -1;
    } else if (this._formStepsActive && this._formStepsEditIndex > index) {
      // Adjust edit index if a row before it was removed
      this._formStepsEditIndex--;
    }
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const rows = this._getRows();
    if (index < 0 || index >= rows.length) return;
    if (this._rowCount <= this.min) {
      announce(
        interpolate(t('repeaterMinReached'), { min: String(this.min), item: this.itemLabel }),
        'assertive',
      );
      return;
    }
    rows[index].remove();
    this._rowCount--;
    // Clean up stored data for form-steps mode
    if (this.mode === 'form-steps') {
      this._rowData.delete(index);
      const reindexed = new Map<number, Record<string, string>>();
      let i = 0;
      for (const [, value] of [...this._rowData.entries()].sort(([a], [b]) => a - b)) {
        reindexed.set(i, value);
        i++;
      }
      this._rowData = reindexed;
    }
    this._reindexRows();
    dispatch(this, 'civ-repeater-remove', { index });
    announce(interpolate(t('repeaterItemRemoved'), { item: this.itemLabel, index: String(index + 1) }));

    // Move focus to the nearest remaining row, or the add button
    requestAnimationFrame(() => {
      const remaining = container.querySelectorAll(':scope > [data-civ-repeater-row]');
      const focusIdx = Math.min(index, remaining.length - 1);
      if (focusIdx >= 0 && remaining[focusIdx]) {
        const focusTarget = remaining[focusIdx].querySelector<HTMLElement>(
          'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        focusTarget?.focus();
      } else {
        // No rows left at min — focus the add button
        const addBtn = this.querySelector<HTMLElement>(':scope > fieldset > civ-button');
        addBtn?.focus();
      }
    });
  }

  private _addRow(): void {
    if (this.max > 0 && this._rowCount >= this.max) return;
    const index = this._rowCount;
    this._appendRow(index);
    this._rowCount++;
    dispatch(this, 'civ-repeater-add', { index });
    announce(interpolate(t('repeaterItemAdded'), { item: this.itemLabel, index: String(index + 1) }));
  }

  private _appendRow(index: number): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;

    const row = document.createElement('div');
    row.setAttribute('data-civ-repeater-row', String(index));
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label',
      interpolate(t('repeaterItemLabel'), { item: this.itemLabel, index: String(index + 1) }));
    row.classList.add('civ-repeater-row', 'civ-card');

    // Inline mode — clone template directly into row
    for (const node of this._template) {
      row.appendChild(node.cloneNode(true));
    }

    // Index field names
    this._indexRowFields(row, index);

    // Add remove button if allowed. Click is handled by the delegated
    // `_onRowsClick` listener bound via Lit on the rows container — keeping
    // listener lifecycle owned by Lit (auto-cleanup on host disconnect).
    if (this._rowCount >= this.min || index >= this.min) {
      const removeBtn = document.createElement('civ-action-button');
      removeBtn.setAttribute('variant', 'tertiary');
      removeBtn.setAttribute('danger', '');
      removeBtn.setAttribute('label', t('repeaterRemoveButton'));
      removeBtn.classList.add('civ-mt-2');
      removeBtn.setAttribute('data-civ-repeater-action', 'remove');
      removeBtn.setAttribute('aria-label',
        interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
      row.appendChild(removeBtn);
    }

    container.appendChild(row);
  }

  /** Get all row elements from the container. */
  private _getRows(): NodeListOf<Element> {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return document.querySelectorAll('.civ-never-match');
    return container.querySelectorAll(':scope > [data-civ-repeater-row]');
  }

  private _getRowIndex(row: Element): number {
    return Array.from(this._getRows()).indexOf(row);
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

  // ── Form-steps mode methods ──────────────────────────────────────

  private _openFormStepsForAdd = (): void => {
    if (this.max > 0 && this._rowCount >= this.max) return;
    this._formStepsEditIndex = -1;
    this._formStepsActive = true;
    dispatch(this, 'civ-repeater-form-steps-open', { index: this._rowCount, isNew: true });
    void this._afterUpdate('opening form steps for add', () => this._buildFormSteps(this._rowCount));
  };

  private _openFormStepsForEdit(index: number): void {
    this._formStepsEditIndex = index;
    this._formStepsActive = true;
    dispatch(this, 'civ-repeater-form-steps-open', { index, isNew: false });
    void this._afterUpdate('opening form steps for edit', () => {
      this._buildFormSteps(index);
      this._populateFormStepsFromRowData(index);
    });
  }

  /**
   * Run a callback after the next render completes, surfacing any
   * thrown error to the console with a context tag rather than
   * swallowing it as an unobserved promise rejection.
   */
  private async _afterUpdate(context: string, fn: () => void): Promise<void> {
    try {
      await this.updateComplete;
      fn();
    } catch (err) {
      console.error(`civ-repeater: failed after update (${context})`, err);
    }
  }

  private _buildFormSteps(index: number): void {
    const container = this.querySelector('[data-civ-repeater-form-steps]');
    if (!container) return;

    container.innerHTML = '';

    const formStep = document.createElement('civ-form-step');
    formStep.setAttribute('complete-label',
      interpolate(t('repeaterSaveButton'), { item: this.itemLabel }));
    if (this.formStepsSensitive) formStep.setAttribute('sensitive', '');
    if (this.formStepsShowPause) formStep.setAttribute('show-pause', '');

    for (const node of this._template) {
      const clone = node.cloneNode(true);
      if (clone instanceof Element) {
        this._indexStepFields(clone, index);
      }
      formStep.appendChild(clone);
    }

    // The civ-step-complete listener lives on the form-steps container
    // (bound via Lit's @civ-step-complete in render). Events bubble up
    // from this civ-form-step and are picked up by `_onStepComplete`.
    container.appendChild(formStep);
  }

  private _indexStepFields(el: Element, index: number): void {
    const prefix = this.name || 'items';
    // The element may be a step div itself or a parent containing steps.
    // Index all [name] children within step divs.
    const stepDivs = el.hasAttribute('data-step-label')
      ? [el]
      : Array.from(el.querySelectorAll('[data-step-label]'));

    for (const stepDiv of stepDivs) {
      for (const child of stepDiv.children) {
        const baseName = child.getAttribute('name');
        if (!baseName || baseName.includes('[')) continue;
        child.setAttribute('name', `${prefix}[${index}].${baseName}`);
      }
    }
  }

  private _populateFormStepsFromRowData(index: number): void {
    const data = this._rowData.get(index);
    if (!data) return;
    const container = this.querySelector('[data-civ-repeater-form-steps]');
    if (!container) return;

    requestAnimationFrame(() => {
      for (const [fieldName, value] of Object.entries(data)) {
        const escaped = fieldName.replace(/["\\]/g, '\\$&');
        const field = container.querySelector(`[name="${escaped}"]`) as HTMLElement & { value?: string } | null;
        if (field && 'value' in field) {
          field.value = value;
        }
      }
    });
  }

  private _saveFormSteps(index: number): void {
    const container = this.querySelector('[data-civ-repeater-form-steps]');
    if (!container) return;

    // Extract field values from form-steps
    const data: Record<string, string> = {};
    const fields = container.querySelectorAll('[name]');
    for (const field of fields) {
      const name = field.getAttribute('name');
      const val = (field as HTMLElement & { value?: string }).value;
      // Only capture CivUI components (which have tagName starting with CIV-)
      // or standard form elements, not their internal rendered inputs
      if (name && val !== undefined && (field.tagName.startsWith('CIV-') || field.tagName === 'INPUT' || field.tagName === 'SELECT' || field.tagName === 'TEXTAREA')) {
        data[name] = val;
      }
    }

    const isNew = this._formStepsEditIndex < 0;

    // Re-check max in case rows were added externally
    if (isNew && this.max > 0 && this._rowCount >= this.max) return;

    this._rowData.set(index, data);

    if (isNew) {
      this._addFormStepsSummaryCard(index, data);
      this._rowCount++;
      dispatch(this, 'civ-repeater-add', { index });
      announce(interpolate(t('repeaterItemAdded'), { item: this.itemLabel, index: String(index + 1) }));
    } else {
      this._updateFormStepsSummaryCard(index, data);
      announce(interpolate(t('repeaterItemSaved'), { item: this.itemLabel, index: String(index + 1) }));
    }

    dispatch(this, 'civ-repeater-form-steps-close', { index, action: 'save' });
    this._formStepsActive = false;
    this._formStepsEditIndex = -1;

    void this._afterUpdate('restoring focus after save', () => {
      if (isNew) {
        this.querySelector<HTMLElement>(':scope > fieldset > civ-button')?.focus();
      } else {
        const rows = this.querySelectorAll('[data-civ-repeater-row]');
        rows[index]?.querySelector<HTMLElement>('civ-action-button')?.focus();
      }
    });
  }

  private _cancelFormSteps(): void {
    const index = this._formStepsEditIndex >= 0 ? this._formStepsEditIndex : this._rowCount;
    dispatch(this, 'civ-repeater-form-steps-close', { index, action: 'cancel' });
    this._formStepsActive = false;
    this._formStepsEditIndex = -1;

    void this._afterUpdate('restoring focus after cancel', () => {
      this.querySelector<HTMLElement>(':scope > fieldset > civ-button')?.focus();
    });
  }

  private _addFormStepsSummaryCard(index: number, data: Record<string, string>): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;

    const row = document.createElement('div');
    row.setAttribute('data-civ-repeater-row', String(index));
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label',
      interpolate(t('repeaterItemLabel'), { item: this.itemLabel, index: String(index + 1) }));
    row.classList.add('civ-repeater-row', 'civ-card');

    const summary = document.createElement('div');
    summary.setAttribute('data-civ-repeater-summary', '');
    summary.classList.add('civ-list-item');

    const summaryText = document.createElement('span');
    summaryText.classList.add('civ-list-item__content', 'civ-font-medium');
    summaryText.textContent = this._buildFormStepsSummaryText(data, index);
    summary.appendChild(summaryText);

    const actions = document.createElement('span');
    actions.classList.add('civ-list-item__actions');

    // Edit + remove clicks are handled by the delegated `_onRowsClick`
    // listener bound via Lit on the rows container — keeping listener
    // lifecycle owned by Lit (auto-cleanup on host disconnect).
    const editBtn = document.createElement('civ-action-button');
    editBtn.setAttribute('variant', 'tertiary');
    editBtn.setAttribute('label', t('repeaterEditButton'));
    editBtn.setAttribute('data-civ-repeater-action', 'edit');
    editBtn.setAttribute('aria-label',
      interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
    actions.appendChild(editBtn);

    const removeBtn = document.createElement('civ-action-button');
    removeBtn.setAttribute('variant', 'tertiary');
    removeBtn.setAttribute('danger', '');
    removeBtn.setAttribute('label', t('repeaterRemoveButton'));
    removeBtn.setAttribute('data-civ-repeater-action', 'remove');
    removeBtn.setAttribute('aria-label',
      interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
    actions.appendChild(removeBtn);

    summary.appendChild(actions);
    row.appendChild(summary);
    container.appendChild(row);
  }

  private _updateFormStepsSummaryCard(index: number, data: Record<string, string>): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const row = container.querySelectorAll(':scope > [data-civ-repeater-row]')[index];
    if (!row) return;
    const summaryText = row.querySelector('[data-civ-repeater-summary] > span') as HTMLElement | null;
    if (summaryText) {
      summaryText.textContent = this._buildFormStepsSummaryText(data, index);
    }
  }

  private _buildFormStepsSummaryText(data: Record<string, string>, index: number): string {
    const values = Object.values(data)
      .filter(v => v && v.trim() && !v.startsWith('{'))  // Skip empty and JSON blobs
      .slice(0, 3);
    return values.length > 0
      ? values.join(', ')
      : `${this.itemLabel} ${index + 1}`;
  }

  // ── Row management ──────────────────────────────────────────

  private _reindexRows(): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const rows = container.querySelectorAll(':scope > [data-civ-repeater-row]');
    rows.forEach((row, i) => {
      row.setAttribute('data-civ-repeater-row', String(i));
      row.setAttribute('aria-label',
        interpolate(t('repeaterItemLabel'), { item: this.itemLabel, index: String(i + 1) }));

      // Inline mode — reindex direct children
      for (const child of row.children) {
        const current = child.getAttribute('name');
        if (!current) continue;
        const newName = current.replace(/\[\d+\]/, `[${i}]`);
        child.setAttribute('name', newName);
      }

      // Update remove button aria-label
      const removeBtn = row.querySelector('civ-action-button[danger]');
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
