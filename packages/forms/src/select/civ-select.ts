import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch } from '@civui/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * CivUI Select
 *
 * Dropdown select with label, hint, error support.
 * Options can be set via the `options` property (array) or via
 * slotted `<option>` elements in Light DOM.
 *
 * @element civ-select
 *
 * @prop {string} label - Select label text
 * @prop {string} name - Form field name
 * @prop {string} value - Current selected value
 * @prop {string} hint - Hint text displayed below label
 * @prop {string} error - Error message (shows error state)
 * @prop {SelectOption[]} options - Options array (alternative to slotted options)
 * @prop {string} emptyLabel - Label for the empty/default option
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 *
 * @fires civ-input - When selection changes, detail: { value }
 * @fires civ-change - When selection changes, detail: { value }
 * @fires civ-reset - When the form is reset
 */
@customElement('civ-select')
export class CivSelect extends CivFormElement {
  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String, attribute: 'empty-label' }) emptyLabel = '- Select -';

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('options') && this.value) {
      // Re-sync the native select element when options change
      const select = this.querySelector('select') as HTMLSelectElement | null;
      if (select && select.value !== this.value) {
        select.value = this.value;
      }
    }
  }

  override render() {
    const selectClasses = [
      'civ-block',
      'civ-w-full',
      'civ-border',
      'civ-rounded',
      'civ-px-2',
      'civ-py-1.5',
      'civ-text-base',
      'civ-font-sans',
      'civ-text-base-darkest',
      'civ-bg-white',
      'civ-appearance-auto',
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
        <select
          class="${selectClasses}"
          id="${this._inputId}"
          name="${this.name}"
          .value="${this.value}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          @change="${this._onSelectChange}"
        >
          <option value="">${this.emptyLabel}</option>
          ${this.options.map(
            (opt) => html`
              <option
                value="${opt.value}"
                ?selected="${opt.value === this.value}"
                ?disabled="${opt.disabled ?? false}"
              >
                ${opt.label}
              </option>
            `,
          )}
        </select>
      </div>
    `;
  }

  private _onSelectChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    this.value = target.value;
    this.updateFormValue(this.value);
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-select': CivSelect;
  }
}
