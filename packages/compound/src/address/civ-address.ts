import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivCompoundElement, LegendHeadingMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { SelectLike } from '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/textarea';
import '@civui/inputs/select';
import '@civui/inputs/country';
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
export class CivAddress extends LegendHeadingMixin(CivCompoundElement) {
  protected override _empty: AddressValue = { ...EMPTY_ADDRESS };

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

  /** Hide the Street address line 2 field. Defaults to false (street2 renders). */
  @property({ type: Boolean, attribute: 'hide-street2' }) hideStreet2 = false;

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

  @state() protected override _data: AddressValue = { ...EMPTY_ADDRESS };
  @state() private _showValidationModal = false;
  @state() private _suggestion: AddressSuggestion | null = null;
  @state() private _validating = false;

  /** Get the current address value as a structured object. */
  get addressValue(): AddressValue {
    return { ...this._data };
  }

  /** Set the address value from a structured object. */
  set addressValue(val: AddressValue) {
    this._data = { ...val };
    this.value = JSON.stringify(this._data);
  }

  override async firstUpdated(): Promise<void> {
    super.firstUpdated();
    // Defer one microtask via `await updateComplete` so the inner
    // civ-select children have upgraded their `options` setter before
    // we write to them. async/await surfaces a thrown sync error
    // through the unhandled-rejection channel instead of swallowing it.
    try {
      await this.updateComplete;
      this._syncSelectOptions();
    } catch (err) {
      console.error('civ-address: failed to sync select options on first render', err);
    }
  }

