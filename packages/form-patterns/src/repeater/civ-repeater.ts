import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, announce, interpolate, sanitizeHref, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/actions/button';
import '@civui/actions/action-button';
import '@civui/actions/link';
import '../form-step/civ-form-step.js';
import type { RepeaterMode, RepeaterRow, RepeaterRowSummary } from './repeater-types.js';
import {
  resolveSummary,
  resolveEditHref,
  rowHeadingLevel,
  rowHeadingText,
} from './repeater-helpers.js';
import {
  appendInlineRow,
  appendFormStepsSummaryCard,
  buildFormStepShell,
  updateFormStepsSummaryText,
  extractFormStepsValues,
  isBooleanControl,
} from './repeater-row-builder.js';

export type { RepeaterRow, RepeaterRowSummary, RepeaterMode } from './repeater-types.js';

/**
 * CivUI Repeater
 *
 * "Add another" pattern for repeating form sections.
 *
 * Three display modes:
 *
 * - `mode="inline"` (default) — every row's fields are visible on the page.
 *   The repeater captures its slotted children as a template and clones
 *   one copy per row. Form field names are indexed automatically
 *   (`dependents[0].name`, `dependents[1].name`, …). Best for simple
 *   items with 1-3 fields.
 *
 * - `mode="form-steps"` — rows show as summary cards on the page;
 *   clicking Add or Edit replaces the list with an in-place
 *   `civ-form-step` wizard. The user stays on the same page; the URL
 *   doesn't change. Best for items with 4-10 fields where page context
 *   matters (modals, sensitive flows, hosts without routing).
 *
 * - `mode="route"` — rows show as summary cards driven by the
 *   host-owned `rows` prop. Add and Edit are real `<a href>` links
 *   pointing at host-rendered pages. Browser back, deep linking,
 *   right-click "open in new tab", and save-and-resume all work
 *   naturally. The repeater never mutates `rows` — Remove fires
 *   `civ-repeater-remove` and the host updates its array. Slotted
 *   children are ignored in this mode.
 *
 * @element civ-repeater
 *
 * @example inline
 * ```html
 * <civ-repeater legend="Phone numbers" name="phones" item-label="number">
 *   <civ-text-input label="Number" name="number"></civ-text-input>
 * </civ-repeater>
 * ```
 *
 * @example form-steps
 * ```html
 * <civ-repeater legend="Dependents" name="dependents" item-label="dependent" mode="form-steps" min="1" max="10">
 *   <div data-step-label="Name">
 *     <civ-text-input label="First name" name="firstName"></civ-text-input>
 *   </div>
 *   <div data-step-label="Contact">
 *     <civ-text-input label="Email" name="email"></civ-text-input>
 *   </div>
 * </civ-repeater>
 * ```
 *
 * @example route
 * ```html
 * <civ-repeater
 *   legend="Dependents"
 *   item-label="dependent"
 *   mode="route"
 *   .rows=${this.dependents}
 *   add-href="/dependents/new"
 *   edit-href-pattern="/dependents/{id}/edit"
 *   id-field="id"
 *   summary-fields="firstName,lastName"
 *   @civ-repeater-remove=${(e) => this.removeDependent(e.detail.id)}
 * ></civ-repeater>
 * ```
 *
 * @fires civ-repeater-add - (inline / form-steps) Row added, detail: { index: number }
 * @fires civ-repeater-before-remove - (inline / form-steps) Cancelable. Fires before a row is removed. `preventDefault()` aborts the removal — wire this up to insert a confirmation step (e.g. a `civ-modal`), then re-call `removeRow(index, { skipConfirm: true })` from the confirm handler.
 * @fires civ-repeater-remove - Row removed. inline/form-steps detail: { index }; route detail: { index, id, row }
 * @fires civ-repeater-form-steps-open - (form-steps) Wizard opens, detail: { index, isNew }
 * @fires civ-repeater-form-steps-close - (form-steps) Wizard closes, detail: { index, action: 'save' | 'cancel' }
 */
@customElement('civ-repeater')
export class CivRepeater extends CivBaseElement {
  // ── Public contract ─────────────────────────────────────────

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
   */
  @property({ type: String }) size?: LabelSize;

  /** Base name for indexed form fields. */
  @property({ type: String }) name = '';

  /** Human-readable label for each item (used in button text and announcements). */
  @property({ type: String, attribute: 'item-label' }) itemLabel = 'item';

