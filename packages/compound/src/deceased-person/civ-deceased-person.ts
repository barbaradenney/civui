import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, t } from '@civui/core';
import '../name/civ-name.js';
import '@civui/inputs';

export interface DeceasedPersonValue {
  first: string;
  middle: string;
  last: string;
  suffix: string;
  dateOfBirth: string;
  dateOfDeath: string;
  relationship: string;
}

const EMPTY_DECEASED: DeceasedPersonValue = {
  first: '',
  middle: '',
  last: '',
  suffix: '',
  dateOfBirth: '',
  dateOfDeath: '',
  relationship: '',
};

/**
 * CivUI Deceased Person
 *
 * @deprecated Use `<civ-relationship preset="va-survivor" show-deceased>` instead.
 * This component will be removed in a future version.
 *
 * Compound field for collecting information about a person who has died —
 * used on VA burial benefit (21P-530), SSA survivor benefit, and probate
 * forms. Labels use plain, non-clinical language ("the person who died",
 * "date of death") rather than bureaucratic phrasing ("decedent",
 * "DOD"). Intended to be used inside a `civ-form-step sensitive`.
 *
 * @element civ-deceased-person
 *
 * @fires civ-input - Fires on every field change, detail: { value: DeceasedPersonValue }
 * @fires civ-change - Fires on committed field change, detail: { value: DeceasedPersonValue }
 *
 * @example
 * ```html
 * <civ-deceased-person
 *   legend="About your spouse"
 *   name="deceased"
 *   required
 * ></civ-deceased-person>
 * ```
 */
@customElement('civ-deceased-person')
export class CivDeceasedPerson extends CivFormElement {
  /** Fieldset legend. Defaults to the localized plain-language default. */
  @property({ type: String }) legend = '';

  /** Hide the relationship field (useful when relationship is captured elsewhere). */
  @property({ type: Boolean, attribute: 'hide-relationship' }) hideRelationship = false;

  /** Field-level errors. */
  @property({ type: String, attribute: 'name-error' }) nameError = '';
  @property({ type: String, attribute: 'date-of-birth-error' }) dateOfBirthError = '';
  @property({ type: String, attribute: 'date-of-death-error' }) dateOfDeathError = '';
  @property({ type: String, attribute: 'relationship-error' }) relationshipError = '';

  @state() private _person: DeceasedPersonValue = { ...EMPTY_DECEASED };

  /** Get the current value as a structured object. */
  get personValue(): DeceasedPersonValue {
    return { ...this._person };
  }

