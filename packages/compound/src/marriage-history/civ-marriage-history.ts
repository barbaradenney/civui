import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, t } from '@civui/core';
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
  marriageDate: string;
  marriageCity: string;
  marriageState: string;
  status: string;
  endDate: string;
}

const EMPTY_MARRIAGE: MarriageValue = {
  spouseFirst: '', spouseMiddle: '', spouseLast: '', spouseSuffix: '',
  marriageType: '', marriageTypeDescription: '',
  marriageDate: '', marriageCity: '', marriageState: '',
  status: '', endDate: '',
};

/**
 * CivUI Marriage History
 *
 * Compound component for a single marriage entry. Captures spouse name,
 * marriage date and location, status, and conditional end date.
 * Designed to be used inside a `civ-repeater` for multiple marriages.
 *
 * @element civ-marriage-history
 *
 * @fires civ-input - On every field change, detail: { value: MarriageValue }
 * @fires civ-change - On committed field change, detail: { value: MarriageValue }
 */
@customElement('civ-marriage-history')
export class CivMarriageHistory extends CivFormElement {
  @property({ type: String }) legend = '';
  /** Show the marriage type selector (civil union, common law, etc.). */
  @property({ type: Boolean, attribute: 'show-marriage-type' }) showMarriageType = false;
  /** Skip the status question and assume this value. Use 'widowed' when the spouse's death is already established. */
  @property({ type: String, attribute: 'status-assumed' }) statusAssumed = '';

  @property({ type: String, attribute: 'spouse-error' }) spouseError = '';
  @property({ type: String, attribute: 'marriage-type-error' }) marriageTypeError = '';
  @property({ type: String, attribute: 'marriage-date-error' }) marriageDateError = '';
  @property({ type: String, attribute: 'city-error' }) cityError = '';
  @property({ type: String, attribute: 'state-error' }) stateError = '';
  @property({ type: String, attribute: 'status-error' }) statusError = '';
  @property({ type: String, attribute: 'end-date-error' }) endDateError = '';

  @state() private _marriage: MarriageValue = { ...EMPTY_MARRIAGE };

  get marriageValue(): MarriageValue {
    return { ...this._marriage };
  }

