import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, announce, interpolate, t } from '@civui/core';
import '@civui/inputs';
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
  @property({ type: String }) mode: 'inline' | 'detail' | 'wizard' = 'inline';

  /** Hint text displayed below the legend. */
  @property({ type: String }) hint = '';

  /** Error text displayed below the hint. */
  @property({ type: String }) error = '';

  /** Whether at least one row is required. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Whether the component is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Mark the wizard sub-flow as emotionally sensitive (wizard mode only). */
  @property({ type: Boolean, attribute: 'wizard-sensitive' }) wizardSensitive = false;

  /** Show "Save and come back later" in the wizard sub-flow (wizard mode only). */
  @property({ type: Boolean, attribute: 'wizard-show-pause' }) wizardShowPause = false;

  /** Minimum number of rows. Defaults to 1. */
  @property({ type: Number }) min = 1;

  /** Maximum number of rows. 0 = unlimited. */
  @property({ type: Number }) max = 0;

  @state() private _rowCount = 0;

  @state() private _editingIdx = -1;

  @state() private _wizardActive = false;
  @state() private _wizardEditIndex = -1;
  private _rowData: Map<number, Record<string, string>> = new Map();
  private _wizardAbort: AbortController | null = null;

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
    if (this.mode === 'wizard') {
      // Wizard mode starts with an empty list — rows are added via the wizard flow
      this._rowCount = 0;
      return;
    }
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
    const showList = !this._wizardActive;

    const legendText = this._wizardActive
      ? (this._wizardEditIndex >= 0
          ? interpolate(t('repeaterWizardEditTitle'), { item: this.itemLabel, index: String(this._wizardEditIndex + 1) })
          : interpolate(t('repeaterWizardAddTitle'), { item: this.itemLabel }))
      : this.legend;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${showList ? describedBy || nothing : nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: legendText, required: showList ? this.required : false, textSizeClass: '' }), hintId: this._hintId, hint: showList ? this.hint : '', errorId: this._errorId, error: showList ? this.error : '', fieldset: true })}

        <div data-civ-repeater-rows class="${this._wizardActive ? 'civ-hidden' : ''}"></div>

        ${this._wizardActive ? html`
          <div data-civ-repeater-wizard></div>
          <div class="civ-mt-4">
            <civ-button
              variant="secondary"
              label="${t('repeaterCancelButton')}"
              @click="${this._cancelWizard}"
            ></civ-button>
          </div>
        ` : nothing}

        ${showList && canAdd ? html`
          <civ-button
            variant="secondary"
            label="${interpolate(t('repeaterAddButton'), { item: this.itemLabel })}"
            ?disabled="${this.disabled}"
            @click="${this.mode === 'wizard' ? this._openWizardForAdd : this._addRow}"
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
    // Close wizard if editing the row being removed
    if (this._wizardActive && this._wizardEditIndex === index) {
      this._wizardAbort?.abort();
      this._wizardAbort = null;
      this._wizardActive = false;
      this._wizardEditIndex = -1;
    } else if (this._wizardActive && this._wizardEditIndex > index) {
      // Adjust edit index if a row before it was removed
      this._wizardEditIndex--;
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
    // Clean up stored data for wizard mode
    if (this.mode === 'wizard') {
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
      interpolate(t('repeaterItemLabel'), { item: this.itemLabel, index: String(index + 1) }));
    row.classList.add('civ-repeater-row', 'civ-card');

    if (this.mode === 'detail') {
      // Summary bar — visible when row is collapsed
      const summary = document.createElement('div');
      summary.setAttribute('data-civ-repeater-summary', '');
      summary.classList.add('civ-flex', 'civ-items-center', 'civ-justify-between', 'civ-p-2');

      const summaryText = document.createElement('span');
      summaryText.classList.add('civ-flex-1', 'civ-min-w-0', 'civ-font-medium');
      summaryText.textContent = `${this.itemLabel} ${index + 1}`;
      summary.appendChild(summaryText);

      const summaryActions = document.createElement('span');
      summaryActions.classList.add('civ-flex', 'civ-items-center', 'civ-gap-1', 'civ-shrink-0');

      const editBtn = document.createElement('civ-action-button');
      editBtn.setAttribute('variant', 'tertiary');
      editBtn.setAttribute('label', t('repeaterEditButton'));
      editBtn.setAttribute('aria-label',
        interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
      editBtn.addEventListener('click', () => {
        this._collapseAllRows();
        const idx = this._getRowIndex(row);
        this._expandRow(idx);
        this._editingIdx = idx;
        announce(interpolate(t('repeaterEditingAnnouncement'), { item: this.itemLabel, index: String(idx + 1) }));
      });
      summaryActions.appendChild(editBtn);

      if (this._rowCount >= this.min || index >= this.min) {
        const removeBtn = document.createElement('civ-action-button');
        removeBtn.setAttribute('variant', 'tertiary');
        removeBtn.setAttribute('danger', '');
        removeBtn.setAttribute('label', t('repeaterRemoveButton'));
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

      const saveBtn = document.createElement('civ-action-button');
      saveBtn.setAttribute('variant', 'primary');
      saveBtn.setAttribute('label', interpolate(t('repeaterSaveButton'), { item: this.itemLabel }));
      saveBtn.addEventListener('click', () => {
        this._collapseAllRows();
        this._updateSummaryText(row, this._getRowIndex(row));
        this._editingIdx = -1;
        announce(interpolate(t('repeaterItemSaved'), { item: this.itemLabel, index: String(this._getRowIndex(row) + 1) }));
      });
      detailActions.appendChild(saveBtn);

      const cancelBtn = document.createElement('civ-action-button');
      cancelBtn.setAttribute('variant', 'tertiary');
      cancelBtn.setAttribute('label', t('repeaterCancelButton'));
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
        const removeBtn = document.createElement('civ-action-button');
        removeBtn.setAttribute('variant', 'tertiary');
        removeBtn.setAttribute('danger', '');
        removeBtn.setAttribute('label', t('repeaterRemoveButton'));
        removeBtn.classList.add('civ-mt-2');
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

  // ── Wizard mode methods ──────────────────────────────────────

  private _openWizardForAdd = (): void => {
    if (this.max > 0 && this._rowCount >= this.max) return;
    this._wizardEditIndex = -1;
    this._wizardActive = true;
    dispatch(this, 'civ-repeater-wizard-open', { index: this._rowCount, isNew: true });
    this.updateComplete.then(() => this._buildWizard(this._rowCount));
  };

  private _openWizardForEdit(index: number): void {
    this._wizardEditIndex = index;
    this._wizardActive = true;
    dispatch(this, 'civ-repeater-wizard-open', { index, isNew: false });
    this.updateComplete.then(() => {
      this._buildWizard(index);
      this._populateWizardFromRowData(index);
    });
  }

  private _buildWizard(index: number): void {
    const container = this.querySelector('[data-civ-repeater-wizard]');
    if (!container) return;

    // Clean up previous wizard listeners
    this._wizardAbort?.abort();
    this._wizardAbort = new AbortController();
    container.innerHTML = '';

    const formStep = document.createElement('civ-form-step');
    formStep.setAttribute('complete-label',
      interpolate(t('repeaterSaveButton'), { item: this.itemLabel }));
    if (this.wizardSensitive) formStep.setAttribute('sensitive', '');
    if (this.wizardShowPause) formStep.setAttribute('show-pause', '');

    for (const node of this._template) {
      const clone = node.cloneNode(true);
      if (clone instanceof Element) {
        this._indexStepFields(clone, index);
      }
      formStep.appendChild(clone);
    }

    formStep.addEventListener('civ-step-complete', () => {
      this._saveWizard(index);
    }, { signal: this._wizardAbort.signal });

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

  private _populateWizardFromRowData(index: number): void {
    const data = this._rowData.get(index);
    if (!data) return;
    const container = this.querySelector('[data-civ-repeater-wizard]');
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

  private _saveWizard(index: number): void {
    const container = this.querySelector('[data-civ-repeater-wizard]');
    if (!container) return;

    // Extract field values from wizard
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

    const isNew = this._wizardEditIndex < 0;

    // Re-check max in case rows were added externally
    if (isNew && this.max > 0 && this._rowCount >= this.max) return;

    this._rowData.set(index, data);
    this._wizardAbort?.abort();
    this._wizardAbort = null;

    if (isNew) {
      this._addWizardSummaryCard(index, data);
      this._rowCount++;
      dispatch(this, 'civ-repeater-add', { index });
      announce(interpolate(t('repeaterItemAdded'), { item: this.itemLabel, index: String(index + 1) }));
    } else {
      this._updateWizardSummaryCard(index, data);
      announce(interpolate(t('repeaterItemSaved'), { item: this.itemLabel, index: String(index + 1) }));
    }

    dispatch(this, 'civ-repeater-wizard-close', { index, action: 'save' });
    this._wizardActive = false;
    this._wizardEditIndex = -1;

    this.updateComplete.then(() => {
      if (isNew) {
        this.querySelector<HTMLElement>(':scope > fieldset > civ-button')?.focus();
      } else {
        const rows = this.querySelectorAll('[data-civ-repeater-row]');
        rows[index]?.querySelector<HTMLElement>('civ-action-button')?.focus();
      }
    });
  }

  private _cancelWizard(): void {
    const index = this._wizardEditIndex >= 0 ? this._wizardEditIndex : this._rowCount;
    this._wizardAbort?.abort();
    this._wizardAbort = null;
    dispatch(this, 'civ-repeater-wizard-close', { index, action: 'cancel' });
    this._wizardActive = false;
    this._wizardEditIndex = -1;

    this.updateComplete.then(() => {
      this.querySelector<HTMLElement>(':scope > fieldset > civ-button')?.focus();
    });
  }

  private _addWizardSummaryCard(index: number, data: Record<string, string>): void {
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
    summaryText.textContent = this._buildWizardSummaryText(data, index);
    summary.appendChild(summaryText);

    const actions = document.createElement('span');
    actions.classList.add('civ-list-item__actions');

    const editBtn = document.createElement('civ-action-button');
    editBtn.setAttribute('variant', 'tertiary');
    editBtn.setAttribute('label', t('repeaterEditButton'));
    editBtn.setAttribute('aria-label',
      interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
    editBtn.addEventListener('click', () => {
      this._openWizardForEdit(this._getRowIndex(row));
    });
    actions.appendChild(editBtn);

    const removeBtn = document.createElement('civ-action-button');
    removeBtn.setAttribute('variant', 'tertiary');
    removeBtn.setAttribute('danger', '');
    removeBtn.setAttribute('label', t('repeaterRemoveButton'));
    removeBtn.setAttribute('aria-label',
      interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
    removeBtn.addEventListener('click', () => {
      this.removeRow(this._getRowIndex(row));
    });
    actions.appendChild(removeBtn);

    summary.appendChild(actions);
    row.appendChild(summary);
    container.appendChild(row);
  }

  private _updateWizardSummaryCard(index: number, data: Record<string, string>): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const row = container.querySelectorAll(':scope > [data-civ-repeater-row]')[index];
    if (!row) return;
    const summaryText = row.querySelector('[data-civ-repeater-summary] > span') as HTMLElement | null;
    if (summaryText) {
      summaryText.textContent = this._buildWizardSummaryText(data, index);
    }
  }

  private _buildWizardSummaryText(data: Record<string, string>, index: number): string {
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
        const editBtn = row.querySelector('civ-action-button');
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
