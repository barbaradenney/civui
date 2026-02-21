import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

export type TextInputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
export type TextInputWidth = 'default' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const WIDTH_CLASSES: Record<TextInputWidth, string> = {
  'default': 'civds-w-full',
  '2xs': 'civds-w-12',
  'xs': 'civds-w-16',
  'sm': 'civds-w-24',
  'md': 'civds-w-40',
  'lg': 'civds-w-60',
  'xl': 'civds-w-72',
  '2xl': 'civds-w-96',
};

/**
 * CivDS Text Input
 *
 * Accessible text input with label, hint, error, and width variants.
 * Uses ElementInternals for native form participation.
 *
 * @element civds-text-input
 *
 * @prop {string} label - Input label text
 * @prop {string} name - Form field name
 * @prop {string} value - Current value
 * @prop {string} hint - Hint text displayed below label
 * @prop {string} error - Error message (shows error state)
 * @prop {TextInputType} type - HTML input type
 * @prop {TextInputWidth} width - Width variant
 * @prop {string} placeholder - Placeholder text
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 * @prop {string} pattern - Validation regex pattern
 * @prop {number} maxlength - Maximum character length
 * @prop {number} minlength - Minimum character length
 * @prop {string} autocomplete - Autocomplete hint
 *
 * @fires civds-input - When value changes (on input)
 * @fires civds-change - When value changes (on change/blur)
 */
@customElement('civds-text-input')
export class CivdsTextInput extends CivdsFormElement {
  @property({ type: String }) type: TextInputType = 'text';
  @property({ type: String }) width: TextInputWidth = 'default';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) pattern = '';
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) minlength?: number;
  @property({ type: String }) autocomplete = '';

  override render() {
    const widthClass = WIDTH_CLASSES[this.width] || WIDTH_CLASSES['default'];
    const inputClasses = [
      'civds-block',
      widthClass,
      'civds-max-w-full',
      'civds-border',
      'civds-rounded',
      'civds-px-2',
      'civds-py-1.5',
      'civds-text-base',
      'civds-font-sans',
      'civds-text-base-darkest',
      'civds-bg-white',
      this.error
        ? 'civds-border-error civds-border-l-4'
        : 'civds-border-base-light',
      this.disabled
        ? 'civds-opacity-50 civds-cursor-not-allowed civds-bg-base-lightest'
        : '',
      'focus-visible:civds-focus-ring',
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
                  ? html`<abbr
                      class="civds-text-error civds-no-underline"
                      title="required"
                      >*</abbr
                    >`
                  : nothing}
              </label>
            `
          : nothing}
        ${this.hint
          ? html`
              <span
                class="civds-block civds-mb-1 civds-text-sm civds-text-base"
                id="${this._hintId}"
                >${this.hint}</span
              >
            `
          : nothing}
        ${this.error
          ? html`
              <span
                class="civds-block civds-mb-1 civds-text-sm civds-text-error civds-font-bold"
                id="${this._errorId}"
                role="alert"
                >${this.error}</span
              >
            `
          : nothing}
        <input
          class="${inputClasses}"
          id="${this._inputId}"
          type="${this.type}"
          name="${this.name}"
          .value="${this.value}"
          placeholder="${this.placeholder || nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required}"
          pattern="${this.pattern || nothing}"
          maxlength="${this.maxlength ?? nothing}"
          minlength="${this.minlength ?? nothing}"
          autocomplete="${this.autocomplete || nothing}"
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
    'civds-text-input': CivdsTextInput;
  }
}
