import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, LightDomSlotMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { HeadingLevel, LabelSize, SlotConfig } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '@civui/actions/button';
import '@civui/navigation/link';
import '../address/civ-address.js';
import '@civui/form-patterns';

export interface MailOption {
  /** Unique value identifier. */
  value: string;
  /** Display label. */
  label: string;
  /** Description text below the label. */
  description?: string;
  /**
   * What to render on page 2 when this option is selected:
   * - `'address'` — renders civ-address with optional hint
   * - `'contact'` — renders city/state + contact method fields
   * - `'none'` — renders nothing (consumer handles via slot/event)
   */
  renders: 'address' | 'contact' | 'none';
  /** Hint text for the address form when this option is selected. */
  addressHint?: string;
  /** Legend text for the address form when this option is selected. */
  addressLegend?: string;
}

const DEFAULT_MAIL_OPTIONS: MailOption[] = [
  {
    value: 'general-delivery',
    label: 'USPS General Delivery',
    description: 'Free service that holds mail at your local post office for up to 30 days. Just bring a photo ID to pick it up. Not available at all post offices. Contact your local post office to confirm availability.',
    renders: 'address',
    addressLegend: 'General Delivery post office',
    addressHint: "Enter the city, state, and ZIP of the post office where you'll pick up mail. Use 'General Delivery' as the street address. Contact the post office first to confirm they offer General Delivery.",
  },
  {
    value: 'alternate-address',
    label: "Someone else's address",
    description: 'A friend, family member, shelter, or organization that can receive mail for you',
    renders: 'address',
    addressLegend: 'Mailing address',
    addressHint: 'Enter the address where someone can receive mail on your behalf.',
  },
  {
    value: 'no-mail',
    label: "I can't receive mail",
    description: "We'll use other ways to contact you",
    renders: 'contact',
  },
];

/**
 * CivUI Housing Options
 *
 * Two-page compound component for collecting mailing addresses from
 * people who may not have permanent housing.
 *
 * **Page 1:** Checkbox "I don't have a permanent address"
 * - If unchecked → address form (complete, no page 2)
 * - If checked → tile radio options for how to receive mail + Continue
 *
 * **Page 2:** Based on radio selection, shows the appropriate form:
 * - Address form (General Delivery or alternate address)
 * - Contact method fields (city/state + how to reach you)
 *
 * @element civ-housing-options
 *
 * @slot callout - Custom callout content on page 1 when checkbox is checked.
 *
 * @fires civ-input - On every value change
 * @fires civ-change - On committed value change
 */
@customElement('civ-housing-options')
export class CivHousingOptions extends LightDomSlotMixin(CivFormElement) {
  @property({ type: String }) legend = '';
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;
  @property({ type: String }) size?: LabelSize;
  @property({ type: String, attribute: 'address-name' }) addressName = 'address';

  @property({ type: String, attribute: 'checkbox-label' }) checkboxLabel = '';
  @property({ type: String, attribute: 'intro-heading' }) introHeading = '';
  @property({ type: String, attribute: 'intro-text' }) introText = '';
  @property({ type: String, attribute: 'options-legend' }) optionsLegend = '';
  @property({ type: Boolean, attribute: 'hide-intro' }) hideIntro = false;
  @property({ type: String, attribute: 'continue-label' }) continueLabel = '';
  @property({ type: String, attribute: 'back-label' }) backLabel = '';

  @property({ attribute: 'mail-options' })
  set mailOptions(val: string | MailOption[]) {
    if (typeof val === 'string') {
      try { this._mailOptions = JSON.parse(val); } catch { this._mailOptions = null; }
    } else {
      this._mailOptions = val;
    }
  }

  @state() private _noPermanentAddress = false;
  @state() private _mailMethod = '';
  @state() private _step: 1 | 2 = 1;
  private _mailOptions: MailOption[] | null = null;

  private get _options(): MailOption[] {
    return this._mailOptions ?? DEFAULT_MAIL_OPTIONS;
  }

  private get _selectedOption(): MailOption | undefined {
    return this._options.find(o => o.value === this._mailMethod);
  }

