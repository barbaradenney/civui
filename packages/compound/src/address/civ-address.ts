import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, LegendHeadingMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/overlays/modal';
import '@civui/actions/button';

export interface AddressSuggestion {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export type ValidateAddressFn = (address: AddressValue) => Promise<AddressSuggestion | null>;

export interface AddressValue {
  country: string;
  street1: string;
  street2: string;
  street3: string;
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

const MILITARY_STATES = [
  { value: 'AA', label: 'AA — Armed Forces Americas' },
  { value: 'AE', label: 'AE — Armed Forces Europe' },
  { value: 'AP', label: 'AP — Armed Forces Pacific' },
];

/** Countries that don't use a state/province/region field. */
const NO_STATE_COUNTRIES = new Set([
  'AE', 'AG', 'AI', 'AQ', 'AW', 'BB', 'BH', 'BM', 'BN', 'BS', 'BW',
  'CW', 'CY', 'DK', 'DJ', 'DM', 'EE', 'FI', 'FJ', 'FK', 'GD', 'GI',
  'GL', 'GP', 'GQ', 'GY', 'HK', 'HR', 'HU', 'IE', 'IL', 'IS', 'JM',
  'KI', 'KN', 'KW', 'KY', 'LC', 'LI', 'LT', 'LU', 'LV', 'MC', 'MO',
  'MT', 'MU', 'MV', 'NR', 'NU', 'OM', 'PR', 'QA', 'SG', 'SI', 'SK',
  'SM', 'SR', 'SX', 'SZ', 'TC', 'TT', 'TV', 'VA', 'VC', 'VG', 'WS',
]);

/** Countries that don't use postal codes. */
const NO_POSTAL_CODE_COUNTRIES = new Set([
  'AO', 'AG', 'AW', 'BS', 'BZ', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CF',
  'KM', 'CG', 'CD', 'CK', 'CI', 'CW', 'DJ', 'DM', 'GQ', 'ER', 'FJ',
  'GA', 'GM', 'GH', 'GD', 'GN', 'GY', 'HK', 'KI', 'KP', 'LY', 'MW',
  'ML', 'MR', 'MU', 'NR', 'NU', 'PA', 'QA', 'RW', 'KN', 'LC', 'VC',
  'WS', 'ST', 'SC', 'SL', 'SB', 'SO', 'SR', 'SX', 'SY', 'TL', 'TK',
  'TO', 'TT', 'TV', 'UG', 'AE', 'VU', 'YE', 'ZW',
]);

const EMPTY_ADDRESS: AddressValue = { country: 'US', street1: '', street2: '', street3: '', city: '', state: '', zip: '' };

/**
 * CivUI Address
 *
 * Structured address input with street, city, state, and ZIP fields.
 * Renders as a fieldset using CivUI sub-components.
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
export class CivAddress extends LegendHeadingMixin(CivFormElement) {
  /**
   * Address variant:
   * - `default` — full address form (street, city, state, zip)
   * - `general-delivery` — address form with USPS General Delivery hints
   * - `contact` — simplified city/state + contact method (no street/zip)
   */
  @property({ type: String }) variant: 'default' | 'general-delivery' | 'contact' = 'default';

  /** Fieldset legend displayed above the address fields. */
  @property({ type: String }) legend = '';

  // headingLevel + size inherited from LegendHeadingMixin.

  /** Whether to show the Street address line 2 field. */
  @property({ type: Boolean, attribute: 'show-street2' }) showStreet2 = true;

  /** Whether to show the country selector (enables international addresses). */
  @property({ type: Boolean, attribute: 'show-country' }) showCountry = false;


  /** Whether to show a third street address line. */
  @property({ type: Boolean, attribute: 'show-street3' }) showStreet3 = false;

  /** Error message for the street1 field. */
  @property({ type: String, attribute: 'street-error' }) streetError = '';

  /** Error message for the city field. */
  @property({ type: String, attribute: 'city-error' }) cityError = '';

  /** Error message for the state field. */
  @property({ type: String, attribute: 'state-error' }) stateError = '';

