import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderFormHeader, buildDescribedBy } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';
import '@civui/controls/checkbox';
import '@civui/controls/radio';

const ETHNICITY_OPTIONS = [
  { value: 'hispanic-latino', label: 'Hispanic or Latino' },
  { value: 'not-hispanic-latino', label: 'Not Hispanic or Latino' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
];

const RACE_OPTIONS = [
  { value: 'american-indian-alaska-native', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black-african-american', label: 'Black or African American' },
  { value: 'native-hawaiian-pacific-islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
];

export interface RaceEthnicityValue {
  ethnicity: string;
  race: string[];
}

const EMPTY_VALUE: RaceEthnicityValue = { ethnicity: '', race: [] };

/**
 * CivUI Race & Ethnicity
 *
 * Compound component implementing the OMB (Office of Management and Budget)
 * standard for collecting race and ethnicity data on federal forms.
 *
 * Renders:
 * 1. Ethnicity as a radio group (Hispanic/Latino, Not Hispanic/Latino, Prefer not to answer)
 * 2. Race as a checkbox group (6 OMB categories, multi-select)
 *
 * @element civ-race-ethnicity
 *
 * @fires civ-input - On every change, detail: { value: RaceEthnicityValue }
 * @fires civ-change - On committed change, detail: { value: RaceEthnicityValue }
 *
 * @example
 * ```html
 * <civ-race-ethnicity
 *   legend="Race and ethnicity"
 *   name="demographics"
 *   required
 * ></civ-race-ethnicity>
 * ```
 */
@customElement('civ-race-ethnicity')
export class CivRaceEthnicity extends CivFormElement {
  @property({ type: String }) legend = '';

  /** Promote the legend to a heading via `role="heading"` + `aria-level=N`. */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /** Visual size of the legend. */
  @property({ type: String }) size?: LabelSize;
  @property({ type: String, attribute: 'ethnicity-legend' }) ethnicityLegend = '';
  @property({ type: String, attribute: 'race-legend' }) raceLegend = '';
  @property({ type: String, attribute: 'ethnicity-error' }) ethnicityError = '';
  @property({ type: String, attribute: 'race-error' }) raceError = '';

  @state() private _data: RaceEthnicityValue = { ...EMPTY_VALUE };

  /** Parse structured value from JSON string. */
  private _parseValue(val: string): RaceEthnicityValue {
    if (!val) return { ...EMPTY_VALUE };
    try {
      const parsed = JSON.parse(val);
      return {
        ethnicity: parsed.ethnicity || '',
        race: Array.isArray(parsed.race) ? parsed.race : [],
      };
    } catch {
      return { ...EMPTY_VALUE };
    }
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._data = this._parseValue(this.value);
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('value') && !changed.has('_data')) {
      this._data = this._parseValue(this.value);
    }
  }

  private _onEthnicityChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._data = { ...this._data, ethnicity: e.detail.value };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
    dispatch(this, 'civ-change', { value: { ...this._data } });
  }

  private _onRaceInput(e: CustomEvent<{ values: string[] }>): void {
    e.stopPropagation();
    this._data = { ...this._data, race: e.detail.values };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-input', { value: { ...this._data } });
  }

  private _onRaceChange(e: CustomEvent<{ values: string[] }>): void {
    e.stopPropagation();
    this._data = { ...this._data, race: e.detail.values };
    this.value = JSON.stringify(this._data);
    dispatch(this, 'civ-change', { value: { ...this._data } });
    this.sendAnalytics('change');
  }

  override formResetCallback(): void {
    this._data = { ...EMPTY_VALUE };
    this.value = '';
    this.error = '';
    this.ethnicityError = '';
    this.raceError = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || '');
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
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-form-fieldset legend="${this.ethnicityLegend || 'Ethnicity'}">
          <civ-radio-group
            name="${this.name ? `${this.name}.ethnicity` : 'ethnicity'}"
            value="${this._data.ethnicity}"
            error="${this.ethnicityError}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            @civ-change="${this._onEthnicityChange}"
          >
            ${ETHNICITY_OPTIONS.map(
              (opt) => html`<civ-radio value="${opt.value}" label="${opt.label}"></civ-radio>`,
            )}
          </civ-radio-group>
        </civ-form-fieldset>

        <civ-form-fieldset legend="${this.raceLegend || 'Race'}" hint="Select one or more">
          <civ-checkbox-group
            name="${this.name ? `${this.name}.race` : 'race'}"
            value="${this._data.race.join(',')}"
            error="${this.raceError}"
            ?required="${this.required}"
            ?disabled="${this.disabled}"
            @civ-input="${this._onRaceInput}"
            @civ-change="${this._onRaceChange}"
          >
            ${RACE_OPTIONS.map(
              (opt) => html`<civ-checkbox value="${opt.value}" label="${opt.label}"></civ-checkbox>`,
            )}
          </civ-checkbox-group>
        </civ-form-fieldset>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-race-ethnicity': CivRaceEthnicity;
  }
}
