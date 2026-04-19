import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, inputClasses, buildDescribedBy, t } from '@civui/core';

export interface AddressValue {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

const US_STATES: Array<{ value: string; label: string }> = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'AS', label: 'American Samoa' }, { value: 'GU', label: 'Guam' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'PR', label: 'Puerto Rico' }, { value: 'VI', label: 'U.S. Virgin Islands' },
];

const EMPTY_ADDRESS: AddressValue = { street1: '', street2: '', city: '', state: '', zip: '' };

/**
 * CivUI Address
 *
 * Structured address input with street, city, state, and ZIP fields.
 * Renders as a fieldset with individual labeled inputs for each field.
 * Submits structured form data with `{name}.street1`, `{name}.city`, etc.
 *
 * @element civ-address
 *
 * @example
 * ```html
 * <civ-address legend="Mailing address" name="mailing" required></civ-address>
 * ```
 *
 * @fires civ-input - On every field change, detail: { value: AddressValue }
 * @fires civ-change - On committed field change, detail: { value: AddressValue }
 */
@customElement('civ-address')
export class CivAddress extends CivFormElement {
  /** Fieldset legend displayed above the address fields. */
  @property({ type: String }) legend = '';

  /** Whether to show the Street address line 2 field. */
  @property({ type: Boolean, attribute: 'show-street2' }) showStreet2 = true;

  /** Error message for the street1 field. */
  @property({ type: String, attribute: 'street-error' }) streetError = '';

  /** Error message for the city field. */
  @property({ type: String, attribute: 'city-error' }) cityError = '';

  /** Error message for the state field. */
  @property({ type: String, attribute: 'state-error' }) stateError = '';

  /** Error message for the ZIP code field. */
  @property({ type: String, attribute: 'zip-error' }) zipError = '';

  @state() private _address: AddressValue = { ...EMPTY_ADDRESS };

  private _street1Id = this.generateId('street1');
  private _street2Id = this.generateId('street2');
  private _cityId = this.generateId('city');
  private _stateId = this.generateId('state');
  private _zipId = this.generateId('zip');
  private _streetErrorId = this.generateId('street-err');
  private _cityErrorId = this.generateId('city-err');
  private _stateErrorId = this.generateId('state-err');
  private _zipErrorId = this.generateId('zip-err');

  /** Get the current address value as a structured object. */
  get addressValue(): AddressValue {
    return { ...this._address };
  }

  /** Set the address value from a structured object. */
  set addressValue(val: AddressValue) {
    this._address = { ...val };
    this.value = JSON.stringify(this._address);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    if (this.value) {
      try {
        this._address = { ...EMPTY_ADDRESS, ...JSON.parse(this.value) };
      } catch {
        // If value isn't valid JSON, leave address empty
      }
    }
  }