  /** Error message for the ZIP code field. */
  @property({ type: String, attribute: 'zip-error' }) zipError = '';

  /** Async address validation function. When set, a "Verify address" modal
   *  appears after the user completes the address, showing the original vs.
   *  suggested address. Returns null if no suggestion is needed. */
  @property({ attribute: false }) validateAddress: ValidateAddressFn | null = null;

  @state() private _address: AddressValue = { ...EMPTY_ADDRESS };
  @state() private _showValidationModal = false;
  @state() private _suggestion: AddressSuggestion | null = null;
  @state() private _validating = false;

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
    this._address = this.parseStructuredValue(this.value, EMPTY_ADDRESS);
    this.updateComplete.then(() => this._syncSelectOptions());
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    // Re-sync select options when country changes
    if (changed.has('_address')) {
      this.updateComplete.then(() => this._syncSelectOptions());
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    if (this.variant === 'contact') return this._renderContact(describedBy);

    const generalDeliveryHint = this.variant === 'general-delivery'
      ? "Enter the city, state, and ZIP of the post office where you'll pick up mail. Use 'General Delivery' as the street address. Contact the post office first to confirm they offer General Delivery."
      : '';

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: generalDeliveryHint || this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-form-field label="${t('addressCountry')}">
          <civ-country
            name="${this.name ? `${this.name}.country` : ''}"
            value="${this._address.country}"
            us-first
            ?disabled="${this.disabled}"
            data-address-country
            @civ-change="${(e: CustomEvent) => this._onSubSelectChange('country', e)}"
          ></civ-country>
        </civ-form-field>

        <civ-form-field label="${t('addressStreet1')}" error="${this.streetError}" ?required="${this.required}">
          <civ-text-input
            name="${this.name ? `${this.name}.street1` : ''}"
            value="${this._address.street1}"
            error="${this.streetError}"
            autocomplete="address-line1"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('street1', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('street1', e)}"
          ></civ-text-input>
        </civ-form-field>

        ${this.showStreet2 ? html`
          <civ-form-field label="${t('addressStreet2')}">
            <civ-text-input
              name="${this.name ? `${this.name}.street2` : ''}"
              value="${this._address.street2}"
              autocomplete="address-line2"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onSubInput('street2', e)}"
              @civ-change="${(e: CustomEvent) => this._onSubChange('street2', e)}"
            ></civ-text-input>
          </civ-form-field>
        ` : nothing}

        ${this.showStreet3 ? html`
          <civ-form-field label="${t('addressStreet3')}">
            <civ-text-input
              name="${this.name ? `${this.name}.street3` : ''}"
              value="${this._address.street3}"
              autocomplete="address-line3"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onSubInput('street3', e)}"
              @civ-change="${(e: CustomEvent) => this._onSubChange('street3', e)}"
            ></civ-text-input>
          </civ-form-field>
        ` : nothing}

        <civ-form-field label="${t('addressCity')}" error="${this.cityError}" ?required="${this.required}">
          <civ-text-input
            name="${this.name ? `${this.name}.city` : ''}"
            value="${this._address.city}"
            error="${this.cityError}"
            autocomplete="address-level2"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('city', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('city', e)}"
          ></civ-text-input>
        </civ-form-field>

        ${this._showState ? this._useSelectForState ? html`
          <civ-form-field label="${t('addressState')}" error="${this.stateError}" ?required="${this.required}">
            <civ-select
              name="${this.name ? `${this.name}.state` : ''}"
              value="${this._address.state}"
              error="${this.stateError}"
              autocomplete="address-level1"
              ?disabled="${this.disabled}"
              data-address-state
              @civ-change="${(e: CustomEvent) => this._onSubSelectChange('state', e)}"
            ></civ-select>
          </civ-form-field>
        ` : html`
          <civ-form-field label="${t('addressStateProvince')}" error="${this.stateError}" ?required="${this.required}">
            <civ-text-input
              name="${this.name ? `${this.name}.state` : ''}"
              value="${this._address.state}"
              error="${this.stateError}"
              autocomplete="address-level1"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onSubInput('state', e)}"
              @civ-change="${(e: CustomEvent) => this._onSubChange('state', e)}"
            ></civ-text-input>
          </civ-form-field>
        ` : nothing}

        ${this._showPostalCode ? html`
          <civ-form-field label="${this._address.country === 'US' ? t('addressZip') : t('addressPostalCode')}" error="${this.zipError}" ?required="${this.required}">
            <civ-text-input
              name="${this.name ? `${this.name}.zip` : ''}"
              value="${this._address.zip}"
              error="${this.zipError}"
              autocomplete="postal-code"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onSubInput('zip', e)}"
              @civ-change="${(e: CustomEvent) => this._onSubChange('zip', e)}"
          ></civ-text-input>
        </civ-form-field>
        ` : nothing}
      </fieldset>

      ${this._renderValidationModal()}
    `;
  }

  private _renderContact(describedBy: string) {
    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-form-field label="${t('housingGeneralLocation')}">
          <civ-text-input
            name="${this.name ? `${this.name}.city` : ''}"
            value="${this._address.city}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('city', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('city', e)}"
          ></civ-text-input>
        </civ-form-field>

        ${this._showState ? html`
          <civ-form-field label="${t('addressState')}" ?required="${this.required}">
            <civ-select
              name="${this.name ? `${this.name}.state` : ''}"
              value="${this._address.state}"
              ?disabled="${this.disabled}"
              data-address-state
              @civ-change="${(e: CustomEvent) => this._onSubSelectChange('state', e)}"
            ></civ-select>
          </civ-form-field>
        ` : nothing}

        <civ-form-field label="${t('housingContactMethod')}" ?required="${this.required}" hint="${t('housingContactMethodHint')}">
          <civ-textarea
            name="${this.name ? `${this.name}.contactMethod` : ''}"
            rows="3"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
          ></civ-textarea>
        </civ-form-field>
      </fieldset>
    `;
  }

