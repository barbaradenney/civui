import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement } from '@civui/core';

/**
 * CivUI Radio Group
 *
 * Groups multiple civ-radio elements with mutual exclusivity,
 * a shared legend, hint, and error message using a native fieldset.
 * Uses ElementInternals for form participation.
 *
 * @element civ-radio-group
 *
 * @prop {string} legend - Group legend text
 * @prop {string} name - Shared form field name for all radios
 * @prop {string} value - Currently selected value
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} tile - Apply tile variant to all child radios
 * @prop {boolean} required - Whether a selection is required
 *
 * @fires civ-change - When the selected value changes
 */
@customElement('civ-radio-group')
export class CivRadioGroup extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;

  private _boundOnChildChange = this._onChildChange.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
  }

  override firstUpdated(): void {
    this._syncRadioNames();
    this._syncRadioChecked();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('name')) {
      this._syncRadioNames();
    }
    if (changed.has('value')) {
      this._syncRadioChecked();
    }
  }

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
      >
        ${this.legend
          ? html`
              <legend class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base">
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="civ-flex civ-flex-col civ-gap-1">
          <slot></slot>
        </div>
      </fieldset>
    `;
  }

  private _getRadios(): NodeListOf<Element> {
    return this.querySelectorAll('civ-radio');
  }

  private _syncRadioNames(): void {
    if (!this.name) return;
    this._getRadios().forEach((radio: any) => {
      radio.name = this.name;
      radio.disableAnalytics = true;
    });
  }

  private _syncRadioChecked(): void {
    this._getRadios().forEach((radio: any) => {
      radio.checked = radio.value === this.value;
    });
  }

  private _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (!detail?.value) return;

    // Prevent re-dispatch loop — only handle events from child radios
    if (e.target === this) return;

    this.value = detail.value;
    this.updateFormValue(this.value);
    this._syncRadioChecked();

    // Stop the child event and re-dispatch from the group
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('civ-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    this.sendAnalytics('change');
  }

  override formResetCallback(): void {
    this.value = '';
    this.error = '';
    this._syncRadioChecked();
    this.updateFormValue('');
    this.dispatchEvent(new CustomEvent('civ-reset', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-radio-group': CivRadioGroup;
  }
}
