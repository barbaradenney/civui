import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, interpolate, t } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';

export interface AddressValue {
  country: string;
  street1: string;
  street2: string;
  street3: string;
  city: string;
  state: string;
  zip: string;
  military: boolean;
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
  { value: 'AA', label: 'Armed Forces Americas (AA)' },
  { value: 'AE', label: 'Armed Forces Europe (AE)' },
  { value: 'AP', label: 'Armed Forces Pacific (AP)' },
];

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
];

const EMPTY_ADDRESS: AddressValue = { country: 'US', street1: '', street2: '', street3: '', city: '', state: '', zip: '', military: false };

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
export class CivAddress extends CivFormElement {
  /** Fieldset legend displayed above the address fields. */
  @property({ type: String }) legend = '';

  /** Whether to show the Street address line 2 field. */
  @property({ type: Boolean, attribute: 'show-street2' }) showStreet2 = true;

  /** Whether to show the country selector (enables international addresses). */
  @property({ type: Boolean, attribute: 'show-country' }) showCountry = false;

  /** Whether to show the military address checkbox. */
  @property({ type: Boolean, attribute: 'show-military' }) showMilitary = false;

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

  @state() private _address: AddressValue = { ...EMPTY_ADDRESS };

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
      } catch { /* leave empty */ }
    }
    this._syncSelectOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    // Re-sync select options when military or country changes
    if (changed.has('_address')) {
      this._syncSelectOptions();
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

        ${this.showMilitary ? html`
          <civ-checkbox
            label="${t('addressMilitary')}"
            name="${this.name ? `${this.name}.military` : ''}"
            value="true"
            ?checked="${this._address.military}"
            ?disabled="${this.disabled}"
            hint="${this._address.military ? t('addressMilitaryHint') : ''}"
            @civ-change="${this._onMilitaryChange}"
          ></civ-checkbox>
        ` : nothing}

        ${this.showCountry && !this._address.military ? html`
          <civ-select
            label="${t('addressCountry')}"
            name="${this.name ? `${this.name}.country` : ''}"
            value="${this._address.country}"
            autocomplete="country"
            ?disabled="${this.disabled}"
            data-address-country
            @civ-change="${(e: CustomEvent) => this._onSubSelectChange('country', e)}"
          ></civ-select>
        ` : nothing}

        <civ-text-input
          label="${t('addressStreet1')}"
          name="${this.name ? `${this.name}.street1` : ''}"
          value="${this._address.street1}"
          error="${this.streetError}"
          autocomplete="address-line1"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('street1', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('street1', e)}"
        ></civ-text-input>

        ${this.showStreet2 ? html`
          <civ-text-input
            label="${t('addressStreet2')}"
            name="${this.name ? `${this.name}.street2` : ''}"
            value="${this._address.street2}"
            autocomplete="address-line2"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('street2', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('street2', e)}"
          ></civ-text-input>
        ` : nothing}

        ${this.showStreet3 ? html`
          <civ-text-input
            label="${t('addressStreet3')}"
            name="${this.name ? `${this.name}.street3` : ''}"
            value="${this._address.street3}"
            autocomplete="address-line3"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('street3', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('street3', e)}"
          ></civ-text-input>
        ` : nothing}

        <civ-text-input
          label="${t('addressCity')}"
          name="${this.name ? `${this.name}.city` : ''}"
          value="${this._address.city}"
          error="${this.cityError}"
          autocomplete="address-level2"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('city', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('city', e)}"
        ></civ-text-input>

        ${this._useSelectForState ? html`
          <civ-select
            label="${t('addressState')}"
            name="${this.name ? `${this.name}.state` : ''}"
            value="${this._address.state}"
            error="${this.stateError}"
            autocomplete="address-level1"
            ?disabled="${this.disabled}"
            data-address-state
            @civ-change="${(e: CustomEvent) => this._onSubSelectChange('state', e)}"
          ></civ-select>
        ` : html`
          <civ-text-input
            label="${t('addressStateProvince')}"
            name="${this.name ? `${this.name}.state` : ''}"
            value="${this._address.state}"
            error="${this.stateError}"
            autocomplete="address-level1"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onSubInput('state', e)}"
            @civ-change="${(e: CustomEvent) => this._onSubChange('state', e)}"
          ></civ-text-input>
        `}

        <civ-text-input
          label="${this._address.country === 'US' || !this.showCountry ? t('addressZip') : t('addressPostalCode')}"
          name="${this.name ? `${this.name}.zip` : ''}"
          value="${this._address.zip}"
          error="${this.zipError}"
          inputmode="numeric"
          autocomplete="postal-code"
          maxlength="10"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onSubInput('zip', e)}"
          @civ-change="${(e: CustomEvent) => this._onSubChange('zip', e)}"
        ></civ-text-input>
      </fieldset>
    `;
  }

  /** Whether to render a select dropdown for the state field.
   * Only US (and military APO/FPO/DPO) ship with a state list today. Other
   * countries fall back to free-text entry until province lists are added. */
  private get _useSelectForState(): boolean {
    if (this._address.military) return true;
    return !this.showCountry || this._address.country === 'US';
  }

  /** State/province options for the current country. */
  private get _stateOptions(): Array<{ value: string; label: string }> {
    if (this._address.military) return MILITARY_STATES;
    return US_STATES;
  }

  /** Set options on the select sub-components after render. */
  private _syncSelectOptions(): void {
    const stateSelect = this.querySelector('[data-address-state]') as any;
    if (stateSelect) stateSelect.options = this._stateOptions;

    const countrySelect = this.querySelector('[data-address-country]') as any;
    if (countrySelect) countrySelect.options = COUNTRY_OPTIONS;
  }

  private _onMilitaryChange(e: CustomEvent<{ checked: boolean }>): void {
    e.stopPropagation();
    this._address = {
      ...this._address,
      military: e.detail.checked,
      country: e.detail.checked ? 'US' : this._address.country,
      state: '',
    };
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-input', { value: { ...this._address } });
    dispatch(this, 'civ-change', { value: { ...this._address } });
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
    this._address = { ...this._address, [field]: e.detail.value };
    this.value = JSON.stringify(this._address);
    dispatch(this, 'civ-input', { value: { ...this._address } });
    dispatch(this, 'civ-change', { value: { ...this._address } });
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'address';
    fd.append(`${prefix}.country`, this._address.country);
    fd.append(`${prefix}.street1`, this._address.street1);
    fd.append(`${prefix}.street2`, this._address.street2);
    fd.append(`${prefix}.street3`, this._address.street3);
    fd.append(`${prefix}.city`, this._address.city);
    fd.append(`${prefix}.state`, this._address.state);
    fd.append(`${prefix}.zip`, this._address.zip);
    fd.append(`${prefix}.military`, this._address.military ? 'true' : 'false');
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

  /**
   * An address is considered complete when street1, city, state, and zip
   * are all filled. street2/street3 and country/military are optional or
   * have defaults.
   */
  private _isComplete(): boolean {
    const a = this._address;
    return !!(a.street1.trim() && a.city.trim() && a.state.trim() && a.zip.trim());
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
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-address': CivAddress;
  }
}
