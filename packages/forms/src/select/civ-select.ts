// Schema: packages/schema/src/components/civ-select.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLabel, renderHint, renderError, inputClasses, t } from '@civui/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * CivUI Select
 *
 * Accessible dropdown select with label, hint, error, and option list.
 * Uses native <select> on web for maximum accessibility.
 *
 * @element civ-select
 */
@customElement('civ-select')
export class CivSelect extends CivFormElement {
  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String, attribute: 'empty-label' }) emptyLabel: string = '';

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('options') && this.value) {
      const select = this.querySelector('select') as HTMLSelectElement | null;
      if (select && select.value !== this.value) {
        select.value = this.value;
      }
    }
  }

  override render() {
    const classes = inputClasses({
      extra: ['civ-select-field'],
    });

    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <select
          class="${classes}"
          id="${this._inputId}"
          name="${this.name}"
          .value="${this.value}"
          ?disabled="${this.disabled || this.readonly}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          @change="${this._onSelectChange}"
        >
          <option value="">${this.emptyLabel || t('selectEmpty')}</option>
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
