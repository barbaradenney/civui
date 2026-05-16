// Schema: packages/schema/src/components/civ-text-input.schema.ts

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  CivFormElement,
  LegendHeadingMixin,
  inputClasses,
  inputWidthClass,
  MASK_PRESETS,
  applyMask,
  isComplete,
  computeCursorPosition,
  processRawInput,
  interpolate,
  renderLabel,
  renderFormHeader,
  t,
  validate,
  debounce,
  COUNT_ANNOUNCE_MS,
} from '@civui/core';
import type { InputWidth, MaskDefinition } from '@civui/core';
import { dispatch } from '@civui/core';

export type TextInputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
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
export class CivTextInput extends LegendHeadingMixin(CivFormElement) {
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
   * Currency-mask only: number of decimal places to keep / display.
   * Defaults to `2` ("1,234.56"). Set to `0` for whole-dollar mode
   * — input rejects the decimal key, blur normalizes to an integer
   * value, display omits the `.00` suffix ("1,234"). Government
   * forms with whole-dollar amount fields (W-4 line 4c, VA benefit
   * applications) use `decimals="0"`.
   *
   * Ignored when the currency mask is not active.
   */
  @property({ type: Number }) decimals = 2;

  /**
   * Currency-mask only: minimum allowed dollar amount. When set and
   * the user enters a smaller value, blur produces an inline error
   * ("Amount must be at least $X"). Defaults to undefined (no floor).
   *
   * Negative values are independently controlled by the currency
   * validator (negatives are rejected unless overridden); set
   * `min="0"` for the explicit "no negative" message instead of the
   * generic "Enter a valid dollar amount".
   *
   * Ignored when the currency mask is not active.
   */
  @property({ type: Number }) min?: number;

  /**
   * Currency-mask only: maximum allowed dollar amount. When set and
   * the user enters a larger value, blur produces an inline error
   * ("Amount must be at most $X"). Defaults to undefined (no ceiling).
   *
   * Ignored when the currency mask is not active.
   */
  @property({ type: Number }) max?: number;