  override async updated(changed: Map<string, unknown>): Promise<void> {
    super.updated(changed);
    if (changed.has('_data')) {
      try {
        await this.updateComplete;
        this._syncSelectOptions();
      } catch (err) {
        console.error('civ-address: failed to re-sync select options after data change', err);
      }
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    if (this.variant === 'contact') return this._renderContact(describedBy);

    const generalDeliveryHint = this.variant === 'general-delivery' ? t('addressGeneralDeliveryHint') : '';

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: generalDeliveryHint || this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        ${this.showCountry ? this._renderCountryField() : nothing}
        ${this._renderTextField('street1', t('addressStreet1'), 'address-line1', { error: this.streetError, required: this.required })}
        ${!this.hideStreet2 ? this._renderTextField('street2', t('addressStreet2'), 'address-line2') : nothing}
        ${this.showStreet3 ? this._renderTextField('street3', t('addressStreet3'), 'address-line3') : nothing}
        ${this._renderTextField('city', t('addressCity'), 'address-level2', { error: this.cityError, required: this.required })}
        ${this._renderStateField()}
        ${this._showPostalCode
          ? this._renderTextField('zip', this._data.country === 'US' ? t('addressZip') : t('addressPostalCode'), 'postal-code', { error: this.zipError, required: this.required, inputmode: this._data.country === 'US' ? 'numeric' : '' })
          : nothing}
      </fieldset>

      ${this._renderValidationModal()}
    `;
  }

  /**
   * Render a single `<civ-text-input>` row keyed off `_data[field]`.
   * Centralizes the repetitive name/value/event/disabled wiring shared by
   * every text address field. `error` and `required` are passed in because
   * they vary per field.
   */
  private _renderTextField(
    field: 'street1' | 'street2' | 'street3' | 'city' | 'state' | 'zip',
    label: string,
    autocomplete: string,
    opts: { error?: string; required?: boolean; inputmode?: string } = {},
  ) {
    const { error = '', required = false, inputmode = '' } = opts;
    return html`
      <civ-text-input
        label="${label}"
        name="${this.name ? `${this.name}.${field}` : ''}"
        value="${this._data[field]}"
        error="${error}"
        autocomplete="${autocomplete}"
        inputmode="${inputmode || nothing}"
        ?required="${required}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        @civ-input="${(e: CustomEvent) => this._onSubInput(field, e)}"
        @civ-change="${(e: CustomEvent) => this._onSubChange(field, e)}"
      ></civ-text-input>
    `;
  }

  /** Country selector with `us-first` ordering. */
  private _renderCountryField() {
    return html`
      <civ-country
        label="${t('addressCountry')}"
        name="${this.name ? `${this.name}.country` : ''}"
        value="${this._data.country}"
        us-first
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        data-address-country
        @civ-change="${(e: CustomEvent) => this._onSubSelectChange('country', e)}"
      ></civ-country>
    `;
  }

  /**
   * State / province field — renders a `<civ-select>` populated from
   * `US_STATES` for US addresses, or a free-form text input otherwise.
   * Returns `nothing` when the country variant doesn't surface a state.
   */
  private _renderStateField() {
    if (!this._showState) return nothing;
    if (this._useSelectForState) {
      return html`
        <civ-select
          label="${t('addressState')}"
          name="${this.name ? `${this.name}.state` : ''}"
          value="${this._data.state}"
          error="${this.stateError}"
          autocomplete="address-level1"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          data-address-state
          @civ-change="${(e: CustomEvent) => this._onSubSelectChange('state', e)}"
        ></civ-select>
      `;
    }
    return this._renderTextField('state', t('addressStateProvince'), 'address-level1', { error: this.stateError, required: this.required });
  }

  private _renderContact(describedBy: string) {
    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-text-input
          label="${t('housingGeneralLocation')}"
          name="${this.name ? `${this.name}.city` : ''}"
          value="${this._data.city}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('city', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('city', e)}"
        ></civ-text-input>

        ${this._showState ? html`
          <civ-select
            label="${t('addressState')}"
            name="${this.name ? `${this.name}.state` : ''}"
            value="${this._data.state}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            data-address-state
            @civ-change="${(e: CustomEvent) => this._onSubSelectChange('state', e)}"
          ></civ-select>
        ` : nothing}

        <civ-textarea
          label="${t('housingContactMethod')}"
          hint="${t('housingContactMethodHint')}"
          name="${this.name ? `${this.name}.contactMethod` : ''}"
          rows="3"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
        ></civ-textarea>
      </fieldset>
    `;
  }

  private _renderValidationModal() {
    // Once validateAddress is set, render the modal unconditionally and
    // toggle `?open` instead of conditionally rendering the whole element.
    // civ-modal extends LightDomSlotMixin and captures its authored
    // children on connect; dynamically swapping which children sit
    // between the parent's ChildPart markers breaks lit-html's _$clear
    // walk (see .claude/rules/common-traps.md, "LightDomSlotMixin
    // composition with dynamic Lit children"). A stable wrapper inside
    // the modal hosts the dynamic body so the captured slot is a single
    // unit.
    if (!this.validateAddress) return nothing;
    return html`
      <civ-modal
        ?open="${this._showValidationModal}"
        heading="${t('addressValidationHeading')}"
        no-backdrop-close
        no-close-button
        @civ-close="${this._onValidationKeepOriginal}"
      >
        <div class="civ-flex civ-flex-col civ-gap-6">
          ${this._validating ? html`
            <p class="civ-text-body">${t('addressValidationLoading')}</p>
          ` : this._suggestion ? html`
            <div>
              <p class="civ-font-semibold civ-mb-1">${t('addressValidationOriginalLabel')}</p>
              <p class="civ-text-body civ-m-0">${this._data.street1}</p>
              ${this._data.street2 ? html`<p class="civ-text-body civ-m-0">${this._data.street2}</p>` : nothing}
              <p class="civ-text-body civ-m-0">${this._data.city}, ${this._data.state} ${this._data.zip}</p>
            </div>
            <div>
              <p class="civ-font-semibold civ-mb-1">${t('addressValidationSuggestedLabel')}</p>
              <p class="civ-text-body civ-m-0">${this._suggestion.street1}</p>
              ${this._suggestion.street2 ? html`<p class="civ-text-body civ-m-0">${this._suggestion.street2}</p>` : nothing}
              <p class="civ-text-body civ-m-0">${this._suggestion.city}, ${this._suggestion.state} ${this._suggestion.zip}</p>
            </div>
          ` : nothing}
        </div>
        <div data-modal-footer>
          ${this._suggestion && !this._validating ? html`
            <civ-button emphasis="secondary" label="${t('addressValidationUseOriginal')}" @click="${this._onValidationKeepOriginal}"></civ-button>
            <civ-button label="${t('addressValidationUseSuggested')}" @click="${this._onValidationUseSuggested}"></civ-button>
          ` : nothing}
        </div>
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
      const suggestion = await this.validateAddress(this._data);
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
      this._data = {
        ...this._data,
        street1: this._suggestion.street1,
        street2: this._suggestion.street2 ?? '',
        city: this._suggestion.city,
        state: this._suggestion.state,
        zip: this._suggestion.zip,
      };
      this.value = JSON.stringify(this._data);
      this._syncFormValue();
      dispatch(this, 'civ-change', { value: { ...this._data } });
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
    return this._data.country === 'US';
  }

  private get _showState(): boolean {
    return !NO_STATE_COUNTRIES.has(this._data.country);
  }

  private get _showPostalCode(): boolean {
    return !NO_POSTAL_CODE_COUNTRIES.has(this._data.country);
  }

  /** State/province options for the current country. */
  private get _stateOptions(): Array<{ value: string; label: string }> {
    if (this._data.country === 'US') {
      return [...US_STATES, ...MILITARY_STATES];
    }
    return US_STATES;
  }

  /** Set options on the select sub-components after render. */
  private _syncSelectOptions(): void {
    const stateSelect = this.querySelector('[data-address-state]') as SelectLike | null;
    if (stateSelect) stateSelect.options = this._stateOptions;
  }

  /** Combined handler for select sub-fields (fires both civ-input and civ-change in one update). */
  private _onSubSelectChange(field: keyof AddressValue, e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    // Reset dependent fields when country changes
    if (field === 'country') {
      this._data = { ...this._data, country: e.detail.value, state: '', zip: '' };
    } else {
      this._data = { ...this._data, [field]: e.detail.value };
    }
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_ADDRESS };
    this._resetCompound(['streetError', 'cityError', 'stateError', 'zipError']);
  }

  /** Check if the address has any filled fields. */
  isEmpty(): boolean {
    return !this._data.street1 && !this._data.city && !this._data.state && !this._data.zip;
  }

  /**
   * An address is considered complete when street1, city, state, and zip
   * are all filled. street2/street3 are optional and country has a default.
   */
  private _isComplete(): boolean {
    const a = this._data;
    return !!(a.street1.trim() && a.city.trim() && a.state.trim() && a.zip.trim());
  }

  protected override get _fieldName(): string {
    return this.legend || super._fieldName;
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