  set marriageValue(val: MarriageValue) {
    this._marriage = { ...EMPTY_MARRIAGE, ...val };
    this.value = JSON.stringify(this._marriage);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    if (this.value) {
      try {
        this._marriage = { ...EMPTY_MARRIAGE, ...JSON.parse(this.value) };
      } catch { /* leave empty */ }
    }
    if (this.statusAssumed) {
      this._marriage = { ...this._marriage, status: this.statusAssumed };
      this.value = JSON.stringify(this._marriage);
    }
    this._syncStatusOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('statusAssumed') && this.statusAssumed && this._marriage.status !== this.statusAssumed) {
      this._marriage = { ...this._marriage, status: this.statusAssumed };
      this.value = JSON.stringify(this._marriage);
    }
    if (changed.has('_marriage')) {
      this._syncStatusOptions();
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const prefix = this.name || 'marriage';
    const legend = this.legend || t('marriageLegend');
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
        ${renderLegend({ legend, required: this.required, textSizeClass: 'civ-text-lg' })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}

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
          <civ-select
            label="${t('marriageTypeLabel')}"
            name="${prefix}.marriageType"
            value="${this._marriage.marriageType}"
            error="${this.marriageTypeError}"
            ?disabled="${this.disabled}"
            data-marriage-type
            @civ-change="${this._onMarriageTypeChange}"
          ></civ-select>

          ${this._marriage.marriageType === 'other' || this._marriage.marriageType === 'common-law' ? html`
            <civ-text-input
              label="${t('marriageTypeDescriptionLabel')}"
              name="${prefix}.marriageTypeDescription"
              value="${this._marriage.marriageTypeDescription}"
              hint="${t('marriageTypeDescriptionHint')}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageTypeDescription', e)}"
              @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageTypeDescription', e)}"
            ></civ-text-input>
          ` : nothing}
        ` : nothing}

        <civ-memorable-date
          legend="${t('marriageDateLegend')}"
          name="${prefix}.marriageDate"
          value="${this._marriage.marriageDate}"
          error="${this.marriageDateError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageDate', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageDate', e)}"
        ></civ-memorable-date>

        <civ-text-input
          label="${t('marriageCityLabel')}"
          name="${prefix}.marriageCity"
          value="${this._marriage.marriageCity}"
          error="${this.cityError}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageCity', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageCity', e)}"
        ></civ-text-input>

        <civ-text-input
          label="${t('marriageStateLabel')}"
          name="${prefix}.marriageState"
          value="${this._marriage.marriageState}"
          error="${this.stateError}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onFieldInput('marriageState', e)}"
          @civ-change="${(e: CustomEvent) => this._onFieldChange('marriageState', e)}"
        ></civ-text-input>

        ${this.statusAssumed ? nothing : html`
          <civ-radio-group
            legend="${t('marriageStatusLegend')}"
            name="${prefix}.status"
            value="${this._marriage.status}"
            error="${this.statusError}"
            ?disabled="${this.disabled}"
            data-marriage-status
            @civ-input="${(e: CustomEvent) => e.stopPropagation()}"
            @civ-change="${this._onStatusChange}"
          >
            <civ-radio label="${t('marriageStatusCurrent')}" value="current"></civ-radio>
            <civ-radio label="${t('marriageStatusDivorced')}" value="divorced"></civ-radio>
            <civ-radio label="${t('marriageStatusWidowed')}" value="widowed"></civ-radio>
            <civ-radio label="${t('marriageStatusAnnulled')}" value="annulled"></civ-radio>
          </civ-radio-group>
        `}

        ${this._marriage.status && this._marriage.status !== 'current' ? html`
          <civ-memorable-date
            legend="${this._marriage.status === 'widowed' ? t('marriageEndDateWidowedLegend') : t('marriageEndDateLegend')}"
            name="${prefix}.endDate"
            value="${this._marriage.endDate}"
            error="${this.endDateError}"
            ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onFieldInput('endDate', e)}"
            @civ-change="${(e: CustomEvent) => this._onFieldChange('endDate', e)}"
          ></civ-memorable-date>
        ` : nothing}
      </fieldset>
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
    const oldType = this._marriage.marriageType;
    this._marriage = { ...this._marriage, marriageType: e.detail.value };
    // Clear description when switching away from types that need it
    if (oldType === 'other' || oldType === 'common-law') {
      if (this._marriage.marriageType !== 'other' && this._marriage.marriageType !== 'common-law') {
        this._marriage = { ...this._marriage, marriageTypeDescription: '' };
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
    const fd = new FormData();
    const prefix = this.name || 'marriage';
    fd.append(`${prefix}.spouseFirst`, this._marriage.spouseFirst);
    fd.append(`${prefix}.spouseMiddle`, this._marriage.spouseMiddle);
    fd.append(`${prefix}.spouseLast`, this._marriage.spouseLast);
    fd.append(`${prefix}.spouseSuffix`, this._marriage.spouseSuffix);
    fd.append(`${prefix}.marriageType`, this._marriage.marriageType);
    fd.append(`${prefix}.marriageTypeDescription`, this._marriage.marriageTypeDescription);
    fd.append(`${prefix}.marriageDate`, this._marriage.marriageDate);
    fd.append(`${prefix}.marriageCity`, this._marriage.marriageCity);
    fd.append(`${prefix}.marriageState`, this._marriage.marriageState);
    fd.append(`${prefix}.status`, this._marriage.status);
    fd.append(`${prefix}.endDate`, this._marriage.endDate);
    this.updateFormValue(fd);
  }

  override formResetCallback(): void {
    this._marriage = { ...EMPTY_MARRIAGE };
    this.value = '';
    this.spouseError = '';
    this.marriageTypeError = '';
    this.marriageDateError = '';
    this.cityError = '';
    this.stateError = '';
    this.statusError = '';
    this.endDateError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-marriage-history': CivMarriageHistory;
  }
}
