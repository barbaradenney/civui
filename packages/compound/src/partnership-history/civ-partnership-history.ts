import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '../name/civ-name.js';

export interface MarriageValue {
  spouseFirst: string;
  spouseMiddle: string;
  spouseLast: string;
  spouseSuffix: string;
  marriageType: string;
  marriageTypeDescription: string;
  // ceremony + registration fields
  marriageDate: string;
  marriageCity: string;
  marriageState: string;
  // registration-specific
  jurisdiction: string;
  // cohabitation-specific
  cohabitationStartDate: string;
  cohabitationState: string;
  // common
  status: string;
  endDate: string;
}

type MarriageTypeCategory = 'ceremony' | 'registration' | 'cohabitation' | 'other' | 'none';

const TYPE_CATEGORIES: Record<string, MarriageTypeCategory> = {
  'legal': 'ceremony',
  'tribal': 'ceremony',
  'civil-union': 'registration',
  'domestic-partnership': 'registration',
  'common-law': 'cohabitation',
  'other': 'other',
};

const EMPTY_MARRIAGE: MarriageValue = {
  spouseFirst: '', spouseMiddle: '', spouseLast: '', spouseSuffix: '',
  marriageType: '', marriageTypeDescription: '',
  marriageDate: '', marriageCity: '', marriageState: '',
  jurisdiction: '',
  cohabitationStartDate: '', cohabitationState: '',
  status: '', endDate: '',
};

/**
 * CivUI Marriage History
 *
 * Compound component for a single marriage entry. Captures spouse name,
 * marriage date and location, status, and conditional end date.
 * Designed to be used inside a `civ-repeater` for multiple marriages.
 *
 * @element civ-partnership-history
 *
 * @fires civ-input - On every field change, detail: { value: MarriageValue }
 * @fires civ-change - On committed field change, detail: { value: MarriageValue }
 */
@customElement('civ-partnership-history')
export class CivPartnershipHistory extends CivFormElement {
  @property({ type: String }) legend = '';

  /**
   * Promote the legend to a heading via `role="heading"` + `aria-level=N`.
   * Use sparingly — typically only when this field is the primary question
   * on a single-question page (level 1) or the top legend inside a
   * form-step (level 2 or 3).
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the legend. Default and `sm` render at body size;
   * `md`/`lg`/`xl` increase the size for use as a section/page heading.
   * At `[data-civ-scale="fluid"]`, `xl` renders very large.
   */
  @property({ type: String }) size?: LabelSize;
  /** Show the marriage type selector (civil union, common law, etc.). */
  @property({ type: Boolean, attribute: 'show-marriage-type' }) showMarriageType = false;
  /** Skip the status question and assume this value. Use 'widowed' when the spouse's death is already established. */
  @property({ type: String, attribute: 'status-assumed' }) statusAssumed = '';

  @property({ type: String, attribute: 'spouse-error' }) spouseError = '';
  @property({ type: String, attribute: 'marriage-type-error' }) marriageTypeError = '';
  @property({ type: String, attribute: 'marriage-date-error' }) marriageDateError = '';
  @property({ type: String, attribute: 'city-error' }) cityError = '';
  @property({ type: String, attribute: 'state-error' }) stateError = '';
  @property({ type: String, attribute: 'jurisdiction-error' }) jurisdictionError = '';
  @property({ type: String, attribute: 'cohabitation-start-error' }) cohabitationStartError = '';
  @property({ type: String, attribute: 'cohabitation-state-error' }) cohabitationStateError = '';
  @property({ type: String, attribute: 'status-error' }) statusError = '';
  @property({ type: String, attribute: 'end-date-error' }) endDateError = '';

  @state() private _marriage: MarriageValue = { ...EMPTY_MARRIAGE };

  private get _typeCategory(): MarriageTypeCategory {
    return TYPE_CATEGORIES[this._marriage.marriageType] ?? 'none';
  }

  /**
   * Pick the end-date fieldset legend that matches the current status:
   *  - marriage `widowed` or partnership `partner-deceased` → "Date of their passing"
   *  - marriage `divorced` / `annulled` → "Date marriage ended"
   *  - partnership `ended` → "Date the relationship ended"
   *  - anything else (shouldn't happen because the date only renders when
   *    status is non-current and non-empty) → fall back to the marriage
   *    end-date label as the safe default.
   */
  private _endDateLegend(): string {
    const s = this._marriage.status;
    if (s === 'widowed' || s === 'partner-deceased') {
      return t('marriageEndDateWidowedLegend');
    }
    if (s === 'ended') {
      return t('partnershipEndDateLegend');
    }
    return t('marriageEndDateLegend');
  }