  /**
   * Display mode:
   * - `inline` (default) — all row fields visible on the page.
   * - `form-steps` — rows show as summary cards; the multi-step form
   *   opens in place on add/edit (still on the same page).
   * - `route` — rows show as summary cards. Add/Edit are real `<a href>`
   *   links pointing at host-owned routes; the form lives on a separate
   *   page. The repeater is "controlled" — the host owns `rows`.
   */
  @property({ type: String }) mode: RepeaterMode = 'inline';

  // ── Route-mode props (ignored in inline / form-steps) ───────

  /**
   * Host-owned array of row data. The repeater renders one summary card
   * per entry but never mutates this array — when the user removes a
   * row, the repeater fires `civ-repeater-remove` and the host updates
   * the array.
   */
  @property({ type: Array, attribute: false }) rows: RepeaterRow[] = [];

  /**
   * URL the "Add" affordance links to. Rendered as a real `<a href>` so
   * right-click / middle-click / browser back / deep links all work.
   * Required when `mode === 'route'`.
   */
  @property({ type: String, attribute: 'add-href' }) addHref = '';

  /**
   * URL template for the "Edit" affordance on each row. Interpolates
   * `{id}` (from `row[idField]`) and `{index}` (zero-based) into the
   * pattern. Example: `/dependents/{id}/edit`. `{id}` is strongly
   * preferred — `{index}` makes bookmarks fragile.
   */
  @property({ type: String, attribute: 'edit-href-pattern' }) editHrefPattern = '';

  /** Name of the row property that holds a stable identifier. Defaults to `'id'`. */
  @property({ type: String, attribute: 'id-field' }) idField = 'id';

  /**
   * Comma-separated list of row property names to join into the summary
   * line on each card. Cross-platform alternative to `rowSummary`.
   */
  @property({ type: String, attribute: 'summary-fields' }) summaryFields = '';

  /**
   * Format string for the summary line with `{prop}` placeholders.
   * Cross-platform alternative to `rowSummary` with more control than
   * the comma-join of `summary-fields`.
   */
  @property({ type: String, attribute: 'summary-template' }) summaryTemplate = '';

  /**
   * Function called for each row to produce the summary line. Web-only —
   * for cross-platform hosts, use `summary-template` or `summary-fields`.
   */
  @property({ attribute: false }) rowSummary?: RepeaterRowSummary;

  /** Hint text displayed below the legend. */
  @property({ type: String }) hint = '';

  /**
   * Hint shown when the list is empty. Rendered between the header and
   * the Add button. Leave blank to omit.
   */
  @property({ type: String, attribute: 'empty-state-text' }) emptyStateText = '';

  /** Error text displayed below the hint. */
  @property({ type: String }) error = '';

  /** Whether the component is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Mark the form-steps sub-flow as emotionally sensitive (form-steps mode only). */
  @property({ type: Boolean, attribute: 'form-steps-sensitive' }) formStepsSensitive = false;

  /** Show "Save and come back later" in the form-steps sub-flow (form-steps mode only). */
  @property({ type: Boolean, attribute: 'form-steps-show-pause' }) formStepsShowPause = false;

  /**
   * Minimum number of rows. Defaults to 0 — the repeater renders just
   * the "Add" button on mount and the first row appears only after the
   * user clicks it. `min` also acts as the floor for removal.
   */
  @property({ type: Number }) min = 0;

  /** Maximum number of rows. 0 = unlimited. */
  @property({ type: Number }) max = 0;

  // ── Reactive state ──────────────────────────────────────────

  @state() private _rowCount = 0;
  @state() private _formStepsActive = false;
  @state() private _formStepsEditIndex = -1;

  // ── Internal (non-reactive) state ───────────────────────────

  /** Saved field values per form-steps row, keyed by row index. */
  private _rowData = new Map<number, Record<string, string>>();

  /** Captured slot children, cloned per row on append. */
  private _template: Node[] = [];

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  private _templateCaptured = false;

  /**
   * Stable id prefix for per-row heading ids. Computed once in
   * connectedCallback so heading ids stay constant across re-renders —
   * otherwise calling `generateId()` inside render() churns through
   * fresh ids on every update.
   */
  private _rowHeadingIdPrefix = '';

  /** Set of idFields already warned about — keeps the missing-id warning to once per (instance, idField). */
  private _missingIdFieldWarnings = new Set<string>();

  // ── Public getter ───────────────────────────────────────────

  /** Current number of rows. */
  get rowCount(): number {
    return this._rowCount;
  }

  // ── Lifecycle ───────────────────────────────────────────────