  private _renderValidationModal() {
    if (!this._showValidationModal) return nothing;
    return html`
      <civ-modal
        ?open="${this._showValidationModal}"
        heading="${t('addressValidationHeading')}"
        no-backdrop-close
        no-close-button
        @civ-modal-close="${this._onValidationKeepOriginal}"
      >
        ${this._validating ? html`
          <p class="civ-text-body">${t('addressValidationLoading')}</p>
        ` : this._suggestion ? html`
          <div class="civ-flex civ-flex-col civ-gap-6">
            <div>
              <p class="civ-font-semibold civ-mb-1">${t('addressValidationOriginalLabel')}</p>
              <p class="civ-text-body civ-m-0">${this._address.street1}</p>
              ${this._address.street2 ? html`<p class="civ-text-body civ-m-0">${this._address.street2}</p>` : nothing}
              <p class="civ-text-body civ-m-0">${this._address.city}, ${this._address.state} ${this._address.zip}</p>
            </div>
            <div>
              <p class="civ-font-semibold civ-mb-1">${t('addressValidationSuggestedLabel')}</p>
              <p class="civ-text-body civ-m-0">${this._suggestion.street1}</p>
              ${this._suggestion.street2 ? html`<p class="civ-text-body civ-m-0">${this._suggestion.street2}</p>` : nothing}
              <p class="civ-text-body civ-m-0">${this._suggestion.city}, ${this._suggestion.state} ${this._suggestion.zip}</p>
            </div>
          </div>
          <div data-modal-footer>
            <civ-button variant="secondary" label="${t('addressValidationUseOriginal')}" @click="${this._onValidationKeepOriginal}"></civ-button>
            <civ-button label="${t('addressValidationUseSuggested')}" @click="${this._onValidationUseSuggested}"></civ-button>
          </div>
        ` : nothing}
      </civ-modal>
    `;
  }

