import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivFormElement, dispatch } from '@civui/core';
import '../text-input/civ-text-input.js';

/**
 * CivUI Routing Number
 *
 * Pre-configured text input for bank routing number entry with
 * 9-digit mask, mod-10 checksum validation, and numeric keyboard.
 *
 * @element civ-routing-number
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-routing-number')
export class CivRoutingNumber extends CivFormElement {
  override render() {
    const label = this.label || 'Routing number';
    const hint = this.hint || 'The 9-digit number on the bottom left of your check';

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        validate="routing"
        inputmode="numeric"
        autocomplete="off"
        maxlength="9"
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
    'civ-routing-number': CivRoutingNumber;
  }
}
