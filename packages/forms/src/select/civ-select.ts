// Schema: packages/schema/src/components/civ-select.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLabel, renderHint, renderError, inputClasses, t } from '@civui/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
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
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required, showRequired: this.required && !this.hideRequiredIndicator })}
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
          ${this._renderGroupedOptions()}
        </select>
      </div>
    `;
  }

  private _renderOption(opt: SelectOption) {
    return html`
      <option
        value="${opt.value}"
        ?selected="${opt.value === this.value}"
        ?disabled="${opt.disabled ?? false}"
      >
        ${opt.label}
      </option>
    `;
  }

  private _renderGroupedOptions() {
    const grouped = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];
    for (const opt of this.options) {
      if (opt.group) {
        if (!grouped.has(opt.group)) grouped.set(opt.group, []);
        grouped.get(opt.group)!.push(opt);
      } else {
        ungrouped.push(opt);
      }
    }

    return html`
      ${ungrouped.map((opt) => this._renderOption(opt))}
      ${[...grouped.entries()].map(([group, opts]) => html`
        <optgroup label="${group}">
          ${opts.map((opt) => this._renderOption(opt))}
        </optgroup>
      `)}
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
