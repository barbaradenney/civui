import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '../address/civ-address.js';
import '@civui/form-patterns';

/**
 * CivUI Housing Options
 *
 * Compound component for collecting mailing addresses from people who
 * may not have permanent housing. Provides a checkbox to indicate no
 * permanent address, then offers mail delivery options: USPS General
 * Delivery, an alternate address, or alternative contact methods.
 *
 * When the checkbox is unchecked, renders a standard civ-address form.
 *
 * @element civ-housing-options
 *
 * @prop {string} name - Form field name prefix
 * @prop {string} addressName - Name for the address sub-component
 * @prop {string} addressLegend - Legend for the address when shown
 * @prop {boolean} showGeneralDelivery - Show USPS General Delivery option
 * @prop {string} legend - Fieldset legend
 *
 * @fires civ-input - On every value change
 * @fires civ-change - On committed value change
 *
 * @example
 * ```html
 * <civ-housing-options
 *   legend="Your mailing address"
 *   name="housing"
 *   required
 * ></civ-housing-options>
 * ```
 */
@customElement('civ-housing-options')
export class CivHousingOptions extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;
  @property({ type: String }) size?: LabelSize;
  @property({ type: String, attribute: 'address-name' }) addressName = 'address';
  @property({ type: String, attribute: 'address-legend' }) addressLegend = '';
  @property({ type: Boolean, attribute: 'show-general-delivery' }) showGeneralDelivery = true;

  @state() private _noPermanentAddress = false;
  @state() private _mailMethod = '';

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const addrLegend = this.addressLegend || t('housingGeneralLocation') ? 'Mailing address' : 'Mailing address';

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-section-intro heading="${t('housingNoPermanentAddress').replace("I don't have a ", 'Your ')}" tone="sensitive">
          <p>We need a mailing address to send you important documents. If you don't have a permanent address, we can work with you on other options.</p>
        </civ-section-intro>

        <civ-checkbox
          name="${this.name ? `${this.name}.noPermanentAddress` : ''}"
          label="${t('housingNoPermanentAddress')}"
          ?checked="${this._noPermanentAddress}"
          ?disabled="${this.disabled}"
          @civ-change="${this._onCheckboxChange}"
        ></civ-checkbox>

        ${!this._noPermanentAddress ? html`
          <civ-address
            size="lg"
            legend="${this.addressLegend || 'Mailing address'}"
            name="${this.addressName}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
          ></civ-address>
        ` : html`
          ${this.showGeneralDelivery ? html`
            <div class="civ-callout civ-callout--info civ-mb-4">
              <p class="civ-font-bold civ-mb-1">You can still receive mail</p>
              <p class="civ-m-0">USPS General Delivery is a free service that holds mail at your local post office for pickup — no PO Box or permanent address required. Just bring a photo ID.</p>
            </div>
          ` : nothing}

          <civ-form-fieldset legend="${t('housingCanReceiveMail').replace('?', '') || 'How would you like to receive mail?'}" size="lg">
            <civ-radio-group
              name="${this.name ? `${this.name}.mailMethod` : ''}"
              value="${this._mailMethod}"
              ?disabled="${this.disabled}"
              @civ-change="${this._onMailMethodChange}"
            >
              ${this.showGeneralDelivery ? html`
                <civ-radio value="general-delivery" label="USPS General Delivery" description="Free — mail is held at a post office for pickup with photo ID"></civ-radio>
              ` : nothing}
              <civ-radio value="alternate-address" label="Someone else's address" description="A friend, family member, shelter, or organization that can receive mail for you"></civ-radio>
              <civ-radio value="no-mail" label="I can't receive mail" description="We'll use other ways to contact you"></civ-radio>
            </civ-radio-group>
          </civ-form-fieldset>

          ${this._mailMethod === 'general-delivery' ? html`
            <civ-address
              size="lg"
              legend="General Delivery post office"
              name="${this.addressName}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              hint="Enter the city, state, and ZIP of the post office where you'll pick up mail. Use 'General Delivery' as the street address."
            ></civ-address>
          ` : nothing}

          ${this._mailMethod === 'alternate-address' ? html`
            <civ-address
              size="lg"
              legend="Mailing address"
              name="${this.addressName}"
              ?required="${this.required}"
              ?disabled="${this.disabled}"
              hint="Enter the address where someone can receive mail on your behalf."
            ></civ-address>
          ` : nothing}

          ${this._mailMethod === 'no-mail' ? html`
            <civ-form-field label="${t('housingGeneralLocation')}" >
              <civ-text-input name="${this.name ? `${this.name}.generalLocation` : ''}" ?disabled="${this.disabled}"></civ-text-input>
            </civ-form-field>
            <civ-form-field label="State" ?required="${this.required}">
              <civ-select name="${this.name ? `${this.name}.state` : ''}" preset="us-states" ?disabled="${this.disabled}"></civ-select>
            </civ-form-field>
            <civ-form-field label="${t('housingContactMethod')}" ?required="${this.required}" hint="${t('housingContactMethodHint')}">
              <civ-textarea name="${this.name ? `${this.name}.contactMethod` : ''}" rows="3" ?disabled="${this.disabled}"></civ-textarea>
            </civ-form-field>
          ` : nothing}
        `}
      </fieldset>
    `;
  }

  private _onCheckboxChange(e: CustomEvent<{ checked: boolean }>): void {
    e.stopPropagation();
    this._noPermanentAddress = e.detail.checked;
    this._mailMethod = '';
    this._dispatchValue();
  }

  private _onMailMethodChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._mailMethod = e.detail.value;
    this._dispatchValue();
  }

  private _dispatchValue(): void {
    const value = {
      noPermanentAddress: this._noPermanentAddress,
      mailMethod: this._mailMethod,
    };
    dispatch(this, 'civ-input', { value });
    dispatch(this, 'civ-change', { value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-housing-options': CivHousingOptions;
  }
}
