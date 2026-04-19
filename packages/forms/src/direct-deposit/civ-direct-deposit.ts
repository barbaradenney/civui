import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, inputClasses, buildDescribedBy, t } from '@civui/core';

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

  private _routingId = this.generateId('routing');
  private _accountId = this.generateId('account');
  private _typeErrId = this.generateId('type-err');
  private _routingErrId = this.generateId('routing-err');
  private _accountErrId = this.generateId('account-err');
  private _routingHintId = this.generateId('routing-hint');
  private _accountHintId = this.generateId('account-hint');

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
    if (this.value) {
      try {
        this._deposit = { ...EMPTY_DEPOSIT, ...JSON.parse(this.value) };
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

        <div class="civ-mb-3">
          <fieldset class="civ-fieldset" role="radiogroup" aria-required="${this.required || nothing}">
            <legend class="civ-label">${t('directDepositAccountType')}
              ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
            </legend>
            ${renderError(this._typeErrId, this.typeError)}
            <div class="civ-flex civ-gap-4">
              <label class="civ-flex civ-items-center civ-gap-1.5 civ-cursor-pointer">
                <input
                  type="radio"
                  name="${this.name ? `${this.name}.accountType` : 'accountType'}"
                  value="checking"
                  .checked="${this._deposit.accountType === 'checking'}"
                  ?disabled="${this.disabled}"
                  class="focus-visible:civ-focus-ring"
                  @change="${() => this._onTypeChange('checking')}"
                />
                ${t('directDepositChecking')}
              </label>
              <label class="civ-flex civ-items-center civ-gap-1.5 civ-cursor-pointer">
                <input
                  type="radio"
                  name="${this.name ? `${this.name}.accountType` : 'accountType'}"
                  value="savings"
                  .checked="${this._deposit.accountType === 'savings'}"
                  ?disabled="${this.disabled}"
                  class="focus-visible:civ-focus-ring"
                  @change="${() => this._onTypeChange('savings')}"
                />
                ${t('directDepositSavings')}
              </label>
            </div>
          </fieldset>
        </div>

        <div class="civ-mb-3">
          <label class="civ-label" for="${this._routingId}">
            ${t('directDepositRouting')}
            ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
          </label>
          <span class="civ-hint" id="${this._routingHintId}">${t('directDepositRoutingHint')}</span>
          ${renderError(this._routingErrId, this.routingError)}
          <input
            type="text"
            class="${classes}"
            id="${this._routingId}"
            name="${this.name ? `${this.name}.routingNumber` : nothing}"
            .value="${this._deposit.routingNumber}"
            inputmode="numeric"
            maxlength="9"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.routingError ? 'true' : nothing}"
            aria-describedby="${[this._routingHintId, this.routingError ? this._routingErrId : ''].filter(Boolean).join(' ') || nothing}"
            @input="${(e: Event) => this._onFieldInput('routingNumber', e)}"
            @change="${(e: Event) => this._onFieldChange('routingNumber', e)}"
            style="max-width:12rem"
          />
        </div>

        <div class="civ-mb-3">
          <label class="civ-label" for="${this._accountId}">
            ${t('directDepositAccount')}
            ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
          </label>
          <span class="civ-hint" id="${this._accountHintId}">${t('directDepositAccountHint')}</span>
          ${renderError(this._accountErrId, this.accountError)}
          <input
            type="text"
            class="${classes}"
            id="${this._accountId}"
            name="${this.name ? `${this.name}.accountNumber` : nothing}"
            .value="${this._deposit.accountNumber}"
            inputmode="numeric"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.accountError ? 'true' : nothing}"
            aria-describedby="${[this._accountHintId, this.accountError ? this._accountErrId : ''].filter(Boolean).join(' ') || nothing}"
            @input="${(e: Event) => this._onFieldInput('accountNumber', e)}"
            @change="${(e: Event) => this._onFieldChange('accountNumber', e)}"
          />
        </div>
      </fieldset>
    `;
  }

  private _onTypeChange(type: 'checking' | 'savings'): void {
    this._deposit = { ...this._deposit, accountType: type };
    this.value = JSON.stringify(this._deposit);
    dispatch(this, 'civ-input', { value: { ...this._deposit } });
    dispatch(this, 'civ-change', { value: { ...this._deposit } });
    this.sendAnalytics('change');
  }

  private _onFieldInput(field: keyof DirectDepositValue, e: Event): void {
    const target = e.target as HTMLInputElement;
    this._deposit = { ...this._deposit, [field]: target.value };
    this.value = JSON.stringify(this._deposit);
    dispatch(this, 'civ-input', { value: { ...this._deposit } });
  }

  private _onFieldChange(field: keyof DirectDepositValue, e: Event): void {
    const target = e.target as HTMLInputElement;
    this._deposit = { ...this._deposit, [field]: target.value };
    this.value = JSON.stringify(this._deposit);
    dispatch(this, 'civ-change', { value: { ...this._deposit } });
    this.sendAnalytics('change');
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'deposit';
    fd.append(`${prefix}.accountType`, this._deposit.accountType);
    fd.append(`${prefix}.routingNumber`, this._deposit.routingNumber);
    fd.append(`${prefix}.accountNumber`, this._deposit.accountNumber);
    this.updateFormValue(fd);
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