  override connectedCallback(): void {
    // Capture children as a clonable template before Lit's first render
    // destroys them (Light DOM). Only capture on first connection.
    //
    // Route mode is controlled — the host owns `rows` and there are no
    // slotted form-field children. Warn (in dev) if children are
    // present, since the consumer probably mis-applied the template
    // pattern from inline / form-steps.
    if (!this._templateCaptured) {
      if (this.mode === 'route') {
        const hasContent = Array.from(this.childNodes).some(
          n => n.nodeType !== Node.TEXT_NODE || (n.textContent ?? '').trim() !== '',
        );
        if (hasContent && typeof console !== 'undefined') {
          console.warn(
            '[civ-repeater] In route mode, slotted children are ignored — pass row data via the `rows` prop. The form lives on the destination page (add-href / edit-href-pattern).',
          );
        }
        this._template = [];
      } else {
        this._template = Array.from(this.childNodes).map(n => n.cloneNode(true));
      }
      this._templateCaptured = true;
    }
    super.connectedCallback();

    if (!this._rowHeadingIdPrefix) {
      this._rowHeadingIdPrefix = this.generateId('row');
    }
    // Seed _rowCount before the first render so the template's canAdd
    // check reflects the right count. Route mode is rendered from `rows`
    // so the imperative count stays zero.
    if (this.mode !== 'route') {
      this._rowCount = this.min;
    }
  }

  override firstUpdated(): void {
    // Only inline mode appends rows imperatively at mount. form-steps
    // starts empty (rows are added when the user saves the wizard), and
    // route mode renders declaratively from `rows`.
    if (this.mode !== 'inline') return;
    for (let i = 0; i < this._rowCount; i++) {
      this._appendRow(i);
    }
  }

  override render() {
    if (this.mode === 'route') return this._renderRouted();

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
        ${renderFormHeader({
          label: renderLegend({ legend: legendText, required: false, headingLevel: this.headingLevel, size: this.size }),
          hintId: this._hintId,
          hint: showList ? this.hint : '',
          errorId: this._errorId,
          error: showList ? this.error : '',
          fieldset: true,
        })}

        <div
          data-civ-repeater-rows
          class="${this._formStepsActive ? 'civ-hidden' : ''}"
          @click="${this._onRowsClick}"
        ></div>

        ${showList && this._rowCount === 0 && this.emptyStateText ? html`
          <p class="civ-repeater__empty-state">${this.emptyStateText}</p>
        ` : nothing}

        ${this._formStepsActive ? html`
          <div
            data-civ-repeater-form-steps
            @civ-step-complete="${this._onStepComplete}"
          ></div>
          <div class="civ-mt-4">
            <civ-button
              emphasis="secondary"
              label="${t('repeaterCancelButton')}"
              @click="${this._cancelFormSteps}"
            ></civ-button>
          </div>
        ` : nothing}

        ${showList && canAdd ? html`
          <civ-button
            emphasis="secondary"
            icon-start="plus"
            label="${interpolate(t(this._rowCount === 0 ? 'repeaterAddFirstButton' : 'repeaterAddButton'), { item: this.itemLabel })}"
            ?disabled="${this.disabled}"
            @click="${this.mode === 'form-steps' ? this._openFormStepsForAdd : this._addRow}"
            class="civ-mt-3"
          ></civ-button>
        ` : nothing}

        ${showList && !canAdd && this.max > 0 ? html`
          <p class="civ-repeater__max-hint civ-mt-3" role="status">
            ${interpolate(t('repeaterMaxReached'), { max: String(this.max), item: this.itemLabel })}
          </p>
        ` : nothing}
      </fieldset>
    `;
  }

  // ── Declarative route-mode render ───────────────────────────

  private _renderRouted() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const canAdd = this.max === 0 || this.rows.length < this.max;
    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({
          label: renderLegend({ legend: this.legend, required: false, headingLevel: this.headingLevel, size: this.size }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
          fieldset: true,
        })}

        <div data-civ-repeater-rows>
          ${this.rows.map((row, i) => this._renderRoutedSummaryCard(row, i))}
        </div>

        ${this.rows.length === 0 && this.emptyStateText ? html`
          <p class="civ-repeater__empty-state">${this.emptyStateText}</p>
        ` : nothing}

        ${canAdd && this.addHref ? html`
          <civ-button
            href="${sanitizeHref(this.addHref)}"
            emphasis="secondary"
            icon-start="plus"
            label="${interpolate(t(this.rows.length === 0 ? 'repeaterAddFirstButton' : 'repeaterAddButton'), { item: this.itemLabel })}"
            class="civ-mt-3"
          ></civ-button>
        ` : nothing}

        ${!canAdd && this.max > 0 ? html`
          <p class="civ-repeater__max-hint civ-mt-3" role="status">
            ${interpolate(t('repeaterMaxReached'), { max: String(this.max), item: this.itemLabel })}
          </p>
        ` : nothing}
      </fieldset>
    `;
  }

