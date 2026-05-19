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
  @property({ type: Boolean, attribute: 'allow-decimal' }) allowDecimal = false;
  @property({ type: Boolean, attribute: 'allow-negative' }) allowNegative = false;
  /**
   * Increment / decrement applied when the user presses ArrowUp /
   * ArrowDown. Defaults to 1 (matches native `<input type="number">`).
   * Set to 0 to disable arrow-key stepping. Fractional steps (e.g.
   * 0.5, 0.25) require `allow-decimal`.
   */
  @property({ type: Number }) step = 1;
  @property({ type: String }) placeholder = '';
  @property({ type: String }) prefix = '';
  @property({ type: String }) suffix = '';
  @property({ type: String }) width: InputWidth = 'default';
  /**
   * Density variant. `default` renders the full label / hint / error chrome.
   * `sm` (compact) renders just the bare `<input>` with the host's `aria-label`
   * propagated. Prefix / suffix decoration is dropped in compact mode.
   */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Tracks whether the current error was set by the range validator. */
  private _rangeError = false;

  /** Focus the inner <input> — used by callers like the data-grid cell editor. */
  override focus(options?: FocusOptions): void {
    const input = this.querySelector<HTMLInputElement>('input');
    if (input) input.focus(options);
    else super.focus(options);
  }

  override render() {
    if (this.spacing === 'sm') return this._renderCompact();

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
        @paste="${this._onPaste}"
        @keydown="${this._onKeydown}"
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

  /** Compact render — bare <input>, no prefix/suffix decoration, no chrome. */
  private _renderCompact() {
    const ariaLabel = this.getAttribute('aria-label') || undefined;
    const inputmode = this.allowDecimal ? 'decimal' : 'numeric';
    return html`
      <input
        class="civ-input civ-input--sm civ-w-full civ-text-end"
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
        aria-label="${ariaLabel ?? nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-valuemin="${this.min != null ? String(this.min) : nothing}"
        aria-valuemax="${this.max != null ? String(this.max) : nothing}"
        @input="${this._onInput}"
        @change="${this._onChange}"
        @blur="${this._onBlur}"
        @paste="${this._onPaste}"
        @keydown="${this._onKeydown}"
      />
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
    // Defer reformatting while the user is composing (CJK IMEs,
    // dead keys). Filtering mid-composition strips the partial
    // glyphs and resets the cursor inside the IME's candidate window.
    if (e instanceof InputEvent && e.isComposing) return;

    const target = e.target as HTMLInputElement;
    const filtered = this._filterValue(target.value);
    this.value = filtered;
    if (target.value !== filtered) {
      // Preserve caret position when filtering shortens the value
      // (e.g., paste with separators). selectionStart is null for
      // input types that don't support selection — defensive cast.
      const caret = target.selectionStart ?? filtered.length;
      target.value = filtered;
      try {
        target.setSelectionRange(Math.min(caret, filtered.length), Math.min(caret, filtered.length));
      } catch { /* unsupported input type */ }
    }
    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Paste handler that politely announces when the filter strips
   * pasted content. Typing one-by-one already produces no visible
   * feedback for filtered characters (the digit appears, the letter
   * doesn't), so a screen-reader user can tell. Paste is the case
   * where multiple stripped characters disappear at once with no cue.
   */
  private _onPaste(e: ClipboardEvent): void {
    const pasted = e.clipboardData?.getData('text') ?? '';
    if (!pasted) return;
    const filteredPaste = this._filterValue(pasted);
    if (filteredPaste !== pasted) {
      this.announce(t('numberPasteFiltered'), 'polite');
    }
    // Don't preventDefault — let the native paste run; _onInput picks
    // it up and filters the full input value (which catches
    // selection-replace paste correctly).
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

    // Reject values the filter accepts as partial typing states but that
    // aren't actually numeric on commit: a lone `-`, an empty decimal `.`,
    // or a leading-only `-.` (when allow-decimal + allow-negative are
    // both set). Clear them so the form sees `""` instead of `NaN`.
    if (this.value === '-' || this.value === '.' || this.value === '-.') {
      this.value = '';
      const input = this.querySelector('input') as HTMLInputElement | null;
      if (input) input.value = '';
      if (this._rangeError) {
        this.error = '';
        this._rangeError = false;
      }
      return;
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

  /**
   * ArrowUp / ArrowDown step the value by `step` (default 1). Matches
   * native `<input type="number">` behavior, which we lose by rendering
   * `type="text"` (we use text to preserve leading-zero strings and
   * avoid locale-specific decimal-separator issues).
   *
   * Skips when:
   *  - step is 0 (consumer disabled)
   *  - host is disabled/readonly
   *  - the current partial state isn't a number ("-", ".", "")
   *
   * Clamps to [min, max] when set. Uses fixed-precision rounding
   * (matched to step + current) to dodge floating-point drift
   * (`0.1 + 0.2 ≠ 0.3`).
   */
  private _onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (this.step === 0 || this.disabled || this.readonly) return;

    e.preventDefault();

    const current = this.value === '' ? (this.min ?? 0) : Number(this.value);
    if (!Number.isFinite(current)) return;

    const direction = e.key === 'ArrowUp' ? 1 : -1;
    const raw = current + direction * this.step;

    // Match the decimal precision of `step` so 0.1+0.2 doesn't render
    // as "0.30000000000000004".
    const precision = (n: number): number => {
      const s = String(n);
      const idx = s.indexOf('.');
      return idx === -1 ? 0 : s.length - idx - 1;
    };
    const p = Math.max(precision(this.step), precision(current));
    let next = Number(raw.toFixed(p));

    if (this.min != null && next < this.min) next = this.min;
    if (this.max != null && next > this.max) next = this.max;
    if (!this.allowNegative && next < 0) next = 0;

    const nextStr = String(next);
    if (nextStr === this.value) return;

    this.value = nextStr;
    const input = e.target as HTMLInputElement;
    input.value = nextStr;
    if (this._rangeError) {
      this.error = '';
      this._rangeError = false;
    }
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-number': CivNumber;
  }
}