  /**
   * Trigger address validation. Call this before form submission.
   * Returns a promise that resolves when the user has made their choice
   * (or immediately if no validateAddress function is set or no suggestion returned).
   */
  async runValidation(): Promise<void> {
    if (!this.validateAddress || !this._isComplete()) return;

    this._validating = true;
    this._showValidationModal = true;

    try {
      const suggestion = await this.validateAddress(this._address);
      this._validating = false;

      if (!suggestion) {
        // No suggestion — address is valid as-is
        this._showValidationModal = false;
        return;
      }

      this._suggestion = suggestion;
      // Modal stays open — user must pick original or suggested
      return new Promise<void>((resolve) => {
        this._validationResolve = resolve;
      });
    } catch {
      // Validation service failed — proceed with original address
      this._validating = false;
      this._showValidationModal = false;
    }
  }

  private _validationResolve: (() => void) | null = null;

  private _onValidationKeepOriginal(): void {
    this._showValidationModal = false;
    this._suggestion = null;
    this._validationResolve?.();
    this._validationResolve = null;
  }

  private _onValidationUseSuggested(): void {
    if (this._suggestion) {
      this._address = {
        ...this._address,
        street1: this._suggestion.street1,
        street2: this._suggestion.street2 ?? '',
        city: this._suggestion.city,
        state: this._suggestion.state,
        zip: this._suggestion.zip,
      };
      this.value = JSON.stringify(this._address);
      this._syncFormValue();
      dispatch(this, 'civ-change', { value: { ...this._address } });
    }
    this._showValidationModal = false;
    this._suggestion = null;
    this._validationResolve?.();
    this._validationResolve = null;
  }

  /** Whether to render a select dropdown for the state field.
   * US ships with a full state list (50 states + territories + military codes).
   * Other countries fall back to free-text entry until province lists are added. */
  private get _useSelectForState(): boolean {
    return this._address.country === 'US';
  }

  private get _showState(): boolean {
    return !NO_STATE_COUNTRIES.has(this._address.country);
  }

  private get _showPostalCode(): boolean {
    return !NO_POSTAL_CODE_COUNTRIES.has(this._address.country);
  }

  /** State/province options for the current country. */
  private get _stateOptions(): Array<{ value: string; label: string }> {
    if (this._address.country === 'US') {
      return [...US_STATES, ...MILITARY_STATES];
    }
    return US_STATES;
  }

  /** Set options on the select sub-components after render. */
  private _syncSelectOptions(): void {
    const stateSelect = this.querySelector('[data-address-state]') as any;
    if (stateSelect) stateSelect.options = this._stateOptions;
  }

  private _onSubInput(field: keyof AddressValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._address = { ...this._address, [field]: e.detail.value };
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-input', { value: { ...this._address } });
  }

  private _onSubChange(field: keyof AddressValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._address = { ...this._address, [field]: e.detail.value };
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-change', { value: { ...this._address } });
    // Sub-component already fires civ-analytics; don't duplicate
  }

  /** Combined handler for select sub-fields (fires both civ-input and civ-change in one update). */
  private _onSubSelectChange(field: keyof AddressValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    // Reset dependent fields when country changes
    if (field === 'country') {
      this._address = { ...this._address, country: e.detail.value, state: '', zip: '' };
    } else {
      this._address = { ...this._address, [field]: e.detail.value };
    }
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-input', { value: { ...this._address } });
    dispatch(this, 'civ-change', { value: { ...this._address } });
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._address, this.name || 'address');
  }

  override formResetCallback(): void {
    this._address = { ...EMPTY_ADDRESS };
    this._resetCompound(['streetError', 'cityError', 'stateError', 'zipError']);
  }

  /** Check if the address has any filled fields. */
  isEmpty(): boolean {
    return !this._address.street1 && !this._address.city && !this._address.state && !this._address.zip;
  }

  /**
   * An address is considered complete when street1, city, state, and zip
   * are all filled. street2/street3 are optional and country has a default.
   */
  private _isComplete(): boolean {
    const a = this._address;
    return !!(a.street1.trim() && a.city.trim() && a.state.trim() && a.zip.trim());
  }

  protected override _updateValidity(): void {
    if (!this._setRequiredCompoundValidity(this._isComplete())) {
      this._setValidity({});
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-address': CivAddress;
  }
}
