import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { CivCompoundElement, LegendHeadingMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy, interpolate, t } from '@civui/core';
import type { LabelSize } from '@civui/core';
import '@civui/inputs/text-input';
import '@civui/controls/checkbox';

export interface SignatureValue {
  name: string;
  certified: boolean;
  /**
   * Optional ISO 8601 timestamp captured the first time the user
   * interactively certifies (checks the certify box). Empty string when
   * the signature isn't yet certified, or when state was set
   * programmatically without an explicit timestamp. Treat as a
   * user-claimed signing time — server-recorded timestamps remain
   * authoritative.
   */
  signedAt?: string;
}

interface InternalSignature {
  name: string;
  certified: boolean;
  signedAt: string;
}

const EMPTY_SIGNATURE: InternalSignature = { name: '', certified: false, signedAt: '' };

/**
 * CivUI Signature
 *
 * Statement of truth component for form submission. Renders a certification
 * statement, a full name text input, and a certification checkbox. The
 * statement is wired into the certify checkbox via aria-describedby so a
 * screen-reader user hears the full certification text when the checkbox
 * receives focus.
 *
 * Used at the end of a review page before final submission.
 *
 * @element civ-signature
 *
 * @example Plain text statement (default)
 * ```html
 * <civ-signature
 *   legend="Statement of truth"
 *   name="signature"
 *   statement="I certify that the information I have provided is true and correct."
 *   required
 * ></civ-signature>
 * ```
 *
 * @example Rich statement with links (slot fallback)
 * ```html
 * <civ-signature legend="Statement of truth" name="signature" required>
 *   <span slot="statement">
 *     I certify under <a href="/penalty">penalty of perjury</a> that the
 *     information is true and correct.
 *   </span>
 * </civ-signature>
 * ```
 *
 * @fires civ-input - On every field change, detail: { value: SignatureValue }
 * @fires civ-change - On committed field change, detail: { value: SignatureValue }
 */
@customElement('civ-signature')
export class CivSignature extends LegendHeadingMixin(CivCompoundElement) {
  protected override _empty: InternalSignature = { ...EMPTY_SIGNATURE };

  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /**
   * Size defaults to `xl` because signatures are typically the prominent
   * end-of-form legal affirmation — paired with the default card framing,
   * the large heading communicates the weight of the action. Override to
   * `sm`/`md` for inline / dense placements.
   */
  override size: LabelSize = 'xl';

  // headingLevel inherited from LegendHeadingMixin (default: undefined).

  /** Certification statement text displayed above the fields. Ignored when a `slot="statement"` child is present. */
  @property({ type: String }) statement = '';

  /** Stable id for the rendered statement element, referenced by the certify checkbox's aria-describedby. */
  private _statementId = this.generateId('statement');

  /** HTML captured from a `slot="statement"` child in connectedCallback (light DOM doesn't auto-project). */
  private _slottedStatementHTML: string | null = null;

  /** Error for the name field. */
  @property({ type: String, attribute: 'name-error' }) nameError = '';

  /** Error for the certification checkbox. */
  @property({ type: String, attribute: 'certify-error' }) certifyError = '';

  /**
   * Wrap the signature in a card for visual emphasis. Defaults to true —
   * signature blocks carry legal weight (statement of truth, certify-and-
   * submit) and the card framing communicates that to the user. To opt
   * out for a bare fieldset (e.g. when nesting inside an already-bordered
   * container that would double up the visual weight), set the JS
   * property: `?card="${false}"` in lit-html templates, or `el.card =
   * false` imperatively.
   */
  @property({ type: Boolean }) card = true;

  @state() protected override _data: InternalSignature = { ...EMPTY_SIGNATURE };

  /** Get the current signature value. */
  get signatureValue(): SignatureValue {
    return { ...this._data };
  }

  /** Set the signature value. Missing fields fall back to the empty defaults. */
  set signatureValue(val: SignatureValue) {
    this._data = { ...EMPTY_SIGNATURE, ...val, signedAt: val.signedAt ?? '' };
    this.value = JSON.stringify(this._data);
  }

  /**
   * Whether the signature is complete: name entered AND certify checkbox
   * ticked. Public API — consumer code can read this to decide whether to
   * enable a "Submit" button or unblock the next step in a flow. Other
   * compounds use a private `_isComplete()` helper because there's no
   * meaningful single "complete" state for a name or address; signature
   * is the exception because the affirmation is binary.
   */
  get isComplete(): boolean {
    return this._data.name.trim().length > 0 && this._data.certified;
  }

  override connectedCallback(): void {
    // Base CivCompoundElement.connectedCallback hydrates `_data` from
    // `this.value` via `parseStructuredValue`.
    super.connectedCallback();

    // Light DOM: capture any `slot="statement"` children before Lit's first
    // render destroys them. Multiple children get joined; their content is
    // re-rendered via unsafeHTML so consumer-supplied <a> tags survive.
    const slotted = Array.from(this.children).filter(
      (child) => child.getAttribute('slot') === 'statement',
    );
    if (slotted.length > 0) {
      // innerHTML drops the wrapper (with its slot attribute) — only the
      // consumer's content survives into the rendered statement container.
      this._slottedStatementHTML = slotted.map((c) => c.innerHTML).join('');
      for (const child of slotted) child.remove();
    }
  }