  get marriageValue(): MarriageValue {
    return { ...this._marriage };
  }

  set marriageValue(val: MarriageValue) {
    this._marriage = { ...EMPTY_MARRIAGE, ...val };
    this.value = JSON.stringify(this._marriage);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._marriage = this.parseStructuredValue(this.value, EMPTY_MARRIAGE);
    if (this.statusAssumed) {
      this._marriage = { ...this._marriage, status: this.statusAssumed };
      this.value = JSON.stringify(this._marriage);
    }
    this.updateComplete.then(() => this._syncStatusOptions());
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('statusAssumed') && this.statusAssumed && this._marriage.status !== this.statusAssumed) {
      this._marriage = { ...this._marriage, status: this.statusAssumed };
      this.value = JSON.stringify(this._marriage);
    }
    if (changed.has('_marriage')) {
      this.updateComplete.then(() => this._syncStatusOptions());
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const prefix = this.name || 'marriage';
    // The component now covers any long-term partner relationship — marriage,
    // civil union, registered domestic partnership, cohabitation, or other.
    // Default to the inclusive "About this partnership" so consumers who
    // don't pass a `legend` get a label that doesn't presume marriage. When
    // a marriage-specific form needs the original wording, the consumer
    // sets `legend="About this marriage"` explicitly.
    const legend = this.legend || t('partnershipLegendDefault');
    // Two status vocabularies: marriage uses divorced/widowed/annulled; the
    // other partnership categories use a more generic ended/partner-deceased
    // set. When `showMarriageType` is off, the form is implicitly marriage
    // (the original use case) so we default to the marriage vocabulary.
    const isMarriageStatusVocab = !this.showMarriageType ||
      this._typeCategory === 'ceremony' ||
      this._typeCategory === 'none';
    const nameJson = JSON.stringify({
      first: this._marriage.spouseFirst,
      middle: this._marriage.spouseMiddle,
      last: this._marriage.spouseLast,
      suffix: this._marriage.spouseSuffix,
    });

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend, required: this.required, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-name
          legend="${t('marriageSpouseLegend')}"
          name="${prefix}.spouse"
          value="${nameJson}"
          error="${this.spouseError}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${this._onNameInput}"
          @civ-change="${this._onNameChange}"
        ></civ-name>

        ${this.showMarriageType ? html`
          <civ-form-field label="${t('marriageTypeLabel')}" error="${this.marriageTypeError}">
            <civ-select
              name="${prefix}.marriageType"
              value="${this._marriage.marriageType}"
              error="${this.marriageTypeError}"
              ?disabled="${this.disabled}"
              data-marriage-type
              @civ-change="${this._onMarriageTypeChange}"
            ></civ-select>
          </civ-form-field>
        ` : nothing}

        ${this._renderCategoryFields(prefix)}

        ${this.statusAssumed ? nothing : html`
          <civ-radio-group
            legend="${isMarriageStatusVocab ? t('marriageStatusLegend') : t('partnershipStatusLegend')}"
            name="${prefix}.status"
            value="${this._marriage.status}"
            error="${this.statusError}"
            variant="list"
            ?disabled="${this.disabled}"
            data-marriage-status
            @civ-input="${(e: CustomEvent) => e.stopPropagation()}"
            @civ-change="${this._onStatusChange}"
          >
            ${isMarriageStatusVocab ? html`
              <civ-radio label="${t('marriageStatusCurrent')}" value="current"></civ-radio>
              <civ-radio label="${t('marriageStatusDivorced')}" value="divorced"></civ-radio>
              <civ-radio label="${t('marriageStatusWidowed')}" value="widowed"></civ-radio>
              <civ-radio label="${t('marriageStatusAnnulled')}" value="annulled"></civ-radio>
            ` : html`
              <civ-radio label="${t('partnershipStatusOngoing')}" value="current"></civ-radio>
              <civ-radio label="${t('partnershipStatusEnded')}" value="ended"></civ-radio>
              <civ-radio label="${t('partnershipStatusPartnerDeceased')}" value="partner-deceased"></civ-radio>
            `}
          </civ-radio-group>
        `}

        ${this._marriage.status && this._marriage.status !== 'current' ? html`
          <civ-form-fieldset legend="${this._endDateLegend()}">
            <civ-memorable-date
              name="${prefix}.endDate"
              value="${this._marriage.endDate}"
              error="${this.endDateError}"
              ?disabled="${this.disabled}"
              @civ-input="${(e: CustomEvent) => this._onFieldInput('endDate', e)}"
              @civ-change="${(e: CustomEvent) => this._onFieldChange('endDate', e)}"
            ></civ-memorable-date>
          </civ-form-fieldset>
        ` : nothing}
      </fieldset>
    `;
  }

  private _renderCategoryFields(prefix: string) {
    const cat = this._typeCategory;

    if (cat === 'ceremony' || !this.showMarriageType) {
      return html`
        <civ-form-fieldset legend="${t('marriageDateLegend')}">
          <civ-memorable-date name="${prefix}.marriageDate"
            value="${this._marriage.marriageDate}" error="${this.marriageDateError}" ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"></civ-memorable-date>
        </civ-form-fieldset>
        <civ-form-field label="${t('marriageCityLabel')}" error="${this.cityError}">
          <civ-text-input name="${prefix}.marriageCity"
            value="${this._marriage.marriageCity}" error="${this.cityError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageCity', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageCity', e)}"></civ-text-input>
        </civ-form-field>
        <civ-form-field label="${t('marriageStateLabel')}" error="${this.stateError}">
          <civ-text-input name="${prefix}.marriageState"
            value="${this._marriage.marriageState}" error="${this.stateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageState', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageState', e)}"></civ-text-input>
        </civ-form-field>
      `;
    }

    if (cat === 'registration') {
      return html`
        <civ-form-fieldset legend="${t('marriageRegistrationDateLegend')}">
          <civ-memorable-date name="${prefix}.marriageDate"
            value="${this._marriage.marriageDate}" error="${this.marriageDateError}" ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"></civ-memorable-date>
        </civ-form-fieldset>
        <civ-form-field label="${t('marriageJurisdictionLabel')}" error="${this.jurisdictionError}">
          <civ-text-input name="${prefix}.jurisdiction"
            value="${this._marriage.jurisdiction}" error="${this.jurisdictionError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('jurisdiction', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('jurisdiction', e)}"></civ-text-input>
        </civ-form-field>
      `;
    }

    if (cat === 'cohabitation') {
      return html`
        <civ-form-fieldset legend="${t('marriageCohabitationStartLegend')}">
          <civ-memorable-date name="${prefix}.cohabitationStartDate"
            value="${this._marriage.cohabitationStartDate}" error="${this.cohabitationStartError}" ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('cohabitationStartDate', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('cohabitationStartDate', e)}"></civ-memorable-date>
        </civ-form-fieldset>
        <civ-form-field label="${t('marriageCohabitationStateLabel')}" error="${this.cohabitationStateError}">
          <civ-text-input name="${prefix}.cohabitationState"
            value="${this._marriage.cohabitationState}" error="${this.cohabitationStateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('cohabitationState', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('cohabitationState', e)}"></civ-text-input>
        </civ-form-field>
        ${this._renderDescriptionField(prefix)}
      `;
    }

    if (cat === 'other') {
      return html`
        <civ-form-fieldset legend="${t('marriageApproxDateLegend')}">
          <civ-memorable-date name="${prefix}.marriageDate"
            value="${this._marriage.marriageDate}" error="${this.marriageDateError}" ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"></civ-memorable-date>
        </civ-form-fieldset>
        ${this._renderDescriptionField(prefix)}
      `;
    }

    return nothing;
  }

  private _renderDescriptionField(prefix: string) {
    return html`
      <civ-form-field label="${t('marriageTypeDescriptionLabel')}" hint="${t('marriageTypeDescriptionHint')}">
        <civ-text-input name="${prefix}.marriageTypeDescription"
          value="${this._marriage.marriageTypeDescription}" hint="${t('marriageTypeDescriptionHint')}"
          ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageTypeDescription', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageTypeDescription', e)}"></civ-text-input>
      </civ-form-field>
    `;
  }

  private _syncStatusOptions(): void {
    // Sync marriage type select options
    const typeSelect = this.querySelector('[data-marriage-type]') as any;
    if (typeSelect) {
      typeSelect.options = [
        { value: 'legal', label: t('marriageTypeLegal') },
        { value: 'civil-union', label: t('marriageTypeCivilUnion') },
        { value: 'domestic-partnership', label: t('marriageTypeDomesticPartnership') },
        { value: 'common-law', label: t('marriageTypeCommonLaw') },
        { value: 'tribal', label: t('marriageTypeTribal') },
        { value: 'other', label: t('marriageTypeOther') },
      ];
    }
  }

  private _onMarriageTypeChange(e: CustomEvent): void {
    e.stopPropagation();
    const oldCategory = this._typeCategory;
    this._marriage = { ...this._marriage, marriageType: e.detail.value };
    const newCategory = this._typeCategory;

    // Clear fields that no longer apply when category changes
    if (oldCategory !== newCategory) {
      if (oldCategory === 'ceremony') {
        this._marriage = { ...this._marriage, marriageDate: '', marriageCity: '', marriageState: '' };
        this.marriageDateError = '';
        this.cityError = '';
        this.stateError = '';
      } else if (oldCategory === 'registration') {
        this._marriage = { ...this._marriage, marriageDate: '', jurisdiction: '' };
        this.marriageDateError = '';
        this.jurisdictionError = '';
      } else if (oldCategory === 'cohabitation') {
        this._marriage = { ...this._marriage, cohabitationStartDate: '', cohabitationState: '', marriageTypeDescription: '' };
        this.cohabitationStartError = '';
        this.cohabitationStateError = '';
      } else if (oldCategory === 'other') {
        this._marriage = { ...this._marriage, marriageDate: '', marriageTypeDescription: '' };
        this.marriageDateError = '';
      }
    }

    this.value = JSON.stringify(this._marriage);
    dispatch(this, 'civ-input', { value: { ...this._marriage } });
    dispatch(this, 'civ-change', { value: { ...this._marriage } });
  }

  private _onNameInput(e: CustomEvent): void {
    e.stopPropagation();
    const v = typeof e.detail?.value === 'object' ? e.detail.value : {};
    this._marriage = {
      ...this._marriage,
      spouseFirst: v.first ?? this._marriage.spouseFirst,
      spouseMiddle: v.middle ?? this._marriage.spouseMiddle,
      spouseLast: v.last ?? this._marriage.spouseLast,
      spouseSuffix: v.suffix ?? this._marriage.spouseSuffix,
    };
    this.value = JSON.stringify(this._marriage);
    dispatch(this, 'civ-input', { value: { ...this._marriage } });
  }

  private _onNameChange(e: CustomEvent): void {
    e.stopPropagation();
    const v = typeof e.detail?.value === 'object' ? e.detail.value : {};
    this._marriage = {
      ...this._marriage,
      spouseFirst: v.first ?? this._marriage.spouseFirst,
      spouseMiddle: v.middle ?? this._marriage.spouseMiddle,
      spouseLast: v.last ?? this._marriage.spouseLast,
      spouseSuffix: v.suffix ?? this._marriage.spouseSuffix,
    };
    this.value = JSON.stringify(this._marriage);
    dispatch(this, 'civ-change', { value: { ...this._marriage } });
  }

  private _onStatusChange(e: CustomEvent): void {
    e.stopPropagation();
    this._marriage = { ...this._marriage, status: e.detail.value };
    if (this._marriage.status === 'current') {
      this._marriage = { ...this._marriage, endDate: '' };
      this.endDateError = '';
    }
    this.value = JSON.stringify(this._marriage);
    dispatch(this, 'civ-input', { value: { ...this._marriage } });
    dispatch(this, 'civ-change', { value: { ...this._marriage } });
  }

  private _onFieldInput(field: keyof MarriageValue, e: CustomEvent): void {
    e.stopPropagation();
    this._marriage = { ...this._marriage, [field]: e.detail.value };
    this.value = JSON.stringify(this._marriage);
    dispatch(this, 'civ-input', { value: { ...this._marriage } });
  }

  private _onFieldChange(field: keyof MarriageValue, e: CustomEvent): void {
    e.stopPropagation();
    this._marriage = { ...this._marriage, [field]: e.detail.value };
    this.value = JSON.stringify(this._marriage);
    dispatch(this, 'civ-change', { value: { ...this._marriage } });
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._marriage, this.name || 'marriage');
  }

  override formResetCallback(): void {
    this._marriage = { ...EMPTY_MARRIAGE };
    this.value = '';
    this.spouseError = '';
    this.marriageTypeError = '';
    this.marriageDateError = '';
    this.cityError = '';
    this.stateError = '';
    this.jurisdictionError = '';
    this.cohabitationStartError = '';
    this.cohabitationStateError = '';
    this.statusError = '';
    this.endDateError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-partnership-history': CivPartnershipHistory;
  }
}