  override _getSlotConfig(): SlotConfig {
    return { 'data-housing-callout': '[data-civ-housing-callout]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        ${this._step === 1 ? this._renderStep1() : this._renderStep2()}
      </fieldset>
    `;
  }

  private _renderStep1() {
    const options = this._options;
    const hasCalloutSlot = this._hasSlottedChildren('data-housing-callout');

    return html`
      ${!this.hideIntro ? html`
        <civ-section-intro
          heading="${this.introHeading || 'Your mailing address'}"
          tone="sensitive"
        >
          <p>${this.introText || "We need a mailing address to send you important documents. If you don't have a permanent address, we can work with you on other options."}</p>
        </civ-section-intro>
      ` : nothing}

      <civ-checkbox
        name="${this.name ? `${this.name}.noPermanentAddress` : ''}"
        label="${this.checkboxLabel || t('housingNoPermanentAddress')}"
        ?checked="${this._noPermanentAddress}"
        ?disabled="${this.disabled}"
        @civ-change="${this._onCheckboxChange}"
      ></civ-checkbox>

      ${!this._noPermanentAddress ? html`
        <civ-address
          size="lg"
          legend="Mailing address"
          name="${this.addressName}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
        ></civ-address>
      ` : html`
        ${hasCalloutSlot
          ? html`<div data-civ-housing-callout class="civ-mb-4"></div>`
          : nothing}

        <civ-form-fieldset legend="${this.optionsLegend || 'How would you like to receive mail?'}" size="lg">
          <civ-radio-group
            name="${this.name ? `${this.name}.mailMethod` : ''}"
            value="${this._mailMethod}"
            tile
            ?disabled="${this.disabled}"
            @civ-change="${this._onMailMethodChange}"
          >
            ${options.map(o => html`
              <civ-radio
                value="${o.value}"
                label="${o.label}"
                description="${o.description || nothing}"
              ></civ-radio>
            `)}
          </civ-radio-group>
        </civ-form-fieldset>

        ${this._mailMethod ? html`
          <div class="civ-mt-4">
            <civ-button
              label="${this.continueLabel || 'Continue'}"
              @click="${this._goToStep2}"
            ></civ-button>
          </div>
        ` : nothing}
      `}
    `;
  }

  private _renderStep2() {
    const option = this._selectedOption;
    if (!option) return nothing;

    return html`
      <civ-link
        variant="back"
        label="${this.backLabel || 'Back'}"
        @click="${this._goToStep1}"
        class="civ-mb-4 civ-block"
      ></civ-link>

      ${option.renders === 'address' ? html`
        <civ-address
          size="lg"
          legend="${option.addressLegend || 'Mailing address'}"
          name="${this.addressName}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          hint="${option.addressHint || nothing}"
        ></civ-address>
      ` : nothing}

      ${option.renders === 'contact' ? html`
        <civ-form-field label="${t('housingGeneralLocation')}">
          <civ-text-input name="${this.name ? `${this.name}.generalLocation` : ''}" ?disabled="${this.disabled}"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="State" ?required="${this.required}">
          <civ-select name="${this.name ? `${this.name}.state` : ''}" preset="us-states" ?disabled="${this.disabled}"></civ-select>
        </civ-form-field>
        <civ-form-field label="${t('housingContactMethod')}" ?required="${this.required}" hint="${t('housingContactMethodHint')}">
          <civ-textarea name="${this.name ? `${this.name}.contactMethod` : ''}" rows="3" ?disabled="${this.disabled}"></civ-textarea>
        </civ-form-field>
      ` : nothing}
    `;
  }

  private _goToStep2(): void {
    this._step = 2;
    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private _goToStep1(): void {
    this._step = 1;
    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private _onCheckboxChange(e: CustomEvent<{ checked: boolean }>): void {
    e.stopPropagation();
    this._noPermanentAddress = e.detail.checked;
    this._mailMethod = '';
    this._step = 1;
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
    this.value = JSON.stringify(value);
    dispatch(this, 'civ-input', { value });
    dispatch(this, 'civ-change', { value });
  }

  protected override _syncFormValue(): void {
    if (this.name) {
      this.syncFormDataFromState({
        noPermanentAddress: this._noPermanentAddress,
        mailMethod: this._mailMethod,
      }, this.name);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-housing-options': CivHousingOptions;
  }
}