  /** Whether any statement (slot or prop) is present. */
  private get _hasStatement(): boolean {
    return !!this._slottedStatementHTML || !!this.statement;
  }

  /**
   * Format the captured `signedAt` ISO timestamp for display below the
   * certify checkbox. Long date + short time in the user's locale —
   * `January 15, 2026 at 3:42 PM` (en-US). Returns empty string if the
   * timestamp is missing or unparseable so the caller can fall back to
   * showing nothing.
   */
  private _formatSignedAt(): string {
    if (!this._data.signedAt) return '';
    const d = new Date(this._data.signedAt);
    if (isNaN(d.getTime())) return '';
    try {
      return d.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
    } catch {
      // Some Node / older runtimes don't support dateStyle/timeStyle.
      return d.toLocaleString();
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    const fieldset = html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        ${this._hasStatement ? html`
          <div id="${this._statementId}" class="civ-mb-4">
            ${this._slottedStatementHTML
              ? unsafeHTML(this._slottedStatementHTML)
              : this.statement}
          </div>
        ` : nothing}

        <civ-text-input
          label="${t('signatureName')}"
          name="${this.name ? `${this.name}.name` : ''}"
          value="${this._data.name}"
          hint="${t('signatureNameHint')}"
          error="${this.nameError}"
          autocomplete="off"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${this._onNameInput}"
          @civ-change="${this._onNameChange}"
        ></civ-text-input>

        <civ-checkbox
          label="${t('signatureCertify')}"
          name="${this.name ? `${this.name}.certified` : ''}"
          value="true"
          ?checked="${this._data.certified}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          error="${this.certifyError}"
          extra-describedby="${this._hasStatement ? this._statementId : nothing}"
          @civ-change="${this._onCertifyChange}"
        ></civ-checkbox>

        <!--
          Persistent signature line. Always rendered so typing the name
          does not push the form layout. The cursive span always carries
          content — either the trimmed name or a non-breaking space —
          so its line-box has consistent height whether populated or
          empty (an empty inline span collapses, a filled one expands
          to the font's metrics; we lock both states to the same
          baseline). Visually mirrors a wet-ink signature line at the
          bottom of a paper form. \`aria-hidden\` because the input
          value is already announced by the screen reader.
        -->
        <div class="civ-signature-preview" aria-hidden="true">
          <span class="civ-signature-preview__cursive">${this._data.name.trim() || ' '}</span>
        </div>

        <!--
          Persistent signed-at line. Always rendered with reserved height
          so checking the certify box doesn't push subsequent content
          (any error message, surrounding form layout). \`role="status"\` +
          \`aria-live="polite"\` so screen readers announce the timestamp
          when it fills in — they monitor the existing element for
          content changes rather than detecting a freshly-appended node.
        -->
        <div class="civ-signature-signed-at civ-text-sm" role="status" aria-live="polite">
          ${this._data.certified && this._data.signedAt
            ? interpolate(t('signatureSignedAt'), { date: this._formatSignedAt() })
            : nothing}
        </div>
      </fieldset>
    `;

    return this.card
      ? html`<div class="civ-card civ-p-6">${fieldset}</div>`
      : fieldset;
  }

  private _onNameInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._data = { ...this._data, name: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
  }

  private _onNameChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._data = { ...this._data, name: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onCertifyChange(e: CustomEvent<{ checked: boolean }>): void {
    e.stopPropagation();
    // Stamp signedAt the moment the user certifies; clear it when they
    // uncheck so we never report a stale time. Re-checking captures a
    // fresh timestamp.
    const signedAt = e.detail.checked ? new Date().toISOString() : '';
    this._data = {
      ...this._data,
      certified: e.detail.checked,
      signedAt,
    };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  /**
   * The captured signing time as an ISO 8601 string, or empty string when
   * the signature isn't certified. Convenience accessor — the same value
   * is in `signatureValue.signedAt` and the submitted FormData under
   * `${name}.signedAt`.
   */
  get signedAt(): string {
    return this._data.signedAt;
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'signature';
    fd.append(`${prefix}.name`, this._data.name);
    fd.append(`${prefix}.certified`, this._data.certified ? 'true' : 'false');
    if (this._data.signedAt) {
      fd.append(`${prefix}.signedAt`, this._data.signedAt);
    }
    this.updateFormValue(fd);
  }

  protected override get _fieldName(): string {
    return this.legend || super._fieldName;
  }

  protected override _updateValidity(): void {
    // A signature is complete when both the name is filled and the
    // certify checkbox is ticked (mirrors the public isComplete getter).
    if (!this._setRequiredCompoundValidity(this.isComplete)) {
      this._setValidity({});
    }
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_SIGNATURE };
    this._resetCompound(['nameError', 'certifyError']);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-signature': CivSignature;
  }
}
