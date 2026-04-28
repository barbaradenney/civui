import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivFormElement, dispatch } from '@civui/core';
import '@civui/controls/checkbox';

const RACE_OPTIONS = [
  { value: 'american-indian-alaska-native', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black-african-american', label: 'Black or African American' },
  { value: 'native-hawaiian-pacific-islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'prefer-not-to-answer', label: 'Prefer not to answer' },
];

/**
 * CivUI Race
 *
 * Pre-populated checkbox group for OMB race categories. Allows
 * multiple selections as required by federal forms (individuals
 * may identify with more than one race).
 *
 * Value is a comma-separated string of selected race values.
 *
 * @element civ-race
 *
 * @fires civ-input - On every selection change, detail: { values: string[] }
 * @fires civ-change - On committed change, detail: { values: string[] }
 *
 * @example
 * ```html
 * <civ-form-fieldset legend="Race" hint="Select one or more" required>
 *   <civ-race name="race" required></civ-race>
 * </civ-form-fieldset>
 * ```
 */
@customElement('civ-race')
export class CivRace extends CivFormElement {
  private _onGroupInput(e: CustomEvent<{ values: string[] }>): void {
    e.stopPropagation();
    this.value = e.detail.values.join(',');
    dispatch(this, 'civ-input', { values: e.detail.values });
  }

  private _onGroupChange(e: CustomEvent<{ values: string[] }>): void {
    e.stopPropagation();
    this.value = e.detail.values.join(',');
    dispatch(this, 'civ-change', { values: e.detail.values });
    this.sendAnalytics('change');
  }

  override formResetCallback(): void {
    this.value = '';
    this.error = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || '');
  }

  override render() {
    return html`
      <civ-checkbox-group
        name="${this.name}"
        value="${this.value}"
        ?required="${this.required}"
        ?disabled="${this.disabled}"
        @civ-input="${this._onGroupInput}"
        @civ-change="${this._onGroupChange}"
      >
        ${RACE_OPTIONS.map(
          (opt) => html`
            <civ-checkbox value="${opt.value}" label="${opt.label}"></civ-checkbox>
          `,
        )}
      </civ-checkbox-group>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-race': CivRace;
  }
}
