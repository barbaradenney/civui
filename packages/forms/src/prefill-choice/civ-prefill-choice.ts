import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, t, interpolate } from '@civui/core';

export interface PrefillChoiceOption {
  value: string;
  label: string;
}

/**
 * CivUI Prefill Choice
 *
 * Conflict resolution component for when the user's profile contains
 * multiple values for a single form field (e.g., 3 phone numbers but
 * the form asks for 1). Shows a radio group of profile options plus
 * an option to enter a custom value.
 *
 * @element civ-prefill-choice
 *
 * @prop {string} label - Question/legend text
 * @prop {string} name - Form field name
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {boolean} required - Whether a selection is required
 * @prop {string} fieldType - Human-readable field type for i18n (e.g., "phone number")
 *
 * @fires civ-prefill-resolved - When user makes a choice, detail: { name, value, source }
 * @fires civ-input - On value change
 * @fires civ-change - On committed value change
 *
 * @example
 * ```html
 * <civ-prefill-choice
 *   label="Which phone number should we use?"
 *   name="phone"
 *   hint="We found these phone numbers in your profile"
 *   required
 * ></civ-prefill-choice>
 * <!-- Set options via JS: el.options = [{value, label}, ...] -->
 * ```
 */
@customElement('civ-prefill-choice')
export class CivPrefillChoice extends CivFormElement {
  /** Human-readable field type for i18n text. */
  @property({ type: String, attribute: 'field-type' }) fieldType = 'value';

  /** Profile options to choose from. Set via JS property. */
  @property({ type: Array, attribute: false }) options: PrefillChoiceOption[] = [];

  @state() private _selectedIndex = -1;
  @state() private _customValue = '';
  @state() private _useCustom = false;

  protected override _defaultValue = '';

  override render() {
    const hintText = this.hint || interpolate(t('prefillChoiceHint'), { fieldType: this.fieldType });

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.label, required: this.required })}
        ${renderHint(this._hintId, hintText, true)}
        ${renderError(this._errorId, this.error, true)}

        <div class="civ-group-layout--vertical">
          ${this.options.map((opt, i) => html`
            <div class="civ-mb-2">
              <label class="civ-flex civ-items-start civ-cursor-pointer">
                <input
                  class="civ-check-input focus-visible:civ-focus-ring"
                  type="radio"
                  name="${this.name}-choice"
                  .checked="${this._selectedIndex === i && !this._useCustom}"
                  @change="${() => this._onSelectOption(i)}"
                />
                <span class="civ-check-label">${opt.label}</span>
              </label>
            </div>
          `)}

          <div class="civ-mb-2">
            <label class="civ-flex civ-items-start civ-cursor-pointer">
              <input
                class="civ-check-input focus-visible:civ-focus-ring"
                type="radio"
                name="${this.name}-choice"
                .checked="${this._useCustom}"
                @change="${this._onSelectCustom}"
              />
              <span class="civ-check-label">
                ${interpolate(t('prefillChoiceNewOption'), { fieldType: this.fieldType })}
              </span>
            </label>
          </div>

          ${this._useCustom ? html`
            <div class="civ-ms-6 civ-mt-2">
              <civ-text-input
                label="${this.label}"
                name="${this.name}-custom"
                value="${this._customValue}"
                ?required="${this.required}"
                @civ-input="${this._onCustomInput}"
                @civ-change="${this._onCustomChange}"
              ></civ-text-input>
            </div>
          ` : nothing}
        </div>
      </fieldset>
    `;
  }

  private _onSelectOption(index: number): void {
    this._selectedIndex = index;
    this._useCustom = false;
    this.value = this.options[index].value;
    this._dispatchResolved('selected');
  }

  private _onSelectCustom(): void {
    this._useCustom = true;
    this._selectedIndex = -1;
    this.value = this._customValue;
    dispatch(this, 'civ-input', { value: this.value });
  }

  private _onCustomInput(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._customValue = e.detail.value;
    this.value = this._customValue;
    dispatch(this, 'civ-input', { value: this.value });
  }

  private _onCustomChange(e: CustomEvent<{ value: string }>): void {
    e.stopPropagation();
    this._customValue = e.detail.value;
    this.value = this._customValue;
    this._dispatchResolved('custom');
  }

  private _dispatchResolved(source: 'selected' | 'custom'): void {
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    dispatch(this, 'civ-prefill-resolved', {
      name: this.name,
      value: this.value,
      source,
    });
    this.sendAnalytics('change');
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || '');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this._selectedIndex = -1;
    this._useCustom = false;
    this._customValue = '';
    this.error = '';
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-prefill-choice': CivPrefillChoice;
  }
}
