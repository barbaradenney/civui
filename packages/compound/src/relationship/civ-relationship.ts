import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy, t } from '@civui/core';
import '@civui/inputs';
import '@civui/controls';
import '../name/civ-name.js';
import { RELATIONSHIP_PRESETS } from './relationship-presets.js';
import type { RelationshipPreset, RelationshipTypeConfig, RelationshipCategory } from './relationship-presets.js';

export interface RelationshipValue {
  first: string;
  middle: string;
  last: string;
  suffix: string;
  relationship: string;
  marriageDate: string;
  divorceDate: string;
  dateOfBirth: string;
  adoptionDate: string;
  deceased: string;
  dateOfDeath: string;
  otherDescription: string;
}

const EMPTY_RELATIONSHIP: RelationshipValue = {
  first: '', middle: '', last: '', suffix: '',
  relationship: '',
  marriageDate: '', divorceDate: '',
  dateOfBirth: '', adoptionDate: '',
  deceased: '', dateOfDeath: '',
  otherDescription: '',
};

/**
 * CivUI Relationship
 *
 * Compound component for capturing a person and their relationship to the
 * applicant. Includes conditional follow-up fields based on the relationship
 * category (spousal → marriage date, child → date of birth, etc.).
 *
 * Use the `preset` prop for agency-specific option lists, or pass custom
 * `options` to override.
 *
 * @element civ-relationship
 *
 * @prop {string} legend - Fieldset legend text
 * @prop {RelationshipPreset} preset - Agency preset: 'general' | 'va-dependent' | 'va-survivor' | 'ssa-survivor' | 'immigration' | 'tax'
 * @prop {RelationshipTypeConfig[]} options - Custom options (overrides preset)
 * @prop {boolean} showName - Include name fields (default true)
 * @prop {boolean} showDeceased - Include deceased yes/no + date of death (default false)
 * @prop {boolean} showDivorceDate - Show divorce date for spousal types (default false)
 * @prop {boolean} showAdoptionDate - Show adoption date for child types (default false)
 *
 * @fires civ-input - On every field change, detail: { value: RelationshipValue }
 * @fires civ-change - On committed field change, detail: { value: RelationshipValue }
 */
