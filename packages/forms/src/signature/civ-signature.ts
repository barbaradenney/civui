import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, inputClasses, buildDescribedBy, t } from '@civui/core';

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

  private _nameInputId = this.generateId('sig-name');
  private _nameHintId = this.generateId('name-hint');
  private _certifyId = this.generateId('certify');
  private _nameErrId = this.generateId('name-err');
  private _certifyErrId = this.generateId('certify-err');

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
    const classes = inputClasses();
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend || this.label, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}

        ${this.statement ? html`
          <p class="civ-text-base civ-text-muted civ-mb-4">${this.statement}</p>
        ` : nothing}

        <div class="civ-mb-3">
          <label class="civ-label" for="${this._nameInputId}">
            ${t('signatureName')}
            ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
          </label>
          <span class="civ-hint" id="${this._nameHintId}">${t('signatureNameHint')}</span>
          ${renderError(this._nameErrId, this.nameError)}
          <input
            type="text"
            class="${classes}"
            id="${this._nameInputId}"
            name="${this.name ? `${this.name}.name` : nothing}"
            .value="${this._signature.name}"
            autocomplete="name"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.nameError ? 'true' : nothing}"
            aria-describedby="${[this._nameHintId, this.nameError ? this._nameErrId : ''].filter(Boolean).join(' ') || nothing}"
            @input="${this._onNameInput}"
            @change="${this._onNameChange}"
          />
        </div>

        <div class="civ-mb-3">
          ${renderError(this._certifyErrId, this.certifyError)}
          <label class="civ-flex civ-items-start civ-gap-2 civ-cursor-pointer">
            <input
              type="checkbox"
              id="${this._certifyId}"
              name="${this.name ? `${this.name}.certified` : nothing}"
              .checked="${this._signature.certified}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              class="civ-mt-0.5 focus-visible:civ-focus-ring"
              aria-invalid="${this.certifyError ? 'true' : nothing}"
              aria-describedby="${this.certifyError ? this._certifyErrId : nothing}"
              @change="${this._onCertifyChange}"
            />
            <span>${t('signatureCertify')}</span>
          </label>
        </div>
      </fieldset>
    `;
  }

  private _onNameInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._signature = { ...this._signature, name: target.value };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-input', { value: { ...this._signature } });
  }

  private _onNameChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._signature = { ...this._signature, name: target.value };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-change', { value: { ...this._signature } });
    this.sendAnalytics('change');
  }

  private _onCertifyChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this._signature = { ...this._signature, certified: target.checked };
    this.value = JSON.stringify(this._signature);
    dispatch(this, 'civ-input', { value: { ...this._signature } });
    dispatch(this, 'civ-change', { value: { ...this._signature } });
    this.sendAnalytics('change');
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
