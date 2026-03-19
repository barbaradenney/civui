// Schema: packages/schema/src/components/civ-text-input.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  CivFormElement,
  renderLabel,
  renderHint,
  renderError,
  inputClasses,
  MASK_PRESETS,
  applyMask,
  stripMask,
  isComplete,
  computeCursorPosition,
  processRawInput,
  interpolate,
  t,
} from '@civui/core';
import type { MaskDefinition } from '@civui/core';
import { dispatch } from '@civui/core';

export type TextInputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
export type TextInputWidth = 'default' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TextInputMask = 'ssn' | 'phone-us' | 'zip' | 'zip4' | 'ein' | 'phone-intl' | 'currency' | '';

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
 * CivUI TextInput
 *
 * Accessible text input with label, hint, error, and width variants.
 * Uses ElementInternals for native form participation.
 * Supports input masking via `mask` (preset name) or `mask-pattern` (custom pattern).
 *
 * @element civ-text-input
 */
@customElement('civ-text-input')
export class CivTextInput extends CivFormElement {
  @property({ type: String }) type: TextInputType = 'text';
  @property({ type: String }) width: TextInputWidth = 'default';
  @property({ type: String }) placeholder: string = '';
  @property({ type: String }) pattern: string = '';
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) minlength?: number;
  @property({ type: String }) autocomplete: string = '';
  @property({ type: String }) inputmode: string = '';
  @property({ type: String }) mask: TextInputMask = '';

  /**
   * Custom mask pattern string. Slot syntax:
   * - `#` = digit (0-9)
   * - `A` = letter (a-z, A-Z)
   * - `*` = any printable character
   *
   * All other characters are treated as literals inserted automatically.
   *
   * @example
   * ```html
   * <civ-text-input label="Code" mask-pattern="AAA-####"></civ-text-input>
   * ```
   */
  @property({ type: String, attribute: 'mask-pattern' }) maskPattern: string = '';

  /** Tracks whether the current error was set by the mask system. */
  private _maskError = false;

  /** Returns true when the currency mask is active. */
  private get _isCurrency(): boolean {
    return this.mask === 'currency';
  }

  /**
   * Returns the active MaskDefinition from a preset, or builds one
   * from `maskPattern`, or null if no mask is active.
   */
  private get _maskDef(): MaskDefinition | null {
    if (this.mask && MASK_PRESETS[this.mask]) {
      return MASK_PRESETS[this.mask];
    }
    if (this.maskPattern) {
      return {
        pattern: this.maskPattern,
        hintKey: '',
        errorKey: '',
        inputmode: '',
        pii: false,
      };
    }
    return null;
  }

  /**
   * Returns the active mask pattern string, or empty string if no mask.
   */
  private get _activePattern(): string {
    const def = this._maskDef;
    return def ? def.pattern : '';
  }

  /**
   * Returns the formatted (masked) value for display. When no mask
   * is active, returns the raw value unchanged.
   */
  get formattedValue(): string {
    if (this._isCurrency) {
      if (!this.value) return '';
      const num = Number(this.value);
      if (isNaN(num)) return this.value;
      const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${formatted}`;
    }
    const pattern = this._activePattern;
    if (pattern) {
      return applyMask(this.value, pattern);
    }
    return this.value;
  }

  /**
   * Strip any formatted initial value through the mask engine on first render.
   * For example, `value="123-45-6789"` with `mask="ssn"` becomes raw `"123456789"`.
   */
  override firstUpdated(): void {
    super.firstUpdated();
    if (this._activePattern && this.value) {
      this.value = processRawInput(stripMask(this.value, this._activePattern), this._activePattern);
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (this._maskDef?.pii) {
      this.setAttribute('data-civ-pii', '');
    } else {
      this.removeAttribute('data-civ-pii');
    }
  }

  override render() {
    const widthClass = WIDTH_CLASSES[this.width] || WIDTH_CLASSES['default'];
    const isCurrency = this._isCurrency;

    const classes = inputClasses({
      extra: [
        widthClass,
        'civ-max-w-full',
        ...(isCurrency ? ['civ-rounded-s-none', 'civ-text-end'] : []),
      ],
    });

    const maskDef = this._maskDef;
    const pattern = this._activePattern;

    // Determine effective inputmode: preset inputmode > explicit inputmode > nothing
    const effectiveInputmode = (maskDef?.inputmode && this.type === 'text')
      ? maskDef.inputmode
      : this.inputmode;

    // Determine effective hint: explicit hint > preset hint > nothing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const effectiveHint = this.hint || (maskDef?.hintKey ? t(maskDef.hintKey as any) : '');

    // Determine maxlength: mask pattern length takes precedence when mask is active
    // Currency has no maxlength (variable length)
    const effectiveMaxlength = isCurrency
      ? undefined
      : pattern
        ? pattern.length
        : (this.maxlength && this.maxlength > 0 ? this.maxlength : undefined);

    // Display value: formatted when mask is active, raw otherwise
    // Currency display is handled by focus/blur, so show raw value by default
    const displayValue = isCurrency
      ? this.value
      : pattern ? this.formattedValue : this.value;

    // Auto-set autocomplete="off" for PII masks unless user explicitly set autocomplete
    const effectiveAutocomplete = (maskDef?.pii && !this.autocomplete)
      ? 'off'
      : this.autocomplete;

    // Determine event handlers
    const inputHandler = isCurrency
      ? this._onCurrencyInput
      : pattern ? this._onMaskInput : this._handleInput;
    const changeHandler = isCurrency
      ? this._onCurrencyChange
      : pattern ? this._onMaskChange : this._handleChange;
    const blurHandler = isCurrency ? this._onCurrencyBlur : nothing;
    const focusHandler = isCurrency ? this._onCurrencyFocus : nothing;

    const inputEl = html`
      <input
        class="${classes}"
        id="${this._inputId}"
        type="${this.type}"
        name="${this.name}"
        .value="${displayValue}"
        placeholder="${this.placeholder || nothing}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?required="${this.required}"
        aria-required="${this.required || nothing}"
        pattern="${this.pattern || nothing}"
        maxlength="${effectiveMaxlength ?? nothing}"
        minlength="${this.minlength && this.minlength > 0 ? this.minlength : nothing}"
        autocomplete="${effectiveAutocomplete || nothing}"
        inputmode="${effectiveInputmode || nothing}"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        @input="${inputHandler}"
        @change="${changeHandler}"
        @paste="${pattern && !isCurrency ? this._onMaskPaste : nothing}"
        @blur="${blurHandler}"
        @focus="${focusHandler}"
      />
    `;

    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, effectiveHint)}
        ${renderError(this._errorId, this.error)}
        ${isCurrency
          ? html`<div class="civ-flex ${widthClass} civ-max-w-full"
            ><span class="civ-input-prefix" aria-hidden="true">$</span>${inputEl}</div>`
          : inputEl}
      </div>
    `;
  }

  /**
   * Handle input events for currency mask.
   * Filters to digits and one decimal point, limits to 2 decimal places.
   */
  private _onCurrencyInput(e: InputEvent): void {
    const input = e.target as HTMLInputElement;
    let raw = input.value;

    // Remove all characters except digits and decimal point
    raw = raw.replace(/[^\d.]/g, '');

    // Allow only one decimal point
    const parts = raw.split('.');
    if (parts.length > 2) {
      raw = parts[0] + '.' + parts.slice(1).join('');
    }

    // Re-split after dedup to get fresh parts for decimal check
    const finalParts = raw.split('.');
    if (finalParts.length === 2 && finalParts[1].length > 2) {
      finalParts[1] = finalParts[1].substring(0, 2);
      raw = finalParts.join('.');
    }

    this.value = raw;
    input.value = raw;
    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Handle blur events for currency mask.
   * Formats display with commas and pads to 2 decimal places.
   */
  private _onCurrencyBlur(): void {
    if (!this.value) return;
    const input = this.querySelector('input') as HTMLInputElement;
    const num = Number(this.value);
    if (isNaN(num) || this.value === '.') {
      this.value = '';
      if (input) input.value = '';
      return;
    }

    // Normalize raw value to 2 decimal places
    this.value = num.toFixed(2);

    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (input) {
      input.value = formatted;
    }
  }

  /**
   * Handle focus events for currency mask.
   * Shows raw numeric value for easy editing (removes commas).
   */
  private _onCurrencyFocus(): void {
    const input = this.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = this.value;
    }
  }

  /**
   * Handle change events for currency mask.
   * Validates and dispatches civ-change.
   */
  private _onCurrencyChange(): void {
    if (this.value) {
      const num = Number(this.value);
      if (isNaN(num) || num < 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.error = t('maskCurrencyError' as any);
        this._maskError = true;
      } else if (this._maskError) {
        this.error = '';
        this._maskError = false;
      }
    } else if (this._maskError) {
      this.error = '';
      this._maskError = false;
    }

    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  /**
   * Handle input events when a mask is active.
   *
   * Instead of trying to align input.value with the pattern positionally
   * (which breaks on mid-string edits), we:
   * 1. Count raw (non-literal) chars before the cursor in the current input
   * 2. Strip ALL non-alphanumeric chars to get a clean raw string
   * 3. For backspace/delete, splice the old raw value to remove the right char
   * 4. Reformat and reposition cursor
   */
  private _onMaskInput(e: InputEvent): void {
    const input = e.target as HTMLInputElement;
    const pattern = this._activePattern;
    if (!pattern) return;

    const cursorPos = input.selectionStart ?? input.value.length;
    const inputType = e.inputType;

    // Count how many alphanumeric (raw) characters appear before cursor
    // in the current (already-modified-by-browser) input value
    let rawCursorPos = 0;
    for (let i = 0; i < cursorPos && i < input.value.length; i++) {
      if (/[a-zA-Z0-9]/.test(input.value[i])) rawCursorPos++;
    }

    // Handle backspace: delete the raw character before the raw cursor position
    if (inputType === 'deleteContentBackward') {
      const oldRaw = this.value;
      if (rawCursorPos >= 0 && rawCursorPos < oldRaw.length) {
        // Remove the raw char at rawCursorPos (the char just before where cursor landed)
        // When backspace removes a literal, rawCursorPos points at the raw char we want gone
        const newRaw = oldRaw.substring(0, rawCursorPos) + oldRaw.substring(rawCursorPos + 1);
        const processed = processRawInput(newRaw, pattern);
        this.value = processed;
        const formatted = applyMask(processed, pattern);
        input.value = formatted;
        const newCursor = computeCursorPosition(rawCursorPos, pattern);
        input.setSelectionRange(newCursor, newCursor);
        dispatch(this, 'civ-input', { value: this.value });
        return;
      }
    }

    // Handle forward delete
    if (inputType === 'deleteContentForward') {
      const oldRaw = this.value;
      if (rawCursorPos >= 0 && rawCursorPos < oldRaw.length) {
        const newRaw = oldRaw.substring(0, rawCursorPos) + oldRaw.substring(rawCursorPos + 1);
        const processed = processRawInput(newRaw, pattern);
        this.value = processed;
        const formatted = applyMask(processed, pattern);
        input.value = formatted;
        const newCursor = computeCursorPosition(rawCursorPos, pattern);
        input.setSelectionRange(newCursor, newCursor);
        dispatch(this, 'civ-input', { value: this.value });
        return;
      }
    }

    // For insertions and all other input types:
    // Strip ALL non-alphanumeric chars from input.value to get clean raw chars
    const stripped = input.value.replace(/[^a-zA-Z0-9]/g, '');
    const raw = processRawInput(stripped, pattern);

    this.value = raw;
    const formatted = applyMask(raw, pattern);
    input.value = formatted;

    // Map raw cursor position back to formatted position
    const newCursor = computeCursorPosition(rawCursorPos, pattern);
    input.setSelectionRange(newCursor, newCursor);

    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Handle change events when a mask is active.
   * Validates completeness and sets/clears mask errors.
   */
  private _onMaskChange(_e: Event): void {
    const maskDef = this._maskDef;
    const pattern = this._activePattern;

    // Validate completeness on change
    if (pattern && this.value) {
      if (!isComplete(this.value, pattern)) {
        // Set error from preset error key, or generic pattern error for custom masks
        if (maskDef?.errorKey) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.error = t(maskDef.errorKey as any);
        } else {
          this.error = interpolate(t('maskPatternError'), { label: this.label || t('fieldFallbackLabel') });
        }
        this._maskError = true;
      } else if (this._maskError) {
        // Clear only mask-set errors
        this.error = '';
        this._maskError = false;
      }
    } else if (!this.value && this._maskError) {
      // Empty value: clear mask error
      this.error = '';
      this._maskError = false;
    }

    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change', maskDef?.pii ? { piiMasked: true } : undefined);
  }

  /**
   * Handle paste events when a mask is active.
   * Strips pasted text to valid raw characters and reformats.
   */
  private _onMaskPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const pattern = this._activePattern;
    const pasted = e.clipboardData?.getData('text') ?? '';

    // Filter pasted text through the mask rules
    const raw = processRawInput(pasted, pattern);

    // Update value and reformat
    this.value = raw;
    const formatted = applyMask(raw, pattern);

    const input = this.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = formatted;
      const cursorPos = computeCursorPosition(raw.length, pattern);
      input.setSelectionRange(cursorPos, cursorPos);
    }

    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Always sync the raw (unformatted) value to the form,
   * regardless of whether a mask is active.
   */
  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || '');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-text-input': CivTextInput;
  }
}
