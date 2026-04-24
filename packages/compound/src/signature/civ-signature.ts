import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, t } from '@civui/core';
// Named imports ensure custom elements are registered (bare imports get tree-shaken by Vite)
import { CivTextInput as _T } from '@civui/inputs';
import { CivCheckbox as _C } from '@civui/controls';
void _T; void _C;

export interface SignatureValue {
  name: string;
  certified: boolean;
}

const EMPTY_SIGNATURE: SignatureValue = { name: '', certified: false };

/**
 * CivUI Signature
 *
 * Statement of truth component for form submission. Renders a certification
 * statement, a full name text input, and a certification checkbox.
 * Used at the end of a review page before final submission.
 *
 * @element civ-signature
 *
 * @example
 * ```html
 * <civ-signature
 *   legend="Statement of truth"
 *   name="signature"
 *   statement="I certify that the information I have provided is true and correct."
 *   required
 * ></civ-signature>
 * ```
 *
 * @fires civ-input - On every field change, detail: { value: SignatureValue }
 * @fires civ-change - On committed field change, detail: { value: SignatureValue }
 */
@customElement('civ-signature')
export class CivSignature extends CivFormElement {
  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /** Certification statement text displayed above the fields. */
  @property({ type: String }) statement = '';

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

  override firstUpdated(): void {
    super.firstUpdated();
    if (this.value) {
      try {
        this._signature = { ...EMPTY_SIGNATURE, ...JSON.parse(this.value) };
      } catch { /* leave empty */ }
    }
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

        ${this.statement ? html`
          <p class="civ-text-base civ-text-muted civ-mb-4">${this.statement}</p>
        ` : nothing}

        <civ-text-input
          label="${t('signatureName')}"
          name="${this.name ? `${this.name}.name` : ''}"
          value="${this._signature.name}"
          hint="${t('signatureNameHint')}"
          error="${this.nameError}"
          autocomplete="name"
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
          ?checked="${this._signature.certified}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          error="${this.certifyError}"
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
