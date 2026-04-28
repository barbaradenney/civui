import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivFormElement, dispatch, t } from '@civui/core';
import '../text-input/civ-text-input.js';

/**
 * CivUI VA File Number
 *
 * Pre-configured text input for VA file numbers. A VA file number is
 * typically 8 or 9 digits — often the same as the Veteran's SSN, but
 * not always. This component provides the correct label, hint, masking,
 * and validation to reduce confusion.
 *
 * @element civ-va-file-number
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 *
 * @example
 * ```html
 * <civ-va-file-number name="vaFileNumber" required></civ-va-file-number>
 * ```
 */
@customElement('civ-va-file-number')
export class CivVaFileNumber extends CivFormElement {
  override render() {
    const label = this.label || t('vaFileNumberLabel');
    const hint = this.hint || t('vaFileNumberHint');

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        inputmode="numeric"
        autocomplete="off"
        minlength="8"
        maxlength="9"
        pattern="[0-9]{8,9}"
        ?required="${this.required}"
        required-message="${this.requiredMessage || ''}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        @civ-input="${this._onInput}"
        @civ-change="${this._onChange}"
      ></civ-text-input>
    `;
  }

  private _onInput(e: CustomEvent): void {
    e.stopPropagation();
    this.value = e.detail.value;
    dispatch(this, 'civ-input', { value: this.value });
  }

  private _onChange(e: CustomEvent): void {
    e.stopPropagation();
    this.value = e.detail.value;
    dispatch(this, 'civ-change', { value: this.value });
  }

  override formResetCallback(): void {
    this.value = '';
    this.error = '';
    this.updateFormValue(null);
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-va-file-number': CivVaFileNumber;
  }
}