  /** Set the value from a structured object. */
  set personValue(val: DeceasedPersonValue) {
    this._person = { ...EMPTY_DECEASED, ...val };
    this.value = JSON.stringify(this._person);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    if (this.value) {
      try {
        this._person = { ...EMPTY_DECEASED, ...JSON.parse(this.value) };
      } catch { /* leave empty */ }
    }
    this._syncRelationshipOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('_person') || changed.has('hideRelationship')) {
      this._syncRelationshipOptions();
    }
  }

  private _syncRelationshipOptions(): void {
    const select = this.querySelector('[data-deceased-relationship]') as any;
    if (!select) return;
    select.options = [
      { value: 'spouse', label: t('deceasedPersonRelationshipSpouse') },
      { value: 'parent', label: t('deceasedPersonRelationshipParent') },
      { value: 'child', label: t('deceasedPersonRelationshipChild') },
      { value: 'sibling', label: t('deceasedPersonRelationshipSibling') },
      { value: 'other', label: t('deceasedPersonRelationshipOther') },
    ];
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    const prefix = this.name || 'deceased';
    const legend = this.legend || t('deceasedPersonLegend');
    const nameJson = JSON.stringify({
      first: this._person.first,
      middle: this._person.middle,
      last: this._person.last,
      suffix: this._person.suffix,
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
          legend="${t('deceasedPersonNameLegend')}"
          name="${prefix}.name"
          value="${nameJson}"
          error="${this.nameError}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @civ-input="${(e: CustomEvent) => this._onNameInput(e)}"
          @civ-change="${(e: CustomEvent) => this._onNameChange(e)}"
        ></civ-name>

        <civ-memorable-date
          legend="${t('deceasedPersonDateOfBirth')}"
          name="${prefix}.dateOfBirth"
          value="${this._person.dateOfBirth}"
          error="${this.dateOfBirthError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onDateInput('dateOfBirth', e)}"
          @civ-change="${(e: CustomEvent) => this._onDateChange('dateOfBirth', e)}"
        ></civ-memorable-date>

        <civ-memorable-date
          legend="${t('deceasedPersonDateOfDeath')}"
          name="${prefix}.dateOfDeath"
          value="${this._person.dateOfDeath}"
          error="${this.dateOfDeathError}"
          ?disabled="${this.disabled}"
          @civ-input="${(e: CustomEvent) => this._onDateInput('dateOfDeath', e)}"
          @civ-change="${(e: CustomEvent) => this._onDateChange('dateOfDeath', e)}"
        ></civ-memorable-date>

        ${this.hideRelationship ? nothing : html`
          <civ-select
            label="${t('deceasedPersonRelationship')}"
            name="${prefix}.relationship"
            value="${this._person.relationship}"
            error="${this.relationshipError}"
            ?disabled="${this.disabled}"
            data-deceased-relationship
            @civ-change="${(e: CustomEvent) => this._onRelationshipChange(e)}"
          ></civ-select>
        `}
      </fieldset>
    `;
  }

  private _onNameInput(e: CustomEvent<{ value: { first: string; middle: string; last: string; suffix: string } }>): void {
    e.stopPropagation();
    const v = e.detail.value;
    this._person = { ...this._person, first: v.first, middle: v.middle, last: v.last, suffix: v.suffix };
    this.value = JSON.stringify(this._person);
    dispatch(this, 'civ-input', { value: { ...this._person } });
  }

  private _onNameChange(e: CustomEvent<{ value: { first: string; middle: string; last: string; suffix: string } }>): void {
    e.stopPropagation();
    const v = e.detail.value;
    this._person = { ...this._person, first: v.first, middle: v.middle, last: v.last, suffix: v.suffix };
    this.value = JSON.stringify(this._person);
    dispatch(this, 'civ-change', { value: { ...this._person } });
  }

  private _onDateInput(field: 'dateOfBirth' | 'dateOfDeath', e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._person = { ...this._person, [field]: e.detail.value };
    this.value = JSON.stringify(this._person);
    dispatch(this, 'civ-input', { value: { ...this._person } });
  }

  private _onDateChange(field: 'dateOfBirth' | 'dateOfDeath', e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._person = { ...this._person, [field]: e.detail.value };
    this.value = JSON.stringify(this._person);
    dispatch(this, 'civ-change', { value: { ...this._person } });
  }

  private _onRelationshipChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._person = { ...this._person, relationship: e.detail.value };
    this.value = JSON.stringify(this._person);
    dispatch(this, 'civ-input', { value: { ...this._person } });
    dispatch(this, 'civ-change', { value: { ...this._person } });
  }

  protected override _syncFormValue(): void {
    const fd = new FormData();
    const prefix = this.name || 'deceased';
    fd.append(`${prefix}.first`, this._person.first);
    fd.append(`${prefix}.middle`, this._person.middle);
    fd.append(`${prefix}.last`, this._person.last);
    fd.append(`${prefix}.suffix`, this._person.suffix);
    fd.append(`${prefix}.dateOfBirth`, this._person.dateOfBirth);
    fd.append(`${prefix}.dateOfDeath`, this._person.dateOfDeath);
    fd.append(`${prefix}.relationship`, this._person.relationship);
    this.updateFormValue(fd);
  }

  override formResetCallback(): void {
    this._person = { ...EMPTY_DECEASED };
    this.value = '';
    this.error = '';
    this.nameError = '';
    this.dateOfBirthError = '';
    this.dateOfDeathError = '';
    this.relationshipError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-deceased-person': CivDeceasedPerson;
  }
}
