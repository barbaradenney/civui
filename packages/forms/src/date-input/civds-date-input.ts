import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

/**
 * CivDS Date Input
 *
 * Uses native `<input type="date">` for the browser's date picker.
 * Handles value formatting and min/max validation.
 *
 * @deprecated Use `civds-date-picker` instead for better accessibility.
 * Native `<input type="date">` has known issues with Dragon NaturallySpeaking,
 * VoiceOver on Safari, and TalkBack on Firefox. Will be removed in v1.0.
 *
 * @element civds-date-input
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
 * @fires civds-change - When the date changes
 */
@customElement('civds-date-input')
export class CivdsDateInput extends CivdsFormElement {
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';

  override render() {
    const inputClasses = [
      'civds-block',
      'civds-w-full',
      'civds-max-w-xs',
      'civds-border',
      'civds-rounded',
      'civds-px-2',
      'civds-py-1.5',
      'civds-text-base',
      'civds-font-sans',
      'civds-text-base-darkest',
      'civds-bg-white',
      this.error ? 'civds-border-error civds-border-l-4' : 'civds-border-base-light',
      this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed civds-bg-base-lightest' : '',
      'focus:civds-outline-2',
      'focus:civds-outline-primary',
      'focus:civds-outline-offset-0',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="civds-mb-4">
        ${this.label
          ? html`
              <label
                class="civds-block civds-mb-1 civds-text-base-darkest civds-font-bold civds-text-base"
                for="${this._inputId}"
              >
                ${this.label}
                ${this.required
                  ? html`<abbr class="civds-text-error civds-no-underline" title="required">*</abbr>`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
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
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          @change="${this._handleChange}"
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-date-input': CivdsDateInput;
  }
}
