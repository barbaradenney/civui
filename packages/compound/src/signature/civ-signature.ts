import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, interpolate, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';

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
export class CivSignature extends CivFormElement {
  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /**
   * Promote the legend to a heading via `role="heading"` + `aria-level=N`.
   * Use sparingly — typically only when this field is the primary question
   * on a single-question page (level 1) or the top legend inside a
   * form-step (level 2 or 3).
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the legend. Default and `sm` render at body size;
   * `md`/`lg`/`xl` increase the size for use as a section/page heading.
   * At `[data-civ-scale="fluid"]`, `xl` renders very large.
   */
  @property({ type: String }) size?: LabelSize;

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

  @state() private _signature: InternalSignature = { ...EMPTY_SIGNATURE };

  /** Get the current signature value. */
  get signatureValue(): SignatureValue {
    return { ...this._signature };
  }

  /** Set the signature value. Missing fields fall back to the empty defaults. */
  set signatureValue(val: SignatureValue) {
    this._signature = { ...EMPTY_SIGNATURE, ...val, signedAt: val.signedAt ?? '' };
    this.value = JSON.stringify(this._signature);
  }

  /** Whether the signature is complete (name entered and checkbox checked). */
  get isComplete(): boolean {
    return this._signature.name.trim().length > 0 && this._signature.certified;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Light DOM: capture any `slot="statement"` children before Lit's first
    // render destroys them. Multiple children get joined; their content is
    // re-rendered via unsafeHTML so consumer-supplied <a> tags survive.
    const slotted = Array.from(this.children).filter(
      (child) => child.getAttribute('slot') === 'statement',
    );
    if (slotted.length > 0) {
      // Use innerHTML so the wrapper element (with its slot attribute) is
      // discarded — only the consumer's content survives into the rendered
      // statement container.
      this._slottedStatementHTML = slotted.map((c) => c.innerHTML).join('');
      for (const child of slotted) child.remove();
    }
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._signature = this.parseStructuredValue(this.value, EMPTY_SIGNATURE);
  }

  /** Whether any statement (slot or prop) is present. */
  private get _hasStatement(): boolean {
    return !!this._slottedStatementHTML || !!this.statement;
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    const fieldset = html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        ${this._hasStatement ? html`
          <div id="${this._statementId}" class="civ-mb-4">
            ${this._slottedStatementHTML
              ? unsafeHTML(this._slottedStatementHTML)
              : this.statement}
          </div>
        ` : nothing}

        <civ-form-field label="${t('signatureName')}" hint="${t('signatureNameHint')}" error="${this.nameError}">
          <civ-text-input
            name="${this.name ? `${this.name}.name` : ''}"
            value="${this._signature.name}"
            hint="${t('signatureNameHint')}"
            error="${this.nameError}"
            autocomplete="name"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${this._onNameInput}"
            @civ-change="${this._onNameChange}"
          ></civ-text-input>
        </civ-form-field>

        <civ-checkbox
          label="${t('signatureCertify')}"
          name="${this.name ? `${this.name}.certified` : ''}"
          value="true"
          ?checked="${this._signature.certified}"
          ?disabled="${this.disabled}"
          error="${this.certifyError}"
          extra-describedby="${this._hasStatement ? this._statementId : nothing}"
          @civ-change="${this._onCertifyChange}"
        ></civ-checkbox>
      </fieldset>
    `;

    return this.card
      ? html`<div class="civ-card civ-p-6">${fieldset}</div>`
      : fieldset;
  }

  private _onNameInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._signature = { ...this._signature, name: e.detail.value };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-input', { value: { ...this._signature } });
  }

  private _onNameChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._signature = { ...this._signature, name: e.detail.value };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-change', { value: { ...this._signature } });
  }

  private _onCertifyChange(e: CustomEvent<{ checked: boolean }>): void {
    e.stopPropagation();
    // Stamp signedAt the moment the user certifies; clear it when they
    // uncheck so we never report a stale time. Re-checking captures a
    // fresh timestamp.
    const signedAt = e.detail.checked ? new Date().toISOString() : '';
    this._signature = {
      ...this._signature,
      certified: e.detail.checked,
      signedAt,
    };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-input', { value: { ...this._signature } });
    dispatch(this, 'civ-change', { value: { ...this._signature } });
  }

  /**
   * The captured signing time as an ISO 8601 string, or empty string when
   * the signature isn't certified. Convenience accessor — the same value
   * is in `signatureValue.signedAt` and the submitted FormData under
   * `${name}.signedAt`.
   */
  get signedAt(): string {
    return this._signature.signedAt;
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'signature';
    fd.append(`${prefix}.name`, this._signature.name);
    fd.append(`${prefix}.certified`, this._signature.certified ? 'true' : 'false');
    if (this._signature.signedAt) {
      fd.append(`${prefix}.signedAt`, this._signature.signedAt);
    }
    this.updateFormValue(fd);
  }

  protected override _updateValidity(): void {
    // A signature is complete when both the name is filled and the
    // certify checkbox is ticked (mirrors the public isComplete getter).
    if (this.required && !this.isComplete) {
      const label = this.legend || this.label || t('fieldFallbackLabel');
      const anchor = this.querySelector('input, select, textarea') as HTMLElement | null;
      this._setValidity(
        { valueMissing: true },
        this.error || interpolate(this.requiredMessage || t('fieldRequired'), { label }),
        anchor ?? undefined,
      );
    } else {
      this._setValidity({});
    }
  }

  override formResetCallback(): void {
    this._signature = { ...EMPTY_SIGNATURE };
    this.value = '';
    this.error = '';
    this.nameError = '';
    this.certifyError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-signature': CivSignature;
  }
}
