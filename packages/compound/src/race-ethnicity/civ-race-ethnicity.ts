import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, LegendHeadingMixin, dispatch, renderLegend, renderFormHeader, buildDescribedBy } from '@civui/core';
import '@civui/inputs/checkbox';
import '@civui/inputs/radio';

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
 * 1. Race as a checkbox group (6 OMB categories, multi-select)
 * 2. Ethnicity as a radio group (Hispanic/Latino, Not Hispanic/Latino, Prefer not to answer)
 *
 * Race is presented first because it's the more granular, multi-select
 * question; ethnicity follows as a single-choice radio group.
 *
 * **Base class:** Extends `CivFormElement` directly rather than the
 * shared `CivCompoundElement`. The other compounds (`civ-name`,
 * `civ-address`, …) all extend `CivCompoundElement` for its
 * `_data + _onSubInput / _onSubChange` plumbing. Race / ethnicity is
 * deliberately *two* independent answers to two OMB questions, not a
 * single structured value — the inner groups dispatch their own
 * `civ-change` events with array/string shapes and we forward them
 * with custom merging logic (no field-keyed patching). Reusing the
 * compound base here would force a misleading "field-of-a-struct"
 * mental model onto two genuinely separate questions, so we keep the
 * lightweight `CivFormElement + local _data` shape.
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
export class CivRaceEthnicity extends LegendHeadingMixin(CivFormElement) {
  @property({ type: String }) legend = '';
  @property({ type: String, attribute: 'ethnicity-legend' }) ethnicityLegend = '';
  @property({ type: String, attribute: 'race-legend' }) raceLegend = '';
  @property({ type: String, attribute: 'ethnicity-error' }) ethnicityError = '';
  @property({ type: String, attribute: 'race-error' }) raceError = '';
  /**
   * Tile rendering variant forwarded to both inner groups. Defaults to
   * `auto`, which this compound resolves to `list` for BOTH groups so
   * race (6 options) and ethnicity (3 options) share one visual
   * treatment — otherwise they'd look like two different components.
   * Pass `card` or `list` to override (applied to both groups).
   */
  @property({ type: String }) layout: 'card' | 'list' | 'auto' = 'auto';

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

  override connectedCallback(): void {
    super.connectedCallback();
    this._data = this._parseValue(this.value);
  }

  override willUpdate(changed: Map<string, unknown>): void {
    // Re-parse `value` before render so the change is picked up in this
    // pass instead of triggering a second update from `updated()`.
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
    this._resetCompound(['ethnicityError', 'raceError']);
  }

  protected override _syncFormValue(): void {
    // Participate in a native <form> with flat, prefixed fields —
    // `${name}.race` repeated for the multi-select plus `${name}.ethnicity`
    // once — matching how every other compound submits via
    // `syncFormDataFromState`. The previous `updateFormValue(this.value)`
    // emitted a single JSON blob under `name`, an outlier shape that also
    // collided with the inner groups' own `${name}.race`/`.ethnicity`
    // fields. The public `value` stays JSON (civ-form's getFormData reads
    // that); this only governs raw ElementInternals submission.
    const prefix = this.name || 'race-ethnicity';
    const fd = new FormData();
    for (const r of this._data.race) fd.append(`${prefix}.race`, r);
    if (this._data.ethnicity) fd.append(`${prefix}.ethnicity`, this._data.ethnicity);
    this.updateFormValue(fd);
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);
    // Force `auto` to resolve to `list` for both sub-groups so race
    // (6 options) and ethnicity (3 options) share the same visual
    // treatment. Without this, race auto-resolves to `list` (dense)
    // and ethnicity auto-resolves to `card` (sparse) and the two
    // sub-groups look like different components. Explicit `card` /
    // `list` from the consumer is honored on both groups symmetrically.
    const groupVariant = this.layout === 'auto' ? 'list' : this.layout;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend || this.label, required: this.required, showRequired: false, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}

        <civ-checkbox-group
          legend="${this.raceLegend || 'Race'}"
          hint="Select one or more"
          size="md"
          tight-hint
          name="${this.name ? `${this.name}.race` : 'race'}"
          value="${this._data.race.join(',')}"
          error="${this.raceError}"
          layout="${groupVariant}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          @civ-input="${this._onRaceInput}"
          @civ-change="${this._onRaceChange}"
        >
          ${RACE_OPTIONS.map(
            (opt) => html`<civ-checkbox value="${opt.value}" label="${opt.label}"></civ-checkbox>`,
          )}
        </civ-checkbox-group>

        <civ-radio-group
          legend="${this.ethnicityLegend || 'Ethnicity'}"
          size="md"
          name="${this.name ? `${this.name}.ethnicity` : 'ethnicity'}"
          value="${this._data.ethnicity}"
          error="${this.ethnicityError}"
          layout="${groupVariant}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          @civ-change="${this._onEthnicityChange}"
        >
          ${ETHNICITY_OPTIONS.map(
            (opt) => html`<civ-radio value="${opt.value}" label="${opt.label}"></civ-radio>`,
          )}
        </civ-radio-group>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-race-ethnicity': CivRaceEthnicity;
  }
}
