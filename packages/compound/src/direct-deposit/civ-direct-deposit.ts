import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, interpolate, t } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';

export interface DirectDepositValue {
  accountType: 'checking' | 'savings' | '';
  routingNumber: string;
  accountNumber: string;
}

const EMPTY_DEPOSIT: DirectDepositValue = { accountType: '', routingNumber: '', accountNumber: '' };

/**
 * CivUI Direct Deposit
 *
 * Compound financial input for collecting bank account information.
 * Includes account type (checking/savings), routing number, and account number.
 * Follows VA.gov direct deposit pattern.
 *
 * @element civ-direct-deposit
 *
 * @example
 * ```html
 * <civ-direct-deposit legend="Direct deposit information" name="bankInfo" required></civ-direct-deposit>
 * ```
 *
 * @fires civ-input - On every field change, detail: { value: DirectDepositValue }
 * @fires civ-change - On committed field change, detail: { value: DirectDepositValue }
 */
@customElement('civ-direct-deposit')
export class CivDirectDeposit extends CivFormElement {
  /** Fieldset legend. */
  @property({ type: String }) legend = '';

  /** Error for routing number. */
  @property({ type: String, attribute: 'routing-error' }) routingError = '';

  /** Error for account number. */
  @property({ type: String, attribute: 'account-error' }) accountError = '';

  /** Error for account type. */
  @property({ type: String, attribute: 'type-error' }) typeError = '';

  @state() private _deposit: DirectDepositValue = { ...EMPTY_DEPOSIT };

  /** Get the current deposit value. */
  get depositValue(): DirectDepositValue {
    return { ...this._deposit };
  }

  /** Set the deposit value. */
  set depositValue(val: DirectDepositValue) {
    this._deposit = { ...val };
    this.value = JSON.stringify(this._deposit);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._deposit = this.parseStructuredValue(this.value, EMPTY_DEPOSIT);
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
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, textSizeClass: 'civ-text-lg' }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-radio-group
          legend="${t('directDepositAccountType')}"
          name="${this.name ? `${this.name}.accountType` : 'accountType'}"
          value="${this._deposit.accountType}"
          ?disabled="${this.disabled}"
          error="${this.typeError}"
          @civ-input="${(e: CustomEvent) => e.stopPropagation()}"
          @civ-change="${this._onRadioChange}"
        >
          <civ-radio label="${t('directDepositChecking')}" value="checking"></civ-radio>
          <civ-radio label="${t('directDepositSavings')}" value="savings"></civ-radio>
        </civ-radio-group>

        <civ-form-field label="${t('directDepositRouting')}" hint="${t('directDepositRoutingHint')}" error="${this.routingError}">
          <civ-routing-number
            name="${this.name ? `${this.name}.routingNumber` : ''}"
            value="${this._deposit.routingNumber}"
            hint="${t('directDepositRoutingHint')}"
            error="${this.routingError}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('routingNumber', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('routingNumber', e)}"
          ></civ-routing-number>
        </civ-form-field>

        <civ-form-field label="${t('directDepositAccount')}" hint="${t('directDepositAccountHint')}" error="${this.accountError}">
          <civ-text-input
            name="${this.name ? `${this.name}.accountNumber` : ''}"
            value="${this._deposit.accountNumber}"
            hint="${t('directDepositAccountHint')}"
            error="${this.accountError}"
            inputmode="numeric"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('accountNumber', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('accountNumber', e)}"
          ></civ-text-input>
        </civ-form-field>
      </fieldset>
    `;
  }

  private _onRadioChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation(); // Prevent the radio group's event from bubbling past this component
    const type = e.detail.value as 'checking' | 'savings';
    this._deposit = { ...this._deposit, accountType: type };
    this.value = JSON.stringify(this._deposit);
    dispatch(this, 'civ-input', { value: { ...this._deposit } });
    dispatch(this, 'civ-change', { value: { ...this._deposit } });
  }

  private _onSubInput(field: keyof DirectDepositValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._deposit = { ...this._deposit, [field]: e.detail.value };
    this.value = JSON.stringify(this._deposit);
    dispatch(this, 'civ-input', { value: { ...this._deposit } });
  }

  private _onSubChange(field: keyof DirectDepositValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._deposit = { ...this._deposit, [field]: e.detail.value };
    this.value = JSON.stringify(this._deposit);
    dispatch(this, 'civ-change', { value: { ...this._deposit } });
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._deposit, this.name || 'deposit');
  }

  /**
   * A direct deposit entry is complete when account type, routing number,
   * and account number are all provided. Routing-number checksum and
   * account-number length validation belong to dedicated validators.
   */
  private _isComplete(): boolean {
    const d = this._deposit;
    return !!(d.accountType && d.routingNumber.trim() && d.accountNumber.trim());
  }

  protected override _updateValidity(): void {
    if (this.required && !this._isComplete()) {
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
    this._deposit = { ...EMPTY_DEPOSIT };
    this.value = '';
    this.error = '';
    this.routingError = '';
    this.accountError = '';
    this.typeError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-direct-deposit': CivDirectDeposit;
  }
}
