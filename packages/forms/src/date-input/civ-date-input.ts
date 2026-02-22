import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement } from '@civui/core';

/**
 * CivUI Date Input
 *
 * Uses native `<input type="date">` for the browser's date picker.
 * Handles value formatting and min/max validation.
 *
 * @deprecated Use `civ-date-picker` instead for better accessibility.
 * Native `<input type="date">` has known issues with Dragon NaturallySpeaking,
 * VoiceOver on Safari, and TalkBack on Firefox. Will be removed in v1.0.
 *
 * @element civ-date-input
 *
 * @prop {string} label - Label text
 * @prop {string} name - Form field name
 * @prop {string} value - Date value in YYYY-MM-DD format
 * @prop {string} hint - Hint text
 * @prop {string} error - Error message
 * @prop {string} min - Minimum date (YYYY-MM-DD)
 * @prop {string} max - Maximum date (YYYY-MM-DD)
 * @prop {boolean} required - Whether a date is required
 * @prop {boolean} disabled - Whether the input is disabled
 *
 * @fires civ-input - When the date value changes (on input), detail: { value }
 * @fires civ-change - When the date changes, detail: { value }
 */
@customElement('civ-date-input')
export class CivDateInput extends CivFormElement {
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';

  override render() {
    const inputClasses = [
      'civ-block',
      'civ-w-full',
      'civ-max-w-sm',
      'civ-border',
      'civ-rounded',
      'civ-px-2',
      'civ-py-1.5',
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      'civ-bg-white',
      this.error ? 'civ-border-error civ-border-l-4' : 'civ-border-base-light',
      this.disabled ? 'civ-opacity-50 civ-cursor-not-allowed civ-bg-base-lightest' : '',
      'focus-visible:civ-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="civ-mb-4">
        ${this.label
          ? html`
              <label
                class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base"
                for="${this._inputId}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-1 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <input
          class="${inputClasses}"
          id="${this._inputId}"
          type="date"
          name="${this.name}"
          .value="${this.value}"
          min="${this.min || nothing}"
          max="${this.max || nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          @input="${this._handleInput}"
          @change="${this._handleChange}"
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-date-input': CivDateInput;
  }
}
