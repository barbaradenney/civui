// Schema: packages/schema/src/components/civ-text-input.schema.ts

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CivFormElement,
  inputClasses,
  inputWidthClass,
  MASK_PRESETS,
  applyMask,
  stripMask,
  isComplete,
  computeCursorPosition,
  processRawInput,
  interpolate,
  t,
  validate,
  debounce,
} from '@civui/core';
import type { InputWidth, MaskDefinition } from '@civui/core';
import { dispatch } from '@civui/core';

export type TextInputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
/** @deprecated Use `InputWidth` from `@civui/core`. Re-exported for backwards compatibility. */
export type TextInputWidth = InputWidth;
export type TextInputMask = 'ssn' | 'phone-us' | 'zip' | 'zip4' | 'ein' | 'currency' | '';
export type TextInputValidate = 'email' | 'phone' | 'phoneIntl' | 'ssn' | 'ein' | 'routing' | 'zip' | 'zip4' | 'usState' | 'url' | 'currency' | 'alphanumeric' | '';

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
  @property({ type: String }) width: InputWidth = 'default';
  @property({ type: String }) placeholder: string = '';
  @property({ type: String }) pattern: string = '';
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) minlength?: number;
  @property({ type: Boolean, attribute: 'hide-char-count' }) hideCharCount = false;
  @property({ type: String }) autocomplete: string = '';
  @property({ type: String }) inputmode: string = '';
  @property({ type: String }) mask: TextInputMask = '';
  @property({ type: String }) prefix = '';
  @property({ type: String }) suffix = '';
  @property({ type: Boolean }) clearable = false;

  /**
   * Decorative icon rendered inside the input on the leading edge.
   * Pass any name from the civ-icon library. The input gets extra
   * inline-start padding to make room for the icon.
   *
   * Ignored when `prefix` (or the currency mask) is set — the prefix box
   * occupies the leading edge.
   */
  @property({ type: String, attribute: 'leading-icon' }) leadingIcon = '';

  /**
   * Accessible label for the leading icon. When set, the icon announces
   * to screen readers as an `img` with this label. When omitted (default),
   * the icon is hidden from assistive tech (decorative).
   */
  @property({ type: String, attribute: 'leading-icon-label' }) leadingIconLabel = '';

  /**
   * Decorative icon rendered inside the input on the trailing edge.
   * Ignored when `suffix` is set, or when `clearable` shows the clear
   * button (i.e. there is a non-empty value).
   */
  @property({ type: String, attribute: 'trailing-icon' }) trailingIcon = '';

  /** Accessible label for the trailing icon. See `leading-icon-label`. */
  @property({ type: String, attribute: 'trailing-icon-label' }) trailingIconLabel = '';

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

  /**
   * Mask formatting mode:
   * - `blur` (default) — user types freely, formatting applied on blur. Accessible.
   * - `live` — formats as user types with auto-inserted literals. Has accessibility
   *   tradeoffs (cursor jumping, unexpected characters for screen readers).
   */
  @property({ type: String, attribute: 'mask-mode' }) maskMode: 'blur' | 'live' = 'blur';

  /**
   * Declarative validation — auto-validates on blur using the built-in
   * validator. No JavaScript needed.
   *
   * @example
   * ```html
   * <civ-text-input label="Email" validate="email"></civ-text-input>
   * <civ-text-input label="Phone" validate="phoneIntl" type="tel"></civ-text-input>
   * ```
   */
  @property({ type: String, attribute: 'validate' }) validateType: TextInputValidate = '';

  /** Tracks whether the current error was set by the mask or validate system. */
  private _maskError = false;
  private _validateError = false;

  /**
   * Latest character count announced to assistive tech via the `aria-live`
   * region. Updates on a 1s debounce so keystrokes don't spam the screen
   * reader. The visual counter updates immediately from `this.value`.
   */
  @state() private _announcedCharCount = 0;
  private _charCountId = this.generateId('charcount');
  private _debouncedAnnounceCharCount = debounce(() => {
    this._announcedCharCount = this.value.length;
  }, 1000);

  /**
   * Show a "characters remaining" counter when the consumer set an explicit
   * `maxlength`. Suppressed when a mask is active — the mask's own length
   * rules drive `effectiveMaxlength` and would confuse a literal char count.
   */
  private get _showCharCount(): boolean {
    if (this.hideCharCount) return false;
    if (this._maskDef || this.maskPattern) return false;
    return this.maxlength != null && this.maxlength > 0;
  }

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
   * Re-captures `_defaultValue` after stripping so form reset restores raw, not formatted.
   */
  override connectedCallback(): void {
    super.connectedCallback();
    this._announcedCharCount = (this.value ?? '').length;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._debouncedAnnounceCharCount.cancel();
  }

  override firstUpdated(): void {
    super.firstUpdated();
    // Auto-populate hint from mask preset when no explicit hint is set
    const maskDef = this._maskDef;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!this.hint && maskDef?.hintKey) this.hint = t(maskDef.hintKey as any);
    if (this._activePattern && this.value) {
      this.value = processRawInput(stripMask(this.value, this._activePattern), this._activePattern);
      this._defaultValue = this.value;
      // Apply mask formatting to the visible input for pre-populated values
      requestAnimationFrame(() => {
        const input = this.querySelector('input') as HTMLInputElement;
        if (input && this.maskMode === 'blur') {
          input.value = applyMask(this.value, this._activePattern!);
        }
      });
    }
    this._announcedCharCount = (this.value ?? '').length;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (this._maskDef?.pii) {
      this.setAttribute('data-civ-pii', '');
    } else {
      this.removeAttribute('data-civ-pii');
    }
    if (changed.has('value') && this._showCharCount) {
      this._debouncedAnnounceCharCount();
    }
  }

  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    if (this._showCharCount) ids.push(this._charCountId);
    return ids.join(' ') || '';
  }

  override render() {
    const widthClass = inputWidthClass(this.width);
    const isCurrency = this._isCurrency;
    const hasPrefix = !!(this.prefix || isCurrency);
    const hasSuffix = !!this.suffix;
    const needsClearButton = this.clearable && !!this.value;
    // Inline icons defer to prefix/suffix and the clear button on the same edge.
    const showLeadingIcon = !!this.leadingIcon && !hasPrefix;
    const showTrailingIcon = !!this.trailingIcon && !hasSuffix && !needsClearButton;

    const roundingClasses = hasPrefix && hasSuffix
      ? ['civ-rounded-none']
      : hasPrefix
        ? ['civ-rounded-s-none']
        : hasSuffix
          ? ['civ-rounded-e-none']
          : [];

    const classes = inputClasses({
      extra: [
        widthClass,
        'civ-max-w-full',
        ...roundingClasses,
        ...(isCurrency ? ['civ-text-end'] : []),
        ...(showLeadingIcon ? ['civ-input-with-leading-icon'] : []),
        ...(showTrailingIcon ? ['civ-input-with-trailing-icon'] : []),
      ],
    });

    const maskDef = this._maskDef;
    const pattern = this._activePattern;
    const isLiveMode = this.maskMode === 'live';

    // Determine effective inputmode: preset inputmode > explicit inputmode > nothing
    const effectiveInputmode = (maskDef?.inputmode && this.type === 'text')
      ? maskDef.inputmode
      : this.inputmode;

    // Determine maxlength:
    // - Currency: no maxlength (variable length)
    // - Live mask: formatted pattern length (includes literals)
    // - Blur mask: raw digit count only (user types without literals)
    // - No mask: explicit maxlength prop
    const effectiveMaxlength = isCurrency
      ? undefined
      : pattern
        ? (isLiveMode ? pattern.length : pattern.replace(/[^#A*]/g, '').length)
        : (this.maxlength && this.maxlength > 0 ? this.maxlength : undefined);

    // Display value:
    // - Currency: raw (blur handler formats imperatively)
    // - Live mask: formatted always
    // - Blur mask: raw (blur handler formats imperatively)
    // - No mask: raw
    const displayValue = (pattern && isLiveMode)
      ? this.formattedValue
      : this.value;

    // Auto-set autocomplete="off" for PII masks unless user explicitly set autocomplete
    const effectiveAutocomplete = (maskDef?.pii && !this.autocomplete)
      ? 'off'
      : this.autocomplete;

    // Determine event handlers based on mask mode
    let inputHandler;
    let changeHandler;
    let blurHandler = nothing as any;
    let focusHandler = nothing as any;
    let pasteHandler = nothing as any;

    if (isCurrency) {
      inputHandler = this._onCurrencyInput;
      changeHandler = this._onCurrencyChange;
      blurHandler = this._onCurrencyBlur;
      focusHandler = this._onCurrencyFocus;
    } else if (pattern && isLiveMode) {
      // Live mode: format as you type (accessibility tradeoffs)
      inputHandler = this._onMaskInput;
      changeHandler = this._onMaskChange;
      pasteHandler = this._onMaskPaste;
    } else if (pattern) {
      // Blur mode (default): free-form input, format on blur
      inputHandler = this._onBlurMaskInput;
      changeHandler = this._onBlurMaskChange;
      blurHandler = this._onBlurMaskBlur;
      focusHandler = this._onBlurMaskFocus;
    } else {
      inputHandler = this._handleInput;
      changeHandler = this._handleChange;
      if (this.validateType) {
        blurHandler = this._onValidateBlur;
      }
    }

    const inputEl = html`
      <input
        class="${classes}"
        id="${this._inputId}"
        type="${this.type}"
        name="${this.name || nothing}"
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
        @paste="${pasteHandler}"
        @blur="${blurHandler}"
        @focus="${focusHandler}"
      />
    `;

    const needsAdjacentWrapper = hasPrefix || hasSuffix || needsClearButton;
    const needsIconOverlay = !needsAdjacentWrapper && (showLeadingIcon || showTrailingIcon);

    let wrappedInput;
    if (needsAdjacentWrapper) {
      wrappedInput = html`<div class="civ-flex ${widthClass} civ-max-w-full"
        >${hasPrefix
          ? html`<span class="civ-input-prefix" aria-hidden="true">${isCurrency ? '$' : this.prefix}</span>`
          : nothing}${inputEl}${needsClearButton
          ? html`<button type="button" class="civ-input-clear focus-visible:civ-focus-ring" aria-label="${t('clearButton')}" @click="${this._onClear}">
              <civ-icon name="close" size="sm"></civ-icon>
            </button>`
          : nothing}${hasSuffix
          ? html`<span class="civ-input-suffix" aria-hidden="true">${this.suffix}</span>`
          : nothing}</div>`;
    } else if (needsIconOverlay) {
      wrappedInput = html`<div class="civ-input-icon-wrap ${widthClass} civ-max-w-full"
        >${inputEl}${showLeadingIcon
          ? html`<span class="civ-input-icon civ-input-icon--leading"
              ><civ-icon name="${this.leadingIcon}" label="${this.leadingIconLabel || nothing}" size="sm"></civ-icon
            ></span>`
          : nothing}${showTrailingIcon
          ? html`<span class="civ-input-icon civ-input-icon--trailing"
              ><civ-icon name="${this.trailingIcon}" label="${this.trailingIconLabel || nothing}" size="sm"></civ-icon
            ></span>`
          : nothing}</div>`;
    } else {
      wrappedInput = inputEl;
    }

    const showCharCount = this._showCharCount;
    const remaining = showCharCount ? this.maxlength! - (this.value?.length ?? 0) : 0;

    return html`
      ${wrappedInput}
      ${showCharCount
        ? html`
            <span
              id="${this._charCountId}"
              class="civ-block civ-mt-0.5 civ-text-sm ${remaining < 0
                ? 'civ-text-error civ-font-bold'
                : 'civ-text-muted'}"
            >
              ${interpolate(t('inputCharsRemaining'), { count: remaining })}
            </span>
            <span class="civ-sr-only" aria-live="polite">
              ${interpolate(t('inputCharsRemaining'), { count: this.maxlength! - this._announcedCharCount })}
            </span>
          `
        : nothing}
    `;
  }

  /**
   * Handle clear button click.
   * Clears the value, any component-set errors, and dispatches events.
   */
  private _onClear(): void {
    this.value = '';
    if (this._maskError || this._validateError) {
      this.error = '';
      this._maskError = false;
      this._validateError = false;
    }
    const input = this.querySelector('input') as HTMLInputElement | null;
    if (input) {
      input.value = '';
      input.focus();
    }
    dispatch(this, 'civ-input', { value: '' });
    dispatch(this, 'civ-change', { value: '' });
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
    // Skip reformatting during IME composition
    if (e.isComposing) return;

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

  // ── Blur-mode mask handlers (default, accessible) ──────────

  /**
   * Blur-mode input: accept free-form input, filter to valid chars,
   * but do NOT format. Let the user type naturally.
   */
  private _onBlurMaskInput(e: Event): void {
    // Skip reformatting during IME composition
    if (e instanceof InputEvent && e.isComposing) return;

    const input = e.target as HTMLInputElement;
    const pattern = this._activePattern;

    // Filter to valid characters only, truncate to max raw length
    const raw = processRawInput(input.value.replace(/[^a-zA-Z0-9]/g, ''), pattern);

    this.value = raw;
    input.value = raw; // Show unformatted digits/chars while typing
    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Blur-mode blur: format the raw value for display and validate.
   */
  private _onBlurMaskBlur(): void {
    const input = this.querySelector('input') as HTMLInputElement;
    const pattern = this._activePattern;
    const maskDef = this._maskDef;
    if (!input || !pattern) return;

    // Format for display
    if (this.value) {
      input.value = applyMask(this.value, pattern);
    }

    // Validate completeness
    if (this.value && !isComplete(this.value, pattern)) {
      if (maskDef?.errorKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.error = t(maskDef.errorKey as any);
      } else {
        this.error = interpolate(t('maskPatternError'), { label: this.label || t('fieldFallbackLabel') });
      }
      this._maskError = true;
    } else if (this._maskError) {
      this.error = '';
      this._maskError = false;
    }
  }

  /**
   * Blur-mode focus: show raw value for editing.
   */
  private _onBlurMaskFocus(): void {
    const input = this.querySelector('input') as HTMLInputElement;
    if (input && this.value) {
      input.value = this.value;
    }
  }

  /**
   * Blur-mode change: dispatch civ-change with raw value.
   */
  private _onBlurMaskChange(): void {
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change', this._maskDef?.pii ? { piiMasked: true } : undefined);
  }

  // ── Declarative validation on blur ──────────────────────────

  /**
   * Runs the validator specified by the `validate` attribute on blur.
   * Sets/clears error automatically.
   */
  private _onValidateBlur(): void {
    if (!this.validateType || !this.value) {
      if (this._validateError) {
        this.error = '';
        this._validateError = false;
      }
      return;
    }

    const validatorFn = (validate as Record<string, Function>)[this.validateType];
    if (!validatorFn) return;

    const result = validatorFn(this.value);
    if (!result.valid) {
      this.error = result.error || '';
      this._validateError = true;
    } else if (this._validateError) {
      this.error = '';
      this._validateError = false;
    }
  }

  override formResetCallback(): void {
    super.formResetCallback();
    this._maskError = false;
    this._validateError = false;
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
