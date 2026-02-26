import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, renderLabel, renderHint, renderError, inputClasses } from '@civui/core';

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
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-date-input')
export class CivDateInput extends CivFormElement {
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof console !== 'undefined') {
      console.warn(
        '[CivUI] <civ-date-input> is deprecated. Use <civ-date-picker> or <civ-memorable-date> instead. ' +
        'Native <input type="date"> has known issues with Dragon NaturallySpeaking, VoiceOver on Safari, and TalkBack on Firefox.',
      );
    }
  }

  override render() {
    const classes = inputClasses({
      extra: ['civ-max-w-sm'],
    });

    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <input
          class="${classes}"
          id="${this._inputId}"
          type="date"
          name="${this.name}"
          .value="${this.value}"
          min="${this.min || nothing}"
          max="${this.max || nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
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
