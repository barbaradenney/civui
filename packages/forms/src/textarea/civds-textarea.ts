import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

/**
 * CivDS Textarea
 *
 * Multi-line text input with optional character count display.
 * Uses ElementInternals for native form participation.
 *
 * @element civds-textarea
 *
 * @prop {string} label - Textarea label text
 * @prop {string} name - Form field name
 * @prop {string} value - Current value
 * @prop {string} hint - Hint text displayed below label
 * @prop {string} error - Error message (shows error state)
 * @prop {number} rows - Number of visible text rows
 * @prop {number} maxlength - Maximum character length (enables character count)
 * @prop {string} placeholder - Placeholder text
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 *
 * @fires civds-input - When value changes (on input)
 * @fires civds-change - When value changes (on change/blur)
 */
@customElement('civds-textarea')
export class CivdsTextarea extends CivdsFormElement {
  @property({ type: Number }) rows = 5;
  @property({ type: Number }) maxlength?: number;
  @property({ type: String }) placeholder = '';

  @state() private _charCount = 0;

  private _charCountId = this.generateId('charcount');

  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    if (this.maxlength != null && this.maxlength > 0) ids.push(this._charCountId);
    return ids.join(' ') || '';
  }

  override render() {
    const textareaClasses = [
      'civds-block',
      'civds-w-full',
      'civds-border',
      'civds-rounded',
      'civds-px-2',
      'civds-py-1.5',
      'civds-text-base',
      'civds-font-sans',
      'civds-text-base-darkest',
      'civds-bg-white',
      'civds-resize-y',
      this.error ? 'civds-border-error civds-border-l-4' : 'civds-border-base-light',
      this.disabled ? 'civds-opacity-50 civds-cursor-not-allowed civds-bg-base-lightest' : '',
      'focus-visible:civds-focus-ring',
    ]
      .filter(Boolean)
      .join(' ');

    const showCharCount = this.maxlength != null && this.maxlength > 0;
    const remaining = showCharCount ? this.maxlength! - this._charCount : 0;

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
        <textarea
          class="${textareaClasses}"
          id="${this._inputId}"
          name="${this.name}"
          rows="${this.rows}"
          .value="${this.value}"
          placeholder="${this.placeholder || nothing}"
          maxlength="${this.maxlength ?? nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          @input="${this._onInput}"
          @change="${this._handleChange}"
        ></textarea>
        ${showCharCount
          ? html`
              <span
                id="${this._charCountId}"
                class="civds-block civds-mt-0.5 civds-text-sm ${remaining < 0
                  ? 'civds-text-error civds-font-bold'
                  : 'civds-text-base'}"
                aria-live="polite"
              >
                ${remaining} characters remaining
              </span>
            `
          : nothing}
      </div>
    `;
  }

  private _onInput(e: Event): void {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
    this._charCount = target.value.length;
    this.updateFormValue(this.value);
    this.dispatchEvent(
      new CustomEvent('civds-input', { detail: { value: this.value }, bubbles: true, composed: true }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-textarea': CivdsTextarea;
  }
}