  private _renderRoutedSummaryCard(row: RepeaterRow, index: number) {
    const headingId = `${this._rowHeadingIdPrefix}-${index}-heading`;
    const editHref = resolveEditHref(row, index, {
      editHrefPattern: this.editHrefPattern,
      idField: this.idField,
      onMissingId: (idField) => {
        if (typeof console === 'undefined' || this._missingIdFieldWarnings.has(idField)) return;
        this._missingIdFieldWarnings.add(idField);
        console.warn(
          `[civ-repeater] edit-href-pattern uses {id} but at least one row has no "${idField}" — falling back to {index}. Set id-field= to the row's stable identifier to keep bookmarks stable.`,
        );
      },
    });
    return html`
      <div
        data-civ-repeater-row="${index}"
        role="group"
        aria-labelledby="${headingId}"
        class="civ-repeater-row civ-card"
      >
        ${this._renderRowHeadingTemplate(headingId, rowHeadingText(this.itemLabel, index))}
        <div class="civ-list-item">
          <span class="civ-list-item__content civ-font-medium">
            ${this._resolveSummary(row, index)}
          </span>
          <span class="civ-list-item__actions">
            ${editHref ? html`
              <civ-action-button
                emphasis="tertiary"
                href="${editHref}"
                label="${t('repeaterEditButton')}"
                aria-label="${interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(index + 1) })}"
              ></civ-action-button>
            ` : nothing}
            <civ-action-button
              emphasis="tertiary"
              danger
              label="${interpolate(t('repeaterRemoveLabel'), { item: this.itemLabel })}"
              aria-label="${interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) })}"
              @click="${() => this._removeRoutedRow(index)}"
            ></civ-action-button>
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Lit can't interpolate tag names, so the helper switches on the
   * computed heading level to emit a real h1–h6 element (preferred
   * over `<div role="heading">` for proper document outline semantics).
   * The imperative path uses `buildRowHeading` from the row-builder
   * module — both share `rowHeadingLevel` + `rowHeadingText` for the
   * level / text logic.
   */
  private _renderRowHeadingTemplate(headingId: string, text: string) {
    const cls = 'civ-repeater__row-heading';
    switch (rowHeadingLevel(this.headingLevel)) {
      case 1: return html`<h1 id="${headingId}" class="${cls}">${text}</h1>`;
      case 2: return html`<h2 id="${headingId}" class="${cls}">${text}</h2>`;
      case 3: return html`<h3 id="${headingId}" class="${cls}">${text}</h3>`;
      case 4: return html`<h4 id="${headingId}" class="${cls}">${text}</h4>`;
      case 5: return html`<h5 id="${headingId}" class="${cls}">${text}</h5>`;
      default: return html`<h6 id="${headingId}" class="${cls}">${text}</h6>`;
    }
  }

  private _resolveSummary(row: RepeaterRow, index: number): string {
    return resolveSummary(row, index, {
      rowSummary: this.rowSummary,
      summaryTemplate: this.summaryTemplate,
      summaryFields: this.summaryFields,
      itemLabel: this.itemLabel,
    });
  }

  // ── Event handlers ──────────────────────────────────────────

  private _removeRoutedRow(index: number): void {
    const row = this.rows[index];
    if (row == null) return;
    if (this.rows.length <= this.min) {
      announce(
        interpolate(t('repeaterMinReached'), { min: String(this.min), item: this.itemLabel }),
        'assertive',
      );
      return;
    }
    const id = row[this.idField];
    dispatch(this, 'civ-repeater-remove', { index, id, row });
    announce(interpolate(t('repeaterItemRemoved'), { item: this.itemLabel, index: String(index + 1) }));
  }

  /**
   * Delegated click handler on `[data-civ-repeater-rows]`. Dispatches
   * to remove / edit based on the `data-civ-repeater-action` attribute
   * on the clicked button. One Lit-managed listener cleans up all
   * per-row buttons on host disconnect.
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
   * Delegated `civ-step-complete` handler on `[data-civ-repeater-form-steps]`.
   * Lit owns the listener lifecycle.
   */
  private _onStepComplete = (): void => {
    const index = this._formStepsEditIndex >= 0 ? this._formStepsEditIndex : this._rowCount;
    this._saveFormSteps(index);
  };

  // ── Public imperative API ───────────────────────────────────

  /** Programmatically add a row. */
  addRow(): void {
    if (this.max > 0 && this._rowCount >= this.max) return;
    this._addRow();
  }

  /**
   * Programmatically remove a row by index.
   *
   * Fires a cancelable `civ-repeater-before-remove` event first.
   * Consumers wire confirmation (typically a `civ-modal`) by listening
   * for that event and calling `e.preventDefault()` to abort. From the
   * confirm handler they call `removeRow(index, { skipConfirm: true })`
   * to actually perform the removal.
   */
  removeRow(index: number, opts: { skipConfirm?: boolean } = {}): void {
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
    if (!opts.skipConfirm) {
      const allowed = dispatch(this, 'civ-repeater-before-remove', { index }, /* cancelable */ true);
      if (!allowed) return;
    }
    // Close form-steps if editing the row being removed. Done AFTER the
    // cancelable hook so consumers preventing default don't see the
    // wizard collapse out from under them.
    if (this._formStepsActive && this._formStepsEditIndex === index) {
      this._formStepsActive = false;
      this._formStepsEditIndex = -1;
    } else if (this._formStepsActive && this._formStepsEditIndex > index) {
      this._formStepsEditIndex--;
    }
    rows[index].remove();
    this._rowCount--;
    if (this.mode === 'form-steps') {
      this._rowData.delete(index);
      const reindexed = new Map<number, Record<string, string>>();
      let i = 0;
      for (const [, value] of [...this._rowData.entries()].sort(([a], [b]) => a - b)) {
        // The stored field-name keys embed the row index
        // (`deps[2].firstName`). Renumbering only the Map key isn't enough:
        // a later edit rebuilds the form-step with the NEW index
        // (`deps[1].firstName`), and _populateFormStepsFromRowData queries
        // by name — so the saved values would silently fail to populate
        // unless the embedded index is rewritten too.
        const rekeyed: Record<string, string> = {};
        for (const [k, v] of Object.entries(value)) {
          rekeyed[k.replace(/\[\d+\]/, `[${i}]`)] = v;
        }
        reindexed.set(i, rekeyed);
        i++;
      }
      this._rowData = reindexed;
    }
    this._reindexRows();
    dispatch(this, 'civ-repeater-remove', { index });
    announce(interpolate(t('repeaterItemRemoved'), { item: this.itemLabel, index: String(index + 1) }));

    requestAnimationFrame(() => {
      const remaining = container.querySelectorAll(':scope > [data-civ-repeater-row]');
      const focusIdx = Math.min(index, remaining.length - 1);
      if (focusIdx >= 0 && remaining[focusIdx]) {
        const focusTarget = remaining[focusIdx].querySelector<HTMLElement>(
          'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        focusTarget?.focus();
      } else {
        const addBtn = this.querySelector<HTMLElement>(':scope > fieldset > civ-button');
        addBtn?.focus();
      }
    });
  }

  // ── Inline-mode row management ──────────────────────────────

  private _addRow(): void {
    if (this.max > 0 && this._rowCount >= this.max) return;
    const index = this._rowCount;
    this._appendRow(index);
    this._rowCount++;
    dispatch(this, 'civ-repeater-add', { index });
    announce(interpolate(t('repeaterItemAdded'), { item: this.itemLabel, index: String(index + 1) }));

    // Move focus into the new row's first focusable so keyboard users
    // (and AT) land where the new content is. Without this, focus
    // stays on the "Add another" button and they have to Tab back up
    // through the form to find the new fields. Mirrors the focus
    // restoration in removeRow().
    requestAnimationFrame(() => {
      const container = this.querySelector('[data-civ-repeater-rows]');
      const rows = container?.querySelectorAll(':scope > [data-civ-repeater-row]');
      const newRow = rows?.[index];
      if (newRow) {
        const focusTarget = newRow.querySelector<HTMLElement>(
          'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        focusTarget?.focus();
      }
    });
  }

  private _appendRow(index: number): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    appendInlineRow({
      container,
      template: this._template,
      index,
      baseName: this.name,
      itemLabel: this.itemLabel,
      idPrefix: this._rowHeadingIdPrefix,
      legendLevel: this.headingLevel,
      min: this.min,
      rowCount: this._rowCount,
    });
  }

  // ── Form-steps mode ─────────────────────────────────────────
  //
  // Why these methods live on the host rather than in a separate
  // controller / strategy file:
  //
  // 1. The DOM-building work for form-steps rows is already extracted —
  //    `appendFormStepsSummaryCard`, `updateFormStepsSummaryText`,
  //    `buildFormStepShell`, `extractFormStepsValues` are pure
  //    builders in `repeater-row-builder.ts` and unit-tested there.
  // 2. What remains here is orchestration: toggling `_formStepsActive`
  //    / `_formStepsEditIndex` (both `@state`, which means Lit's
  //    reactivity is built into the host), maintaining the `_rowData`
  //    Map across reindex on remove, dispatching events, and focus
  //    restoration via `_afterUpdate`.
  // 3. A Lit `ReactiveController` could own that state, but every
  //    state mutation would need an explicit `host.requestUpdate()`,
  //    and the `_rowData` reindex logic in `removeRow()` would still
  //    need to reach in. Net cost (indirection + manual updates)
  //    exceeds the benefit (~80 lines moved into a wrapper file) for
  //    a single consumer.
  //
  // Revisit if a second component needs the same pattern.

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
   * thrown error rather than swallowing as an unobserved promise rejection.
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
    const formStep = buildFormStepShell({
      template: this._template,
      index,
      itemLabel: this.itemLabel,
      baseName: this.name,
      sensitive: this.formStepsSensitive,
      showPause: this.formStepsShowPause,
    });
    container.appendChild(formStep);
  }

  private _populateFormStepsFromRowData(index: number): void {
    const data = this._rowData.get(index);
    if (!data) return;
    const container = this.querySelector('[data-civ-repeater-form-steps]');
    if (!container) return;

    requestAnimationFrame(() => {
      for (const [fieldName, value] of Object.entries(data)) {
        const escaped = fieldName.replace(/["\\]/g, '\\$&');
        const field = container.querySelector(`[name="${escaped}"]`) as
          | (HTMLElement & { value?: string; checked?: boolean })
          | null;
        if (!field) continue;
        if (isBooleanControl(field)) {
          // Stored empty = unchecked, non-empty = checked (see extract).
          field.checked = value !== '';
        } else if ('value' in field) {
          field.value = value;
        }
      }
    });
  }

  private _saveFormSteps(index: number): void {
    const container = this.querySelector('[data-civ-repeater-form-steps]');
    if (!container) return;

    const data = extractFormStepsValues(container);
    const isNew = this._formStepsEditIndex < 0;

    if (isNew && this.max > 0 && this._rowCount >= this.max) return;

    this._rowData.set(index, data);

    if (isNew) {
      const rowsContainer = this.querySelector('[data-civ-repeater-rows]');
      if (rowsContainer) {
        appendFormStepsSummaryCard({
          container: rowsContainer,
          data,
          index,
          itemLabel: this.itemLabel,
          idPrefix: this._rowHeadingIdPrefix,
          legendLevel: this.headingLevel,
        });
      }
      this._rowCount++;
      dispatch(this, 'civ-repeater-add', { index });
      announce(interpolate(t('repeaterItemAdded'), { item: this.itemLabel, index: String(index + 1) }));
    } else {
      const row = this.querySelectorAll('[data-civ-repeater-row]')[index];
      if (row) updateFormStepsSummaryText(row, data, index, this.itemLabel);
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

  // ── Shared row utilities ────────────────────────────────────

  private _getRows(): NodeListOf<Element> {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return document.querySelectorAll('.civ-never-match');
    return container.querySelectorAll(':scope > [data-civ-repeater-row]');
  }

  private _getRowIndex(row: Element): number {
    return Array.from(this._getRows()).indexOf(row);
  }

  private _reindexRows(): void {
    const container = this.querySelector('[data-civ-repeater-rows]');
    if (!container) return;
    const rows = container.querySelectorAll(':scope > [data-civ-repeater-row]');
    rows.forEach((row, i) => {
      row.setAttribute('data-civ-repeater-row', String(i));

      const heading = row.querySelector('.civ-repeater__row-heading');
      if (heading) heading.textContent = rowHeadingText(this.itemLabel, i);

      // Inline mode — reindex direct children's [name] attributes
      for (const child of row.children) {
        const current = child.getAttribute('name');
        if (!current) continue;
        const newName = current.replace(/\[\d+\]/, `[${i}]`);
        child.setAttribute('name', newName);
      }

      // Update Remove button aria-label (visible label has no index)
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
