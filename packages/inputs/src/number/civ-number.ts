// Schema: packages/schema/src/components/civ-number.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  CivFormElement,
  LegendHeadingMixin,
  inputClasses,
  inputWidthClass,
  renderLabel,
  renderFormHeader,
  dispatch,
  t,
  validate,
} from '@civui/core';
import type { InputWidth } from '@civui/core';

/**
 * CivUI Number
 *
 * Generic numeric input for quantities, counts, ages, and other non-currency
 * numbers. Renders `<input type="text" inputmode="numeric">` (or
 * `inputmode="decimal"` when `allow-decimal` is set) — this is more
 * accessible than the native `type="number"`, which has known issues
 * (scroll wheel mutation, locale-specific decimal separators, no
 * spinner control on iOS).
 *
 * For dollar amounts, use `civ-currency`; for SSN, ZIP, EIN, phone, etc.
 * use the dedicated preset components.
 *
 * @element civ-number
 *
 * @prop {number} min - Minimum allowed value (inclusive)
 * @prop {number} max - Maximum allowed value (inclusive)
 * @prop {number} step - Step increment (informational; native increment buttons are not rendered)
 * @prop {boolean} allowDecimal - Allow decimal digits. When false (default), only integers are accepted.
 * @prop {boolean} allowNegative - Allow a leading minus sign. Defaults to false; set true for things like temperature.
 * @prop {string} placeholder - Placeholder text
 * @prop {string} prefix - Prefix text (e.g., "#")
 * @prop {string} suffix - Suffix text (e.g., "%", "kg")
 * @prop {string} width - Input width variant
 *
 * @fires civ-input - On every value change, detail: { value: string }
 * @fires civ-change - On committed value change, detail: { value: string }
 * @fires civ-analytics - Analytics tracking on change
 */
@customElement('civ-number')
export class CivNumber extends LegendHeadingMixin(CivFormElement) {
  @property({ type: Number }) min?: number;
  @property({ type: Number }) max?: number;
  @property({ type: Number }) step?: number;
  @property({ type: Boolean, attribute: 'allow-decimal' }) allowDecimal = false;
  @property({ type: Boolean, attribute: 'allow-negative' }) allowNegative = false;
  @property({ type: String }) placeholder = '';
  @property({ type: String }) prefix = '';
  @property({ type: String }) suffix = '';
  @property({ type: String }) width: InputWidth = 'default';

  /** Tracks whether the current error was set by the range validator. */
  private _rangeError = false;

  override render() {
    const widthClass = inputWidthClass(this.width);
    const hasPrefix = !!this.prefix;
    const hasSuffix = !!this.suffix;

    const roundingClasses = hasPrefix && hasSuffix
      ? ['civ-rounded-none']
      : hasPrefix
        ? ['civ-rounded-s-none']
        : hasSuffix
          ? ['civ-rounded-e-none']
          : [];

    const classes = inputClasses({
      extra: [widthClass, 'civ-max-w-full', ...roundingClasses, 'civ-text-end'],
    });

    const inputmode = this.allowDecimal ? 'decimal' : 'numeric';

    const inputEl = html`
      <input
        class="${classes}"
        id="${this._inputId}"
        type="text"
        name="${this.name || nothing}"
        .value="${this.value}"
        placeholder="${this.placeholder || nothing}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?required="${this.required}"
        inputmode="${inputmode}"
        autocomplete="off"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-valuemin="${this.min != null ? String(this.min) : nothing}"
        aria-valuemax="${this.max != null ? String(this.max) : nothing}"
        @input="${this._onInput}"
        @change="${this._onChange}"
        @blur="${this._onBlur}"
      />
    `;

    const wrapped = (hasPrefix || hasSuffix)
      ? html`<div class="civ-flex ${widthClass} civ-max-w-full"
          >${hasPrefix
            ? html`<span class="civ-input-prefix" aria-hidden="true">${this.prefix}</span>`
            : nothing}${inputEl}${hasSuffix
            ? html`<span class="civ-input-suffix" aria-hidden="true">${this.suffix}</span>`
            : nothing}</div>`
      : inputEl;

    return html`
      <div class="civ-mb-4">
        ${renderFormHeader({
          label: renderLabel({
            label: this.label,
            inputId: this._inputId,
            required: this.required,
            showRequired: !this.hideRequiredIndicator && this.required,
            headingLevel: this.headingLevel,
            size: this.size,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
        })}
        ${wrapped}
      </div>
    `;
  }

  /**
   * Filter input to allowed characters. Strips letters and anything
   * else that isn't a digit (or, when allowed, a single decimal point /
   * leading minus). Keeps the input string-shaped so we can preserve
   * partial typing states like "12." while the user is still typing.
   */
  private _filterValue(raw: string): string {
    let s = raw;

    // Allow leading minus once when configured.
    let hasMinus = false;
    if (this.allowNegative && s.startsWith('-')) {
      hasMinus = true;
      s = s.slice(1);
    }

    if (this.allowDecimal) {
      // Keep digits and the first decimal point.
      s = s.replace(/[^\d.]/g, '');
      const parts = s.split('.');
      if (parts.length > 2) {
        s = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      s = s.replace(/\D/g, '');
    }

    return hasMinus ? `-${s}` : s;
  }

  protected override _onInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    const filtered = this._filterValue(target.value);
    this.value = filtered;
    if (target.value !== filtered) target.value = filtered;
    dispatch(this, 'civ-input', { value: this.value });
  }

  protected override _onChange(_e: Event): void {
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  /**
   * On blur, parse the value to a number and run the range validator.
   * Sets `error` when out of range or non-numeric. Empty values are
   * skipped — required-field validation is the base class's job.
   */
  private _onBlur(): void {
    if (!this.value) {
      if (this._rangeError) {
        this.error = '';
        this._rangeError = false;
      }
      return;
    }

    // Allow trailing decimal point during typing, but on blur normalize "12." → "12"
    if (this.allowDecimal && this.value.endsWith('.')) {
      this.value = this.value.slice(0, -1);
      const input = this.querySelector('input') as HTMLInputElement | null;
      if (input) input.value = this.value;
    }

    if (this.min == null && this.max == null) return;

    const num = Number(this.value);
    const result = validate.range(num, { min: this.min, max: this.max });
    if (!result.valid) {
      this.error = result.error || t('validateRangeBetween');
      this._rangeError = true;
    } else if (this._rangeError) {
      this.error = '';
      this._rangeError = false;
    }
  }

  override formResetCallback(): void {
    super.formResetCallback();
    this._rangeError = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-number': CivNumber;
  }
}
