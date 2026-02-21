import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivdsFormElement } from '@civds/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * CivDS Select
 *
 * Dropdown select with label, hint, error support.
 * Options can be set via the `options` property (array) or via
 * slotted `<option>` elements in Light DOM.
 *
 * @element civds-select
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
 * @fires civds-change - When selection changes
 */
@customElement('civds-select')
export class CivdsSelect extends CivdsFormElement {
  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String, attribute: 'empty-label' }) emptyLabel = '- Select -';

  override render() {
    const selectClasses = [
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
      'civds-appearance-auto',
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
        <select
          class="${selectClasses}"
          id="${this._inputId}"
          name="${this.name}"
          .value="${this.value}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
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
    this.dispatchEvent(
      new CustomEvent('civds-change', { detail: { value: this.value }, bubbles: true, composed: true }),
    );
    this.sendAnalytics('change');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civds-select': CivdsSelect;
  }
}