@customElement('civ-relationship')
export class CivRelationship extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: String }) preset: RelationshipPreset = 'general';
  @property({ type: Array }) options?: RelationshipTypeConfig[];
  @property({ type: Boolean, attribute: 'show-name' }) showName = true;
  @property({ type: Boolean, attribute: 'show-deceased' }) showDeceased = false;
  /** Skip the "Is this person deceased?" question — assume yes and show date of death directly. */
  @property({ type: Boolean, attribute: 'deceased-assumed' }) deceasedAssumed = false;
  @property({ type: Boolean, attribute: 'show-divorce-date' }) showDivorceDate = false;
  @property({ type: Boolean, attribute: 'show-adoption-date' }) showAdoptionDate = false;

  // Field-level errors
  @property({ type: String, attribute: 'name-error' }) nameError = '';
  @property({ type: String, attribute: 'relationship-error' }) relationshipError = '';
  @property({ type: String, attribute: 'marriage-date-error' }) marriageDateError = '';
  @property({ type: String, attribute: 'divorce-date-error' }) divorceDateError = '';
  @property({ type: String, attribute: 'date-of-birth-error' }) dateOfBirthError = '';
  @property({ type: String, attribute: 'adoption-date-error' }) adoptionDateError = '';
  @property({ type: String, attribute: 'date-of-death-error' }) dateOfDeathError = '';
  @property({ type: String, attribute: 'other-description-error' }) otherDescriptionError = '';

  @state() private _data: RelationshipValue = { ...EMPTY_RELATIONSHIP };

  private get _activeOptions(): RelationshipTypeConfig[] {
    if (this.options) return this.options;
    return RELATIONSHIP_PRESETS[this.preset] ?? RELATIONSHIP_PRESETS['general'];
  }

  private get _category(): RelationshipCategory {
    const match = this._activeOptions.find(o => o.value === this._data.relationship);
    return match?.category ?? 'none';
  }

  get relationshipValue(): RelationshipValue {
    return { ...this._data };
  }

  set relationshipValue(val: RelationshipValue) {
    this._data = { ...EMPTY_RELATIONSHIP, ...val };
    this.value = JSON.stringify(this._data);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._data = this.parseStructuredValue(this.value, EMPTY_RELATIONSHIP);
    if (this.deceasedAssumed) {
      this._data = { ...this._data, deceased: 'yes' };
      this.value = JSON.stringify(this._data);
    }
    this._syncSelectOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('deceasedAssumed') && this.deceasedAssumed && this._data.deceased !== 'yes') {
      this._data = { ...this._data, deceased: 'yes' };
      this.value = JSON.stringify(this._data);
    }
    if (changed.has('preset') || changed.has('options')) {
      this._syncSelectOptions();
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const prefix = this.name || 'relationship';
    const legend = this.legend || t('relationshipLegend');
    const category = this._category;
    const nameJson = JSON.stringify({
      first: this._data.first,
      middle: this._data.middle,
      last: this._data.last,
      suffix: this._data.suffix,
    });

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend, required: this.required, textSizeClass: 'civ-text-lg' }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        ${this.showName ? html`
          <civ-name
            legend="${t('relationshipNameLegend')}"
            name="${prefix}.name"
            value="${nameJson}"
            error="${this.nameError}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${this._onNameInput}"
            @civ-change="${this._onNameChange}"
          ></civ-name>
        ` : nothing}

        <civ-select
          label="${t('relationshipTypeLabel')}"
          name="${prefix}.relationship"
          value="${this._data.relationship}"
          error="${this.relationshipError}"
          ?disabled="${this.disabled}"
          data-relationship-type
          @civ-change="${this._onRelationshipChange}"
        ></civ-select>

        ${category === 'spousal' ? html`
          <civ-memorable-date
            label="${t('relationshipMarriageDateLegend')}"
            name="${prefix}.marriageDate"
            value="${this._data.marriageDate}"
            error="${this.marriageDateError}"
            ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onDateInput('marriageDate', e)}"
            @civ-change="${(e: CustomEvent) => this._onDateChange('marriageDate', e)}"
          ></civ-memorable-date>

          ${this.showDivorceDate ? html`
            <civ-memorable-date
              label="${t('relationshipDivorceDateLegend')}"
              name="${prefix}.divorceDate"
              value="${this._data.divorceDate}"
              error="${this.divorceDateError}"
              ?disabled="${this.disabled}"
              @civ-input="${(e: CustomEvent) => this._onDateInput('divorceDate', e)}"
              @civ-change="${(e: CustomEvent) => this._onDateChange('divorceDate', e)}"
            ></civ-memorable-date>
          ` : nothing}
        ` : nothing}

        ${category === 'child' ? html`
          <civ-memorable-date
            label="${t('relationshipDateOfBirthLegend')}"
            name="${prefix}.dateOfBirth"
            value="${this._data.dateOfBirth}"
            error="${this.dateOfBirthError}"
            ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onDateInput('dateOfBirth', e)}"
            @civ-change="${(e: CustomEvent) => this._onDateChange('dateOfBirth', e)}"
          ></civ-memorable-date>

          ${this.showAdoptionDate ? html`
            <civ-memorable-date
              label="${t('relationshipAdoptionDateLegend')}"
              name="${prefix}.adoptionDate"
              value="${this._data.adoptionDate}"
              error="${this.adoptionDateError}"
              ?disabled="${this.disabled}"
              @civ-input="${(e: CustomEvent) => this._onDateInput('adoptionDate', e)}"
              @civ-change="${(e: CustomEvent) => this._onDateChange('adoptionDate', e)}"
            ></civ-memorable-date>
          ` : nothing}
        ` : nothing}

        ${category === 'other' ? html`
          <civ-text-input
            label="${t('relationshipOtherLabel')}"
            name="${prefix}.otherDescription"
            value="${this._data.otherDescription}"
            hint="${t('relationshipOtherHint')}"
            error="${this.otherDescriptionError}"
            ?disabled="${this.disabled}"
            ?readonly="${this.readonly}"
            @civ-input="${this._onOtherInput}"
            @civ-change="${this._onOtherChange}"
          ></civ-text-input>
        ` : nothing}

        ${this.deceasedAssumed ? html`
          <civ-memorable-date
            label="${t('relationshipDateOfDeathLegend')}"
            name="${prefix}.dateOfDeath"
            value="${this._data.dateOfDeath}"
            error="${this.dateOfDeathError}"
            ?disabled="${this.disabled}"
            @civ-input="${(e: CustomEvent) => this._onDateInput('dateOfDeath', e)}"
            @civ-change="${(e: CustomEvent) => this._onDateChange('dateOfDeath', e)}"
          ></civ-memorable-date>
        ` : this.showDeceased ? html`
          <civ-yes-no
            label="${t('relationshipDeceasedLegend')}"
            name="${prefix}.deceased"
            value="${this._data.deceased}"
            ?disabled="${this.disabled}"
            .readonly="${this.readonly}"
            @civ-input="${(e: CustomEvent) => e.stopPropagation()}"
            @civ-change="${this._onDeceasedChange}"
          ></civ-yes-no>

          ${this._data.deceased === 'yes' ? html`
            <civ-memorable-date
              label="${t('relationshipDateOfDeathLegend')}"
              name="${prefix}.dateOfDeath"
              value="${this._data.dateOfDeath}"
              error="${this.dateOfDeathError}"
              ?disabled="${this.disabled}"
              @civ-input="${(e: CustomEvent) => this._onDateInput('dateOfDeath', e)}"
              @civ-change="${(e: CustomEvent) => this._onDateChange('dateOfDeath', e)}"
            ></civ-memorable-date>
          ` : nothing}
        ` : nothing}
      </fieldset>
    `;
  }

  private _syncSelectOptions(): void {
    const select = this.querySelector('[data-relationship-type]') as any;
    if (!select) return;
    select.options = this._activeOptions.map(o => ({
      value: o.value,
      label: o.label ?? (o.labelKey ? t(o.labelKey) : o.value),
    }));
  }

  private _onNameInput(e: CustomEvent): void {
    e.stopPropagation();
    const nameVal = typeof e.detail?.value === 'object' ? e.detail.value : {};
    this._data = {
      ...this._data,
      first: nameVal.first ?? this._data.first,
      middle: nameVal.middle ?? this._data.middle,
      last: nameVal.last ?? this._data.last,
      suffix: nameVal.suffix ?? this._data.suffix,
    };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
  }

  private _onNameChange(e: CustomEvent): void {
    e.stopPropagation();
    const nameVal = typeof e.detail?.value === 'object' ? e.detail.value : {};
    this._data = {
      ...this._data,
      first: nameVal.first ?? this._data.first,
      middle: nameVal.middle ?? this._data.middle,
      last: nameVal.last ?? this._data.last,
      suffix: nameVal.suffix ?? this._data.suffix,
    };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onRelationshipChange(e: CustomEvent): void {
    e.stopPropagation();
    const oldCategory = this._category;
    this._data = { ...this._data, relationship: e.detail.value };
    const newCategory = this._category;

    // Clear fields and errors that no longer apply when category changes
    if (oldCategory !== newCategory) {
      if (oldCategory === 'spousal') {
        this._data = { ...this._data, marriageDate: '', divorceDate: '' };
        this.marriageDateError = '';
        this.divorceDateError = '';
      } else if (oldCategory === 'child') {
        this._data = { ...this._data, dateOfBirth: '', adoptionDate: '' };
        this.dateOfBirthError = '';
        this.adoptionDateError = '';
      } else if (oldCategory === 'other') {
        this._data = { ...this._data, otherDescription: '' };
        this.otherDescriptionError = '';
      }
    }

    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onDateInput(field: keyof RelationshipValue, e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, [field]: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
  }

  private _onDateChange(field: keyof RelationshipValue, e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, [field]: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onDeceasedChange(e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, deceased: e.detail.value };
    if (this._data.deceased !== 'yes') {
      this._data = { ...this._data, dateOfDeath: '' };
    }
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onOtherInput(e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, otherDescription: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
  }

  private _onOtherChange(e: CustomEvent): void {
    e.stopPropagation();
    this._data = { ...this._data, otherDescription: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  protected override _syncFormValue(): void {
    this.syncFormDataFromState(this._data, this.name || 'relationship');
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_RELATIONSHIP };
    this.value = '';
    this.nameError = '';
    this.relationshipError = '';
    this.marriageDateError = '';
    this.divorceDateError = '';
    this.dateOfBirthError = '';
    this.adoptionDateError = '';
    this.dateOfDeathError = '';
    this.otherDescriptionError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-relationship': CivRelationship;
  }
}
