import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement } from '@civui/core';

export type TextInputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
export type TextInputWidth = 'default' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const WIDTH_CLASSES: Record<TextInputWidth, string> = {
  'default': 'civ-w-full',
  '2xs': 'civ-w-12',
  'xs': 'civ-w-16',
  'sm': 'civ-w-24',
  'md': 'civ-w-40',
  'lg': 'civ-w-60',
  'xl': 'civ-w-72',
  '2xl': 'civ-w-96',
};

/**
 * CivUI Text Input
 *
 * Accessible text input with label, hint, error, and width variants.
 * Uses ElementInternals for native form participation.
 *
 * @element civ-text-input
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
 * @fires civ-input - When value changes (on input)
 * @fires civ-change - When value changes (on change/blur)
 */
@customElement('civ-text-input')
export class CivTextInput extends CivFormElement {
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
      'civ-block',
      widthClass,
      'civ-max-w-full',
      'civ-border',
      'civ-rounded',
      'civ-px-2',
      'civ-py-1.5',
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      'civ-bg-white',
      this.error
        ? 'civ-border-error civ-border-l-4'
        : 'civ-border-base-light',
      this.disabled
        ? 'civ-opacity-50 civ-cursor-not-allowed civ-bg-base-lightest'
        : '',
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
                  ? html`<abbr
                      class="civ-text-error civ-no-underline"
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
                class="civ-block civ-mb-1 civ-text-sm civ-text-base"
                id="${this._hintId}"
                >${this.hint}</span
              >
            `
          : nothing}
        ${this.error
          ? html`
              <span
                class="civ-block civ-mb-1 civ-text-sm civ-text-error civ-font-bold"
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
    'civ-text-input': CivTextInput;
  }
}
