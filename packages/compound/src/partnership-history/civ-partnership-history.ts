import { html, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { customElement, property, state } from 'lit/decorators.js';
import { CivCompoundElement, LegendHeadingMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import type { SelectLike } from '@civui/core';
import '@civui/inputs/text-input';
import '@civui/inputs/select';
import '@civui/inputs/memorable-date';
import '@civui/controls/radio';
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

/**
 * Internal category each visible partnership type maps to. The category
 * drives which type-specific fields render and which status vocabulary
 * to use:
 *  - `marriage`    — legal marriage and tribal marriage. Marriage status
 *                    vocabulary (current / divorced / widowed / annulled).
 *                    Renders ceremony fields (date, city, state).
 *  - `civil-union` — civil unions and registered domestic partnerships.
 *                    Partnership status vocabulary. Renders registration
 *                    fields (registration date, jurisdiction).
 *  - `cohabitation`— informal long-term partnerships, common-law marriages.
 *                    Partnership status vocabulary. Renders cohabitation
 *                    fields (start date, state, optional description).
 *  - `other`       — anything else. Partnership status vocabulary. Renders
 *                    approximate-date + free-form description fields.
 *  - `none`        — no type selected yet. Treated as marriage by default
 *                    so the form has a sensible initial state.
 */
type PartnershipTypeCategory = 'marriage' | 'civil-union' | 'cohabitation' | 'other' | 'none';

const TYPE_CATEGORIES: Record<string, PartnershipTypeCategory> = {
  'legal': 'marriage',
  'tribal': 'marriage',
  'civil-union': 'civil-union',
  'domestic-partnership': 'civil-union',
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
 * CivUI Partnership History
 *
 * Compound component for a single long-term partner relationship —
 * covers marriage, civil union, registered domestic partnership,
 * cohabitation / common-law, and other long-term partnerships.
 * Captures the partner's name, the relationship's start date and
 * location, current status, and a conditional end date. Status
 * vocabulary adapts to the selected partnership type. Designed to
 * be used inside a `civ-repeater` for multiple entries.
 *
 * @element civ-partnership-history
 *
 * @fires civ-input - On every field change, detail: { value: MarriageValue }
 * @fires civ-change - On committed field change, detail: { value: MarriageValue }
 */
@customElement('civ-partnership-history')
export class CivPartnershipHistory extends LegendHeadingMixin(CivCompoundElement) {
  protected override _empty: MarriageValue = { ...EMPTY_MARRIAGE };

  @property({ type: String }) legend = '';
  /** Show the marriage type selector (civil union, common law, etc.). */
  @property({ type: Boolean, attribute: 'show-marriage-type' }) showMarriageType = false;
  /** Skip the status question and assume this value. Use 'widowed' when the spouse's death is already established. */
  @property({ type: String, attribute: 'status-assumed' }) statusAssumed = '';

  /**
   * Render only one section of the form. Useful when splitting the
   * compound across multiple `<civ-form-step>` pages so each page asks
   * one focused question:
   *  - `'who'` — partner name (and partnership type if `show-marriage-type`)
   *  - `'details'` — type-specific date/location/jurisdiction fields
   *  - `'status'` — current status and conditional end-date
   *
   * When unset (default), the component renders all sections on one page.
   * The component still serializes the same `MarriageValue` shape across
   * all steps — consumers thread the `value` through each step.
   */
  @property({ type: String }) step?: 'who' | 'details' | 'status';

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

  @state() protected override _data: MarriageValue = { ...EMPTY_MARRIAGE };

  private get _typeCategory(): PartnershipTypeCategory {
    return TYPE_CATEGORIES[this._data.marriageType] ?? 'none';
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
    const s = this._data.status;
    if (s === 'widowed' || s === 'partner-deceased') {
      return t('marriageEndDateWidowedLegend');
    }
    if (s === 'ended') {
      return t('partnershipEndDateLegend');
    }
    return t('marriageEndDateLegend');
  }

  get marriageValue(): MarriageValue {
    return { ...this._data };
  }

  set marriageValue(val: MarriageValue) {
    this._data = { ...EMPTY_MARRIAGE, ...val };
    this.value = JSON.stringify(this._data);
  }

  override connectedCallback(): void {
    // Base CivCompoundElement hydrates `_data`. Post-hydration: apply
    // `status-assumed` policy so consumers can force a status declaratively.
    super.connectedCallback();
    if (this.statusAssumed && this._data.status !== this.statusAssumed) {
      this._data = { ...this._data, status: this.statusAssumed };
      this.value = JSON.stringify(this._data);
    }
  }

  override willUpdate(changed: Map<string, unknown>): void {
    // Sync derived state before render so we don't trigger a second update
    // cycle from `updated()`.
    if (changed.has('statusAssumed') && this.statusAssumed && this._data.status !== this.statusAssumed) {
      this._data = { ...this._data, status: this.statusAssumed };
      this.value = JSON.stringify(this._data);
    }
  }

  override async firstUpdated(): Promise<void> {
    super.firstUpdated();
    try {
      await this.updateComplete;
      this._syncStatusOptions();
    } catch (err) {
      console.error('civ-partnership-history: failed to sync status options on first render', err);
    }
  }

  override async updated(changed: Map<string, unknown>): Promise<void> {
    super.updated(changed);
    if (changed.has('_data')) {
      try {
        await this.updateComplete;
        this._syncStatusOptions();
      } catch (err) {
        console.error('civ-partnership-history: failed to re-sync status options after data change', err);
      }
    }
  }

  /**
   * Default legend per step. Used when the consumer doesn't pass an
   * explicit `legend`. The all-on-one-page form falls back to the
   * generic "About this partnership".
   */
  private _legendForStep(): string {
    if (this.legend) return this.legend;
    switch (this.step) {
      case 'who': return t('partnershipStepWhoLegend');
      case 'details': return t('partnershipStepDetailsLegend');
      case 'status': return t('partnershipStepStatusLegend');
      default: return t('partnershipLegendDefault');
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const prefix = this.name || 'marriage';
    const showAll = !this.step;
    const showWho = showAll || this.step === 'who';
    const showDetails = showAll || this.step === 'details';
    const showStatus = showAll || this.step === 'status';

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this._legendForStep(), required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        ${showWho ? this._renderWho(prefix) : nothing}
        ${showDetails ? this._renderCategoryFields(prefix) : nothing}
        ${showStatus ? this._renderStatus(prefix) : nothing}
      </fieldset>
    `;
  }

  /** Step 1: who — partner name + (optional) partnership type. */
  private _renderWho(prefix: string) {
    const nameJson = JSON.stringify({
      first: this._data.spouseFirst,
      middle: this._data.spouseMiddle,
      last: this._data.spouseLast,
      suffix: this._data.spouseSuffix,
    });
    return html`
      <civ-name
        legend="${t('marriageSpouseLegend')}"
        name="${prefix}.spouse"
        value="${nameJson}"
        error="${this.spouseError}"
        ?required="${this.required}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        @civ-input="${this._onNameInput}"
        @civ-change="${this._onNameChange}"
      ></civ-name>

      ${this.showMarriageType ? html`
        <civ-select
          label="${t('marriageTypeLabel')}"
          name="${prefix}.marriageType"
          value="${this._data.marriageType}"
          error="${this.marriageTypeError}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          data-marriage-type
          @civ-change="${this._onMarriageTypeChange}"
        ></civ-select>
      ` : nothing}
    `;
  }

  /** Step 3: status — current status + conditional end-date. */
  private _renderStatus(prefix: string) {
    // Two status vocabularies: marriage uses divorced/widowed/annulled; the
    // other partnership categories use a more generic ended/partner-deceased
    // set. When `showMarriageType` is off, the form is implicitly marriage
    // (the original use case) so we default to the marriage vocabulary.
    const isMarriageStatusVocab = !this.showMarriageType ||
      this._typeCategory === 'marriage' ||
      this._typeCategory === 'none';
    // civ-radio-group uses LightDomSlotMixin — it captures its <civ-radio>
    // children once on connect. Swapping the radio set inline when the
    // vocabulary flips would leave the old radios in the slot target
    // and put the new ones at the host root, and lit-html's diff walk
    // then crashes on detached markers (see .claude/rules/common-traps.md,
    // "LightDomSlotMixin composition with dynamic Lit children"). Keying
    // by vocab forces a fresh civ-radio-group when the vocab changes, so
    // each instance captures its own static set of radios.
    return html`
      ${this.statusAssumed ? nothing : keyed(isMarriageStatusVocab, html`
        <civ-radio-group
          legend="${isMarriageStatusVocab ? t('marriageStatusLegend') : t('partnershipStatusLegend')}"
          name="${prefix}.status"
          value="${this._data.status}"
          error="${this.statusError}"
          variant="list"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
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
      `)}

      ${this._data.status && this._data.status !== 'current' ? html`
        <civ-memorable-date
          legend="${this._endDateLegend()}"
          name="${prefix}.endDate"
          value="${this._data.endDate}"
          error="${this.endDateError}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('endDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('endDate', e)}"
        ></civ-memorable-date>
      ` : nothing}
    `;
  }

  private _renderCategoryFields(prefix: string) {
    const cat = this._typeCategory;

    if (cat === 'marriage' || !this.showMarriageType) {
      return html`
        <civ-memorable-date legend="${t('marriageDateLegend')}" name="${prefix}.marriageDate"
          value="${this._data.marriageDate}" error="${this.marriageDateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"></civ-memorable-date>
        <civ-text-input label="${t('marriageCityLabel')}" name="${prefix}.marriageCity"
          value="${this._data.marriageCity}" error="${this.cityError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageCity', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageCity', e)}"></civ-text-input>
        <civ-text-input label="${t('marriageStateLabel')}" name="${prefix}.marriageState"
          value="${this._data.marriageState}" error="${this.stateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageState', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageState', e)}"></civ-text-input>
      `;
    }

    if (cat === 'civil-union') {
      return html`
        <civ-memorable-date legend="${t('marriageRegistrationDateLegend')}" name="${prefix}.marriageDate"
          value="${this._data.marriageDate}" error="${this.marriageDateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"></civ-memorable-date>
        <civ-text-input label="${t('marriageJurisdictionLabel')}" name="${prefix}.jurisdiction"
          value="${this._data.jurisdiction}" error="${this.jurisdictionError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('jurisdiction', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('jurisdiction', e)}"></civ-text-input>
      `;
    }

    if (cat === 'cohabitation') {
      return html`
        <civ-memorable-date legend="${t('marriageCohabitationStartLegend')}" name="${prefix}.cohabitationStartDate"
          value="${this._data.cohabitationStartDate}" error="${this.cohabitationStartError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('cohabitationStartDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('cohabitationStartDate', e)}"></civ-memorable-date>
        <civ-text-input label="${t('marriageCohabitationStateLabel')}" name="${prefix}.cohabitationState"
          value="${this._data.cohabitationState}" error="${this.cohabitationStateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('cohabitationState', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('cohabitationState', e)}"></civ-text-input>
        ${this._renderDescriptionField(prefix)}
      `;
    }

    if (cat === 'other') {
      return html`
        <civ-memorable-date legend="${t('marriageApproxDateLegend')}" name="${prefix}.marriageDate"
          value="${this._data.marriageDate}" error="${this.marriageDateError}" ?disabled="${this.disabled}" ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"></civ-memorable-date>
        ${this._renderDescriptionField(prefix)}
      `;
    }

    return nothing;
  }

  private _renderDescriptionField(prefix: string) {
    return html`
      <civ-text-input label="${t('marriageTypeDescriptionLabel')}" name="${prefix}.marriageTypeDescription"
        value="${this._data.marriageTypeDescription}" hint="${t('marriageTypeDescriptionHint')}"
        ?disabled="${this.disabled}" ?readonly="${this.readonly}"
        @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageTypeDescription', e)}"
        @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageTypeDescription', e)}"></civ-text-input>
    `;
  }

  private _syncStatusOptions(): void {
    // Sync marriage type select options
    const typeSelect = this.querySelector('[data-marriage-type]') as SelectLike | null;
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
    this._data = { ...this._data, marriageType: e.detail.value };
    const newCategory = this._typeCategory;

    // Clear fields that no longer apply when category changes
    if (oldCategory !== newCategory) {
      if (oldCategory === 'marriage') {
        this._data = { ...this._data, marriageDate: '', marriageCity: '', marriageState: '' };
        this.marriageDateError = '';
        this.cityError = '';
        this.stateError = '';
      } else if (oldCategory === 'civil-union') {
        this._data = { ...this._data, marriageDate: '', jurisdiction: '' };
        this.marriageDateError = '';
        this.jurisdictionError = '';
      } else if (oldCategory === 'cohabitation') {
        this._data = { ...this._data, cohabitationStartDate: '', cohabitationState: '', marriageTypeDescription: '' };
        this.cohabitationStartError = '';
        this.cohabitationStateError = '';
      } else if (oldCategory === 'other') {
        this._data = { ...this._data, marriageDate: '', marriageTypeDescription: '' };
        this.marriageDateError = '';
      }
    }

    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onNameInput(e: CustomEvent): void {
    e.stopPropagation();
    const v = typeof e.detail?.value === 'object' ? e.detail.value : {};
    this._data = {
      ...this._data,
      spouseFirst: v.first ?? this._data.spouseFirst,
      spouseMiddle: v.middle ?? this._data.spouseMiddle,
      spouseLast: v.last ?? this._data.spouseLast,
      spouseSuffix: v.suffix ?? this._data.spouseSuffix,
    };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
  }

  private _onNameChange(e: CustomEvent): void {
    e.stopPropagation();
    const v = typeof e.detail?.value === 'object' ? e.detail.value : {};
    this._data = {
      ...this._data,
      spouseFirst: v.first ?? this._data.spouseFirst,
      spouseMiddle: v.middle ?? this._data.spouseMiddle,
      spouseLast: v.last ?? this._data.spouseLast,
      spouseSuffix: v.suffix ?? this._data.spouseSuffix,
    };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onStatusChange(e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, status: e.detail.value };
    if (this._data.status === 'current') {
      this._data = { ...this._data, endDate: '' };
      this.endDateError = '';
    }
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onFieldInput(field: keyof MarriageValue, e: CustomEvent): void {
    e.stopPropagation();

    this._data = this._patchStructured(this._data, { [field]: e.detail.value } as Partial<MarriageValue>);
  }

  private _onFieldChange(field: keyof MarriageValue, e: CustomEvent): void {
    e.stopPropagation();

    this._data = this._patchStructured(this._data, { [field]: e.detail.value } as Partial<MarriageValue>, ['change']);
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._data, this.name || 'marriage');
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_MARRIAGE };
    this._resetCompound([
      'spouseError', 'marriageTypeError', 'marriageDateError', 'cityError',
      'stateError', 'jurisdictionError', 'cohabitationStartError',
      'cohabitationStateError', 'statusError', 'endDateError',
    ]);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-partnership-history': CivPartnershipHistory;
  }
}
