import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CivFormElement, dispatch, t } from '@civui/core';
import '../text-input/civ-text-input.js';

/**
 * CivUI Email Address
 *
 * Pre-configured text input for email entry with built-in validation
 * and autocomplete support.
 *
 * @element civ-email
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 */
@customElement('civ-email')
export class CivEmail extends CivFormElement {
  override render() {
    const label = this.label || t('emailLabel');
    const hint = this.hint || 'For example: name@example.com';

    return html`
      <civ-text-input
        label="${label}"
        name="${this.name}"
        value="${this.value}"
        hint="${hint}"
        error="${this.error}"
        type="email"
        validate="email"
        autocomplete="email"
        width="md"
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
    'civ-email': CivEmail;
  }
}
