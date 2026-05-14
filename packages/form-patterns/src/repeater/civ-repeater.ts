import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, announce, interpolate, sanitizeHref, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/actions/button';
import '@civui/actions/action-button';
import '@civui/actions/link';
import '../form-step/civ-form-step.js';

/** Arbitrary row object held by the host in route mode. The repeater never mutates it. */
export type RepeaterRow = Record<string, unknown>;

/** Function that turns a row into the visible summary text on its card. */
export type RepeaterRowSummary = (row: RepeaterRow, index: number) => string;

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
   *   in place on add/edit (still on the same page). Best for complex items
   *   with 4+ fields where the user shouldn't lose page context.
   * - `route` — rows show as summary cards. Add/Edit are real `<a href>`
   *   links pointing at host-owned routes; the form lives on a separate
   *   page that the host renders. Best for complex items with 8+ fields,
   *   save-and-resume flows, or when each item deserves its own URL.
   *   In this mode the repeater is "controlled": the host owns the data
   *   via the `rows` prop and slotted children are ignored.
   */
  @property({ type: String }) mode: 'inline' | 'form-steps' | 'route' = 'inline';

  // ── Route mode props ─────────────────────────────────────────
  // Only meaningful when `mode === 'route'`. Ignored in inline / form-steps.

  /**
   * Host-owned array of row data. The repeater renders one summary card per
   * entry but never mutates this array — when the user removes a row, the
   * repeater fires `civ-repeater-remove` and the host updates the array.
   * Each row is an arbitrary object; the shape is host-defined.
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
   * pattern. Example: `/dependents/{id}/edit`.
   *
   * `{id}` is strongly preferred — using `{index}` makes bookmarks
   * fragile because indexes shift when rows are removed.
   */
  @property({ type: String, attribute: 'edit-href-pattern' }) editHrefPattern = '';

  /**
   * Name of the row property that holds a stable identifier. Used to
   * interpolate `{id}` in `editHrefPattern`. Defaults to `'id'`. When the
   * pattern uses `{id}` but rows lack this field, the repeater falls back
   * to `{index}` and logs a dev-mode warning.
   */
  @property({ type: String, attribute: 'id-field' }) idField = 'id';

  /**
   * Comma-separated list of row property names to join into the summary
   * line on each card. Example: `summary-fields="firstName,lastName"`
   * renders "Alex Chen" given a row `{ firstName: 'Alex', lastName: 'Chen' }`.
   *
   * Declarative alternative to `rowSummary` for hosts that can't pass a
   * function (Drupal Twig, SSR, etc.). When `summaryTemplate` or
   * `rowSummary` is also set, those take precedence.
   */
  @property({ type: String, attribute: 'summary-fields' }) summaryFields = '';

  /**
   * Format string for the summary line with `{prop}` placeholders.
   * Example: `summary-template="{firstName} {lastName} ({relationship})"`
   * renders "Alex Chen (Spouse)" given a row `{ firstName: 'Alex',
   * lastName: 'Chen', relationship: 'Spouse' }`.
   *
   * Cross-platform alternative to `rowSummary` for hosts that can't
   * pass a function but need more control than the comma-join of
   * `summary-fields`. When `rowSummary` is also set, the function wins.
   * Missing properties interpolate as empty strings.
   */
  @property({ type: String, attribute: 'summary-template' }) summaryTemplate = '';

  /**
   * Function called for each row to produce the summary line. Receives
   * the row object and zero-based index, returns the string to display
   * on the summary card.
   *
   * Web-only — for cross-platform / Drupal hosts, use `summary-template`
   * or `summary-fields`.
   */
  @property({ attribute: false }) rowSummary?: RepeaterRowSummary;

  /** Hint text displayed below the legend. */
  @property({ type: String }) hint = '';

  /**
   * Hint shown when the list is empty (no rows added yet). Rendered
   * between the header and the Add button. Leave blank to omit — the
   * Add button alone is often signal enough that the list starts empty.
   *
   * Example: `empty-state-text="No dependents yet — click Add to start."`
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
   * Minimum number of rows. Defaults to 0 — the repeater renders just the
   * "Add" button on mount and the first row appears only after the user
   * clicks it. Set `min="1"` (or higher) to render that many rows up front.
   * `min` also acts as the floor for removal — rows can't be removed below it.
   */
  @property({ type: Number }) min = 0;

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

  /**
   * Stable id prefix for per-row heading ids in route mode. Computed once
   * in connectedCallback so heading ids stay constant across re-renders
   * (otherwise calling `generateId()` inside render() churns through fresh
   * ids on every update — wasted DOM updates and a moving target for any
   * screen reader caching the aria-labelledby relationship).
   */
  private _rowHeadingIdPrefix = '';
  /** Set of idFields already warned about — keeps the missing-id warning to once per (instance, idField). */
  private _missingIdFieldWarnings = new Set<string>();

  /** Current number of rows. */
  get rowCount(): number {
    return this._rowCount;
  }

  override connectedCallback(): void {
    // Capture children as a clonable template before Lit's first render
    // destroys them (Light DOM). Only capture on first connection.
    //
    // Route mode is "controlled" — the host owns `rows` and there are no
    // slotted form-field children to template. Warn (in dev) if children
    // are present, since the consumer probably mis-applied the template
    // pattern from inline / form-steps.
    if (!this._templateCaptured) {
      if (this.mode === 'route') {
        if (typeof console !== 'undefined' && this.childNodes.length > 0) {
          // Allow whitespace-only text nodes; only warn when there's actual content.
          const hasContent = Array.from(this.childNodes).some(
            n => n.nodeType !== Node.TEXT_NODE || (n.textContent ?? '').trim() !== '',
          );
          if (hasContent) {
            console.warn(
              '[civ-repeater] In route mode, slotted children are ignored — pass row data via the `rows` prop. The form lives on the destination page (add-href / edit-href-pattern).',
            );
          }
        }
        this._template = [];
      } else {
        this._template = Array.from(this.childNodes).map(n => n.cloneNode(true));
      }
      this._templateCaptured = true;
    }
    super.connectedCallback();
    // Compute the row-heading id prefix once per instance so route-mode
    // renders can derive stable ids by index.
    if (!this._rowHeadingIdPrefix) {
      this._rowHeadingIdPrefix = this.generateId('row');
    }
    // Seed `_rowCount` before the first render so the template (e.g. the
    // "Add" button's `canAdd` check) reflects the right count. Doing this
    // in `firstUpdated` would mutate reactive state after the update
    // committed, triggering a second render. The actual row DOM is appended
    // in `firstUpdated` since it needs the rendered list container.
    //
    // Route mode is rendered declaratively from `rows`, so the imperative
    // row count doesn't apply — leave it at zero.
    if (this.mode !== 'route') {
      this._rowCount = this.min;
    }
  }

  override firstUpdated(): void {
    // Only inline mode appends rows imperatively at mount. form-steps starts
    // empty (rows are added when the user saves the wizard), and route mode
    // renders declaratively from `rows`.
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
        ${renderFormHeader({ label: renderLegend({ legend: legendText, required: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: showList ? this.hint : '', errorId: this._errorId, error: showList ? this.error : '', fieldset: true })}

        <div
          data-civ-repeater-rows
          class="${this._formStepsActive ? 'civ-hidden' : ''}"
          @click="${this._onRowsClick}"
        ></div>

        ${showList && this._rowCount === 0 && this.emptyStateText ? html`
          <p class="civ-repeater-empty-state">${this.emptyStateText}</p>
        ` : nothing}

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
            label="${interpolate(t(this._rowCount === 0 ? 'repeaterAddFirstButton' : 'repeaterAddButton'), { item: this.itemLabel })}"
            ?disabled="${this.disabled}"
            @click="${this.mode === 'form-steps' ? this._openFormStepsForAdd : this._addRow}"
            class="civ-mt-3"
          ></civ-button>
        ` : nothing}

        ${showList && !canAdd && this.max > 0 ? html`
          <p class="civ-repeater-max-hint civ-mt-3" role="status">
            ${interpolate(t('repeaterMaxReached'), { max: String(this.max), item: this.itemLabel })}
          </p>
        ` : nothing}
      </fieldset>
    `;
  }

  // ── Route mode rendering ────────────────────────────────────
  // Declarative render path: rows come from the host via the `rows` prop,
  // Add/Edit are real <a href> tags (no JS click handlers needed),
  // Remove is a real button that fires civ-repeater-remove for the host
  // to update its rows array.

  /** Render the fieldset shell + routed summary cards + Add link. */
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
          <p class="civ-repeater-empty-state">${this.emptyStateText}</p>
        ` : nothing}

        ${canAdd && this.addHref ? html`
          <civ-button
            href="${sanitizeHref(this.addHref)}"
            variant="secondary"
            icon-start="plus"
            label="${interpolate(t(this.rows.length === 0 ? 'repeaterAddFirstButton' : 'repeaterAddButton'), { item: this.itemLabel })}"
            class="civ-mt-3"
          ></civ-button>
        ` : nothing}

        ${!canAdd && this.max > 0 ? html`
          <p class="civ-repeater-max-hint civ-mt-3" role="status">
            ${interpolate(t('repeaterMaxReached'), { max: String(this.max), item: this.itemLabel })}
          </p>
        ` : nothing}
      </fieldset>
    `;
  }

  /** Render one summary card for a row in route mode. */
  private _renderRoutedSummaryCard(row: RepeaterRow, index: number) {
    const headingId = `${this._rowHeadingIdPrefix}-${index}-heading`;
    const editHref = this._resolveEditHref(row, index);
    const headingText = interpolate(t('repeaterItemLabel'), { item: this.itemLabel, index: String(index + 1) });
    return html`
      <div
        data-civ-repeater-row="${index}"
        role="group"
        aria-labelledby="${headingId}"
        class="civ-repeater-row civ-card"
      >
        ${this._renderRowHeadingTemplate(headingId, headingText)}
        <div class="civ-list-item">
          <span class="civ-list-item__content civ-font-medium">
            ${this._resolveSummary(row, index)}
          </span>
          <span class="civ-list-item__actions">
            ${editHref ? html`
              <civ-action-button
                variant="tertiary"
                href="${editHref}"
                label="${t('repeaterEditButton')}"
                aria-label="${interpolate(t('repeaterEditAriaLabel'), { item: this.itemLabel, index: String(index + 1) })}"
              ></civ-action-button>
            ` : nothing}
            <civ-action-button
              variant="tertiary"
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
   * Resolve the summary text for a row through the documented fallback chain:
   *   rowSummary fn → summary-template → summary-fields join → "{itemLabel} {index+1}".
   */
  private _resolveSummary(row: RepeaterRow, index: number): string {
    if (typeof this.rowSummary === 'function') {
      return this.rowSummary(row, index);
    }
    if (this.summaryTemplate) {
      return this.summaryTemplate.replace(/\{([\w$]+)\}/g, (_, key: string) => {
        const v = row[key];
        return v == null ? '' : String(v);
      });
    }
    if (this.summaryFields) {
      const parts = this.summaryFields
        .split(',')
        .map(f => f.trim())
        .filter(Boolean)
        .map(f => {
          const v = row[f];
          return v == null ? '' : String(v);
        })
        .filter(Boolean);
      if (parts.length > 0) return parts.join(' ');
    }
    return interpolate(t('repeaterItemLabel'), { item: this.itemLabel, index: String(index + 1) });
  }

  /**
   * Interpolate `{id}` and `{index}` into `editHrefPattern`. Returns ''
   * if no pattern is set (Edit affordance is omitted).
   *
   * `{id}` is resolved from `row[idField]`. When the pattern uses `{id}`
   * but rows lack that field, fall back to the row's index and log a dev
   * warning — the consumer almost certainly didn't realize their
   * bookmarks would break on reorder/remove.
   */
  private _resolveEditHref(row: RepeaterRow, index: number): string {
    if (!this.editHrefPattern) return '';
    let href = this.editHrefPattern;
    if (href.includes('{id}')) {
      const raw = row[this.idField];
      if (raw == null || raw === '') {
        // Fall back to index in prod so the page still renders. Warn ONCE
        // per (instance, idField) so a repeater with 100 rows missing ids
        // doesn't dump 100 identical warnings on every render.
        if (typeof console !== 'undefined' && !this._missingIdFieldWarnings.has(this.idField)) {
          this._missingIdFieldWarnings.add(this.idField);
          console.warn(
            `[civ-repeater] edit-href-pattern uses {id} but at least one row has no "${this.idField}" — falling back to {index}. Set id-field= to the row's stable identifier to keep bookmarks stable.`,
          );
        }
        href = href.replace('{id}', String(index));
      } else {
        href = href.replace('{id}', encodeURIComponent(String(raw)));
      }
    }
    if (href.includes('{index}')) {
      href = href.replace('{index}', String(index));
    }
    // Defense-in-depth: civ-link sanitizes internally, but we also block
    // `javascript:` / `data:` URLs here in case the consumer feeds a
    // pattern that interpolates an attacker-controlled scheme.
    return sanitizeHref(href);
  }

  /**
   * Handle Remove click in route mode. Fires `civ-repeater-remove` with
   * `{ index, id, row }` so the host can update its rows array. The
   * repeater never mutates `this.rows` itself.
   */
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

  /**
   * Programmatically remove a row by index.
   *
   * Fires a cancelable `civ-repeater-before-remove` event first.
   * Consumers wire confirmation (typically a `civ-modal`) by listening
   * for that event and calling `e.preventDefault()` to abort. From the
   * confirm handler they call `removeRow(index, { skipConfirm: true })`
   * to actually perform the removal without re-firing the cancelable
   * hook.
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
    // Cancelable pre-flight — consumers preventDefault to insert a
    // confirmation step. `skipConfirm: true` bypasses for the confirm
    // handler's follow-up call.
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
      // Adjust edit index if a row before it was removed
      this._formStepsEditIndex--;
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
    row.classList.add('civ-repeater-row', 'civ-card');

    // Per-row heading. Labels the row group for both sighted users
    // ("Dependent 1") and screen readers (via aria-labelledby on the row).
    const heading = this._buildRowHeading(index);
    row.setAttribute('aria-labelledby', heading.id);
    row.appendChild(heading);

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
      removeBtn.setAttribute('label',
        interpolate(t('repeaterRemoveLabel'), { item: this.itemLabel }));
      removeBtn.classList.add('civ-mt-2');
      removeBtn.setAttribute('data-civ-repeater-action', 'remove');
      removeBtn.setAttribute('aria-label',
        interpolate(t('repeaterRemoveAriaLabel'), { item: this.itemLabel, index: String(index + 1) }));
      row.appendChild(removeBtn);
    }

    container.appendChild(row);
  }

  /**
   * The heading level used for per-row headings. Derived from the
   * repeater's `headingLevel` (the legend's level) so row headings sit one
   * level deeper in the page outline. Falls back to h3 when the legend
   * isn't promoted; clamped at h6.
   */
  private _rowHeadingLevel(): 1 | 2 | 3 | 4 | 5 | 6 {
    const base = this.headingLevel ?? 2;
    return Math.min(6, base + 1) as 1 | 2 | 3 | 4 | 5 | 6;
  }

  /**
   * Lit template for a per-row heading. Lit can't interpolate tag names,
   * so the helper switches on the computed level to emit a real h1–h6
   * element (preferred over `<div role="heading">` for proper document
   * outline semantics).
   */
  private _renderRowHeadingTemplate(headingId: string, text: string) {
    const cls = 'civ-repeater-row-heading';
    switch (this._rowHeadingLevel()) {
      case 1: return html`<h1 id="${headingId}" class="${cls}">${text}</h1>`;
      case 2: return html`<h2 id="${headingId}" class="${cls}">${text}</h2>`;
      case 3: return html`<h3 id="${headingId}" class="${cls}">${text}</h3>`;
      case 4: return html`<h4 id="${headingId}" class="${cls}">${text}</h4>`;
      case 5: return html`<h5 id="${headingId}" class="${cls}">${text}</h5>`;
      default: return html`<h6 id="${headingId}" class="${cls}">${text}</h6>`;
    }
  }

  /**
   * Build the per-row heading element for the imperative paths
   * (inline / form-steps rows that get appended via DOM mutation).
   *
   * The tag (`h${level}`) is computed from `_rowHeadingLevel()` so the
   * row heading sits one level below the legend in the outline. The
   * text is interpolated from `repeaterItemLabel` ("dependent 1") and
   * capitalized in CSS so consumers can keep the lowercase `item-label`
   * they use elsewhere (Add button, announcements).
   */
  private _buildRowHeading(index: number): HTMLElement {
    const level = this._rowHeadingLevel();
    const heading = document.createElement(`h${level}`);
    heading.id = `${this._rowHeadingIdPrefix}-${index}-heading`;
    heading.classList.add('civ-repeater-row-heading');
    heading.textContent = interpolate(t('repeaterItemLabel'), {
      item: this.itemLabel,
      index: String(index + 1),
    });
    return heading;
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
    row.classList.add('civ-repeater-row', 'civ-card');

    const heading = this._buildRowHeading(index);
    row.setAttribute('aria-labelledby', heading.id);
    row.appendChild(heading);

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
    removeBtn.setAttribute('label',
      interpolate(t('repeaterRemoveLabel'), { item: this.itemLabel }));
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

      // Update visible row heading text (and keep aria-labelledby anchored to it)
      const heading = row.querySelector('.civ-repeater-row-heading');
      if (heading) {
        heading.textContent = interpolate(t('repeaterItemLabel'), {
          item: this.itemLabel,
          index: String(i + 1),
        });
      }

      // Inline mode — reindex direct children
      for (const child of row.children) {
        const current = child.getAttribute('name');
        if (!current) continue;
        const newName = current.replace(/\[\d+\]/, `[${i}]`);
        child.setAttribute('name', newName);
      }

      // Update remove button aria-label (visible label stays "Remove {item}" — no index)
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