  /**
   * Currency-mask only: accept negative amounts. Defaults to `false`
   * — the standard currency validator rejects values below zero
   * ("Enter a valid dollar amount"). Set to `true` for refund,
   * adjustment, or expense-report fields where a debit makes sense.
   *
   * When enabled, the input accepts a leading minus sign ("-1234.56")
   * and the display uses the locale-aware negative format ("-$1,234.56").
   *
   * Ignored when the currency mask is not active.
   */
  @property({ type: Boolean, attribute: 'allow-negative' }) allowNegative = false;

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
  }, COUNT_ANNOUNCE_MS);

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
    // Hydrate hint + normalize masked value before the first render so
    // these don't trigger a second update cycle.
    const maskDef = this._maskDef;
    if (!this.hint && maskDef?.hintKey) this.hint = t(maskDef.hintKey);
    if (this._activePattern && this.value) {
      // processRawInput filters per-character, so it handles both formatted
      // input (e.g. "123-45-6789") and raw input (e.g. "123456789") — the
      // separator chars don't pass `filterInput` for '#' slots and get
      // dropped naturally. Calling stripMask first would drop digits at
      // literal positions when the consumer passes a raw value, since
      // stripMask is positional.
      this.value = processRawInput(this.value, this._activePattern);
      this._defaultValue = this.value;
    }
    this._announcedCharCount = (this.value ?? '').length;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._debouncedAnnounceCharCount.cancel();
  }

  override firstUpdated(): void {
    super.firstUpdated();
    if (this._activePattern && this.value && this.maskMode === 'blur') {
      // Apply mask formatting to the visible input for pre-populated values
      requestAnimationFrame(() => {
        const input = this.querySelector('input') as HTMLInputElement;
        if (input) input.value = applyMask(this.value, this._activePattern!);
      });
    }
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
    // Re-apply the blur-mode mask when `value` is changed externally
    // (e.g. the time-picker host flipping `format` from 12 → 24
    // re-derives the raw digits string). Without this the inner
    // input shows raw digits until the user focuses + blurs the
    // field. Skip when the input is currently focused — that means
    // the user is editing and we'd fight them by overwriting.
    if (changed.has('value') && this._activePattern && this.maskMode === 'blur') {
      const input = this.querySelector('input') as HTMLInputElement | null;
      if (input && document.activeElement !== input) {
        input.value = this.value ? applyMask(this.value, this._activePattern) : '';
      }
    }
    // Same story for the currency mask: the blur handler used to
    // imperatively write a comma-formatted display ("1,234.50") into
    // the DOM input, but Lit's reactive `.value="${this.value}"`
    // binding then overwrote it back to the raw form ("1234.50") on
    // re-render. Without this hook, the user saw no commas after
    // their first blur — they had to focus + blur again, because on
    // the second blur `this.value` didn't change so Lit didn't
    // re-render to wipe the formatted display.
    //
    // Also covers prefilled `value="1234"` rendering as "1,234.00"
    // on initial mount (first updated() with `value` in changedProps).
    if (changed.has('value') && this._isCurrency) {
      this._applyCurrencyDisplay();
    }
  }

  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    if (this._showCharCount) ids.push(this._charCountId);
    return ids.join(' ');
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

    const inputEl = this._renderInput({ widthClass, hasPrefix, hasSuffix, showLeadingIcon, showTrailingIcon });
    const wrappedInput = this._wrapInput(inputEl, { widthClass, hasPrefix, hasSuffix, needsClearButton, showLeadingIcon, showTrailingIcon, isCurrency });

    const inner = html`
      ${wrappedInput}
      ${this._renderCharCount()}
    `;

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
        ${inner}
      </div>
    `;
  }

  /**
   * Render the bare `<input>` element with mask-aware attributes and handlers.
   * The wrapper layer (prefix/suffix/icon overlay) is composed separately by
   * `_wrapInput`.
   */
  private _renderInput(opts: {
    widthClass: string;
    hasPrefix: boolean;
    hasSuffix: boolean;
    showLeadingIcon: boolean;
    showTrailingIcon: boolean;
  }) {
    const { widthClass, hasPrefix, hasSuffix, showLeadingIcon, showTrailingIcon } = opts;
    const isCurrency = this._isCurrency;
    const maskDef = this._maskDef;
    const pattern = this._activePattern;
    const isLiveMode = this.maskMode === 'live';

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

    // Preset inputmode wins over explicit inputmode prop
    const effectiveInputmode = (maskDef?.inputmode && this.type === 'text')
      ? maskDef.inputmode
      : this.inputmode;

    // Currency: no cap. Live mask: full pattern length. Blur mask: raw-digit
    // count. None: explicit prop.
    const effectiveMaxlength = isCurrency
      ? undefined
      : pattern
        ? (isLiveMode ? pattern.length : pattern.replace(/[^#A*]/g, '').length)
        : (this.maxlength && this.maxlength > 0 ? this.maxlength : undefined);

    // Live mask shows formatted; everything else shows raw (blur handler formats imperatively).
    const displayValue = (pattern && isLiveMode)
      ? this.formattedValue
      : this.value;

    // PII masks default to autocomplete=off
    const effectiveAutocomplete = (maskDef?.pii && !this.autocomplete)
      ? 'off'
      : this.autocomplete;

    const handlers = this._resolveHandlers();

    return html`
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
        pattern="${this.pattern || nothing}"
        maxlength="${effectiveMaxlength ?? nothing}"
        minlength="${this.minlength && this.minlength > 0 ? this.minlength : nothing}"
        autocomplete="${effectiveAutocomplete || nothing}"
        inputmode="${effectiveInputmode || nothing}"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        @input="${handlers.input}"
        @change="${handlers.change}"
        @paste="${handlers.paste}"
        @blur="${handlers.blur}"
        @focus="${handlers.focus}"
      />
    `;
  }

  /**
   * Pick the right input/change/paste/blur/focus handlers for the active
   * mode (currency / live-mask / blur-mask / plain).
   *
   * Loose Handler type because each handler receives a different DOM event
   * subtype (InputEvent, ClipboardEvent, FocusEvent); Lit's `@event="${fn}"`
   * binding doesn't enforce a single signature.
   */
  private _resolveHandlers(): {
    input?: (e: any) => void;
    change?: (e: any) => void;
    blur?: (e: any) => void;
    focus?: (e: any) => void;
    paste?: (e: any) => void;
  } {
    const pattern = this._activePattern;
    const isLiveMode = this.maskMode === 'live';

    if (this._isCurrency) {
      return {
        input: this._onCurrencyInput,
        change: this._onCurrencyChange,
        blur: this._onCurrencyBlur,
        focus: this._onCurrencyFocus,
      };
    }
    if (pattern && isLiveMode) {
      // Live mode: format as you type (accessibility tradeoffs)
      return {
        input: this._onMaskInput,
        change: this._onMaskChange,
        paste: this._onMaskPaste,
      };
    }
    if (pattern) {
      // Blur mode (default): free-form input, format on blur
      return {
        input: this._onBlurMaskInput,
        change: this._onBlurMaskChange,
        blur: this._onBlurMaskBlur,
        focus: this._onBlurMaskFocus,
      };
    }
    return {
      input: this._onInput,
      change: this._onChange,
      blur: this.validateType ? this._onValidateBlur : undefined,
    };
  }

  /**
   * Compose the input with prefix/suffix segments, a clear button, or icon
   * overlays. Returns the bare input unchanged when none of those are needed.
   */
  private _wrapInput(inputEl: unknown, opts: {
    widthClass: string;
    hasPrefix: boolean;
    hasSuffix: boolean;
    needsClearButton: boolean;
    showLeadingIcon: boolean;
    showTrailingIcon: boolean;
    isCurrency: boolean;
  }) {
    const { widthClass, hasPrefix, hasSuffix, needsClearButton, showLeadingIcon, showTrailingIcon, isCurrency } = opts;
    const needsAdjacentWrapper = hasPrefix || hasSuffix || needsClearButton;
    const needsIconOverlay = !needsAdjacentWrapper && (showLeadingIcon || showTrailingIcon);

    if (needsAdjacentWrapper) {
      return html`<div class="civ-flex ${widthClass} civ-max-w-full"
        >${hasPrefix
          ? html`<span class="civ-input-prefix" aria-hidden="true">${isCurrency ? '$' : this.prefix}</span>`
          : nothing}${inputEl}${needsClearButton
          ? html`<button type="button" class="civ-close-btn" aria-label="${t('clearButton')}" @click="${this._onClear}">
              <civ-icon name="close"></civ-icon>
            </button>`
          : nothing}${hasSuffix
          ? html`<span class="civ-input-suffix" aria-hidden="true">${this.suffix}</span>`
          : nothing}</div>`;
    }
    if (needsIconOverlay) {
      return html`<div class="civ-input-icon-wrap ${widthClass} civ-max-w-full"
        >${inputEl}${showLeadingIcon
          ? html`<span class="civ-input-icon civ-input-icon--leading"
              ><civ-icon name="${this.leadingIcon}" label="${this.leadingIconLabel || nothing}"></civ-icon
            ></span>`
          : nothing}${showTrailingIcon
          ? html`<span class="civ-input-icon civ-input-icon--trailing"
              ><civ-icon name="${this.trailingIcon}" label="${this.trailingIconLabel || nothing}"></civ-icon
            ></span>`
          : nothing}</div>`;
    }
    return inputEl;
  }

  /**
   * Render the visible "N characters remaining" counter and its sr-only
   * debounced live region. Returns `nothing` when char-count UI isn't active.
   */
  private _renderCharCount() {
    if (!this._showCharCount) return nothing;
    const remaining = this.maxlength! - (this.value?.length ?? 0);
    return html`
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
   * Handle input events for currency mask. Filters to digits (and a
   * single decimal point when `decimals > 0`, plus an optional
   * leading minus when `allowNegative`), caps the fractional tail
   * to `decimals` digits. In whole-dollar mode (`decimals=0`) the
   * decimal point is stripped entirely along with anything that
   * follows — typing `1234.56` reduces to `1234`.
   */
  private _onCurrencyInput(e: InputEvent): void {
    const input = e.target as HTMLInputElement;
    let raw = input.value;

    // Preserve a single leading minus when `allowNegative` is on.
    // Anywhere else (or any subsequent `-`) gets stripped along with
    // other non-digit input.
    let sign = '';
    if (this.allowNegative && raw.trimStart().startsWith('-')) {
      sign = '-';
      raw = raw.replace(/-/g, '');
    }

    if (this.decimals === 0) {
      // Whole-dollar mode: digits only.
      raw = raw.replace(/\D/g, '');
    } else {
      // Allow digits and a single decimal point.
      raw = raw.replace(/[^\d.]/g, '');
      const parts = raw.split('.');
      if (parts.length > 2) {
        raw = parts[0] + '.' + parts.slice(1).join('');
      }
      // Cap fractional digits.
      const finalParts = raw.split('.');
      if (finalParts.length === 2 && finalParts[1].length > this.decimals) {
        finalParts[1] = finalParts[1].substring(0, this.decimals);
        raw = finalParts.join('.');
      }
    }

    raw = sign + raw;
    this.value = raw;
    input.value = raw;
    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Handle blur events for currency mask. Normalizes the value to
   * 2 decimal places and triggers the comma-formatted display.
   *
   * We rely on `updated()` to write the formatted display when the
   * value actually changes (first blur, prefill, external value
   * change). For the re-blur case where `this.value` is already
   * normalized — Lit detects no change and `updated()` doesn't see
   * `value` in changedProperties — we explicitly apply the display
   * via `updateComplete`. Waiting for `updateComplete` ensures
   * Lit's `.value="${this.value}"` template binding has already
   * settled, so our imperative write isn't immediately overwritten.
   */
  private _onCurrencyBlur(): void {
    if (!this.value) {
      void this.updateComplete.then(() => this._applyCurrencyDisplay());
      return;
    }
    const num = Number(this.value);
    if (isNaN(num) || this.value === '.') {
      this.value = '';
      return;
    }
    // Whole-dollar mode rounds away anything the user might have typed
    // before clamping; standard mode normalizes to `decimals` places.
    const normalized = this.decimals === 0
      ? String(Math.round(num))
      : num.toFixed(this.decimals);
    this.value = normalized;
    void this.updateComplete.then(() => this._applyCurrencyDisplay());
  }

  /**
   * Write the comma-formatted display ("1,234.50", or "1,234" in
   * whole-dollar mode) into the DOM input. Single source of truth —
   * called from `updated()` on value changes and from
   * `_onCurrencyBlur` after `updateComplete`. Skipped when the input
   * is focused so we don't fight the user's raw editing view.
   */
  private _applyCurrencyDisplay(): void {
    if (!this._isCurrency) return;
    const input = this.querySelector('input') as HTMLInputElement | null;
    if (!input || document.activeElement === input) return;
    if (!this.value) {
      input.value = '';
      return;
    }
    const num = Number(this.value);
    if (Number.isFinite(num)) {
      const fractionDigits = this.decimals === 0 ? 0 : this.decimals;
      input.value = num.toLocaleString('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
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
   * Handle change events for currency mask. Validates the entered
   * amount against the standard currency rules (non-negative, finite)
   * AND the optional `min` / `max` bounds. Errors are tracked via
   * `_maskError` so we can later clear our own diagnostic without
   * clobbering a consumer-set error.
   */
  private _onCurrencyChange(): void {
    if (this.value) {
      const num = Number(this.value);
      let msg = '';
      if (isNaN(num)) {
        msg = t('maskCurrencyError');
      } else if (!this.allowNegative && num < 0) {
        // Standard mode rejects negatives. Opt in via `allow-negative`
        // for refunds / adjustments. Min/max checks still apply.
        msg = t('maskCurrencyError');
      } else if (this.min != null && num < this.min) {
        msg = interpolate(t('maskCurrencyMinError'), { min: this._formatCurrencyForError(this.min) });
      } else if (this.max != null && num > this.max) {
        msg = interpolate(t('maskCurrencyMaxError'), { max: this._formatCurrencyForError(this.max) });
      }
      if (msg) {
        this.error = msg;
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
   * Format a numeric currency bound for embedding in an error
   * message. Includes the `$` prefix and respects the active
   * `decimals` so a `min=100` shows as "$100" in whole-dollar mode
   * and "$100.00" in standard mode.
   */
  private _formatCurrencyForError(amount: number): string {
    const fractionDigits = this.decimals === 0 ? 0 : this.decimals;
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
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
          this.error = t(maskDef.errorKey);
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
        this.error = t(maskDef.errorKey);
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