  override render() {
    const classes = inputClasses();
    const selectClasses = inputClasses({ extra: ['civ-select-field'] });
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
          <label class="civ-label" for="${this._street1Id}">
            ${t('addressStreet1')}
            ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
          </label>
          ${renderError(this._streetErrorId, this.streetError)}
          <input
            type="text"
            class="${classes}"
            id="${this._street1Id}"
            name="${this.name ? `${this.name}.street1` : nothing}"
            .value="${this._address.street1}"
            autocomplete="address-line1"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            aria-required="${this.required || nothing}"
            aria-invalid="${this.streetError ? 'true' : nothing}"
            aria-describedby="${this.streetError ? this._streetErrorId : nothing}"
            @input="${(e: Event) => this._onFieldInput('street1', e)}"
            @change="${(e: Event) => this._onFieldChange('street1', e)}"
          />
        </div>

        ${this.showStreet2 ? html`
          <div class="civ-mb-3">
            <label class="civ-label" for="${this._street2Id}">${t('addressStreet2')}</label>
            <input
              type="text"
              class="${classes}"
              id="${this._street2Id}"
              name="${this.name ? `${this.name}.street2` : nothing}"
              .value="${this._address.street2}"
              autocomplete="address-line2"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @input="${(e: Event) => this._onFieldInput('street2', e)}"
              @change="${(e: Event) => this._onFieldChange('street2', e)}"
            />
          </div>
        ` : nothing}

        <div class="civ-flex civ-flex-wrap civ-gap-3">
          <div class="civ-flex-1 civ-min-w-0" style="flex-basis:12rem">
            <label class="civ-label" for="${this._cityId}">
              ${t('addressCity')}
              ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
            </label>
            ${renderError(this._cityErrorId, this.cityError)}
            <input
              type="text"
              class="${classes}"
              id="${this._cityId}"
              name="${this.name ? `${this.name}.city` : nothing}"
              .value="${this._address.city}"
              autocomplete="address-level2"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              aria-required="${this.required || nothing}"
              aria-invalid="${this.cityError ? 'true' : nothing}"
              aria-describedby="${this.cityError ? this._cityErrorId : nothing}"
              @input="${(e: Event) => this._onFieldInput('city', e)}"
              @change="${(e: Event) => this._onFieldChange('city', e)}"
            />
          </div>

          <div style="flex-basis:10rem">
            <label class="civ-label" for="${this._stateId}">
              ${t('addressState')}
              ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
            </label>
            ${renderError(this._stateErrorId, this.stateError)}
            <select
              class="${selectClasses}"
              id="${this._stateId}"
              name="${this.name ? `${this.name}.state` : nothing}"
              .value="${this._address.state}"
              autocomplete="address-level1"
              ?required="${this.required}"
              ?disabled="${this.disabled || this.readonly}"
              aria-required="${this.required || nothing}"
              aria-invalid="${this.stateError ? 'true' : nothing}"
              aria-describedby="${this.stateError ? this._stateErrorId : nothing}"
              @change="${(e: Event) => { this._onFieldInput('state', e); this._onFieldChange('state', e); }}"
            >
              <option value="">${t('selectEmpty')}</option>
              ${US_STATES.map(s => html`
                <option value="${s.value}" ?selected="${s.value === this._address.state}">${s.label}</option>
              `)}
            </select>
          </div>

          <div style="flex-basis:7rem">
            <label class="civ-label" for="${this._zipId}">
              ${t('addressZip')}
              ${this.required ? html`<span class="civ-sr-only">${t('required')}</span>` : nothing}
            </label>
            ${renderError(this._zipErrorId, this.zipError)}
            <input
              type="text"
              class="${classes}"
              id="${this._zipId}"
              name="${this.name ? `${this.name}.zip` : nothing}"
              .value="${this._address.zip}"
              inputmode="numeric"
              autocomplete="postal-code"
              maxlength="10"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              aria-required="${this.required || nothing}"
              aria-invalid="${this.zipError ? 'true' : nothing}"
              aria-describedby="${this.zipError ? this._zipErrorId : nothing}"
              @input="${(e: Event) => this._onFieldInput('zip', e)}"
              @change="${(e: Event) => this._onFieldChange('zip', e)}"
            />
          </div>
        </div>
      </fieldset>
    `;
  }

  private _onFieldInput(field: keyof AddressValue, e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this._address = { ...this._address, [field]: target.value };
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-input', { value: { ...this._address } });
  }

  private _onFieldChange(field: keyof AddressValue, e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this._address = { ...this._address, [field]: target.value };
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-change', { value: { ...this._address } });
    this.sendAnalytics('change');
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'address';
    fd.append(`${prefix}.street1`, this._address.street1);
    fd.append(`${prefix}.street2`, this._address.street2);
    fd.append(`${prefix}.city`, this._address.city);
    fd.append(`${prefix}.state`, this._address.state);
    fd.append(`${prefix}.zip`, this._address.zip);
    this.updateFormValue(fd);
  }

  override formResetCallback(): void {
    this._address = { ...EMPTY_ADDRESS };
    this.value = '';
    this.error = '';
    this.streetError = '';
    this.cityError = '';
    this.stateError = '';
    this.zipError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }

  /** Check if the address has any filled fields. */
  isEmpty(): boolean {
    return !this._address.street1 && !this._address.city && !this._address.state && !this._address.zip;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-address': CivAddress;
  }
}
