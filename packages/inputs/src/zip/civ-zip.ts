import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, t } from '@civui/core';
import '../text-input/civ-text-input.js';

/**
 * CivUI ZIP Code
 *
 * Pre-configured text input for US ZIP code entry. Supports standard
 * 5-digit and extended ZIP+4 (9-digit) formats with masking and validation.
 *
 * @element civ-zip
 *
 * @prop {boolean} extended - Use ZIP+4 format (9 digits) instead of standard 5-digit
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-zip')
export class CivZip extends CivFormElement {
  /** Use ZIP+4 extended format (9 digits with dash). */
  @property({ type: Boolean }) extended = false;

  override render() {
    const label = this.label || t('zipLabel');
    const mask = this.extended ? 'zip4' : 'zip';
    const validate = this.extended ? 'zip4' : 'zip';
    const hint = this.hint || (this.extended ? t('maskZip4Hint') : t('maskZipHint'));

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        mask="${mask}"
        validate="${validate}"
        inputmode="numeric"
        autocomplete="postal-code"
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
    'civ-zip': CivZip;
  }
}
