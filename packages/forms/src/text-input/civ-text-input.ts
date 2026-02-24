import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, renderLabel, renderHint, renderError, inputClasses } from '@civui/core';

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
 * @fires civ-input - When value changes (on input), detail: { value }
 * @fires civ-change - When value changes (on change/blur), detail: { value }
 * @fires civ-reset - When the form is reset
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
  @property({ type: String }) inputmode = '';

  override render() {
    const widthClass = WIDTH_CLASSES[this.width] || WIDTH_CLASSES['default'];
    const classes = inputClasses({
      extra: [widthClass, 'civ-max-w-full'],
    });

    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <input
          class="${classes}"
          id="${this._inputId}"
          type="${this.type}"
          name="${this.name}"
          .value="${this.value}"
          placeholder="${this.placeholder || nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          pattern="${this.pattern || nothing}"
          maxlength="${this.maxlength && this.maxlength > 0 ? this.maxlength : nothing}"
          minlength="${this.minlength ?? nothing}"
          autocomplete="${this.autocomplete || nothing}"
          inputmode="${this.inputmode || nothing}"
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
    'civ-text-input': CivTextInput;
  }
}
