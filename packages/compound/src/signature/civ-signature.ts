import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, interpolate, t } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';

export interface SignatureValue {
  name: string;
  certified: boolean;
}

const EMPTY_SIGNATURE: SignatureValue = { name: '', certified: false };

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

  @state() private _signature: SignatureValue = { ...EMPTY_SIGNATURE };

  /** Get the current signature value. */
  get signatureValue(): SignatureValue {
    return { ...this._signature };
  }

  /** Set the signature value. */
  set signatureValue(val: SignatureValue) {
    this._signature = { ...val };
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
    if (this.value) {
      try {
        this._signature = { ...EMPTY_SIGNATURE, ...JSON.parse(this.value) };
      } catch { /* leave empty */ }
    }
  }

  /** Whether any statement (slot or prop) is present. */
  private get _hasStatement(): boolean {
    return !!this._slottedStatementHTML || !!this.statement;
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend || this.label, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}

        ${this._hasStatement ? html`
          <div id="${this._statementId}" class="civ-text-base civ-text-muted civ-mb-4">
            ${this._slottedStatementHTML
              ? unsafeHTML(this._slottedStatementHTML)
              : this.statement}
          </div>
        ` : nothing}

        <civ-text-input
          label="${t('signatureName')}"
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
    this._signature = { ...this._signature, certified: e.detail.checked };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-input', { value: { ...this._signature } });
    dispatch(this, 'civ-change', { value: { ...this._signature } });
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'signature';
    fd.append(`${prefix}.name`, this._signature.name);
    fd.append(`${prefix}.certified`, this._signature.certified ? 'true' : 'false');
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
