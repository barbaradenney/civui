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
  computeCursorPosition,
  processRawInput,
  t,
} from '@civui/core';
import type { MaskDefinition } from '@civui/core';
import { dispatch } from '@civui/core';

export type TextInputType = 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
export type TextInputWidth = 'default' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TextInputMask = 'ssn' | 'phone-us' | 'zip' | 'zip4' | 'ein' | 'phone-intl' | '';

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
  @property({ type: String, attribute: 'mask-pattern' }) maskPattern: string = '';

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
    const pattern = this._activePattern;
    if (pattern) {
      return applyMask(this.value, pattern);
    }
    return this.value;
  }

  override render() {
    const widthClass = WIDTH_CLASSES[this.width] || WIDTH_CLASSES['default'];
    const classes = inputClasses({
      extra: [widthClass, 'civ-max-w-full'],
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
    const effectiveMaxlength = pattern
      ? pattern.length
      : (this.maxlength && this.maxlength > 0 ? this.maxlength : undefined);

    // Display value: formatted when mask is active, raw otherwise
    const displayValue = pattern ? this.formattedValue : this.value;

    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, effectiveHint)}
        ${renderError(this._errorId, this.error)}
        <input
          class="${classes}"
          id="${this._inputId}"
          type="${this.type}"
          name="${this.name}"
          .value="${displayValue}"
          placeholder="${this.placeholder || nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          pattern="${this.pattern || nothing}"
          maxlength="${effectiveMaxlength ?? nothing}"
          minlength="${this.minlength && this.minlength > 0 ? this.minlength : nothing}"
          autocomplete="${this.autocomplete || nothing}"
          inputmode="${effectiveInputmode || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          @input="${this._activePattern ? this._onMaskInput : this._handleInput}"
          @change="${this._activePattern ? this._onMaskChange : this._handleChange}"
          @paste="${this._activePattern ? this._onMaskPaste : nothing}"
        />
      </div>
    `;
  }

  /**
   * Handle input events when a mask is active.
   * Strips the mask, filters invalid chars, reformats, and positions the cursor.
   */
  private _onMaskInput(e: InputEvent): void {
    const input = e.target as HTMLInputElement;
    const pattern = this._activePattern;

    // Strip mask literals from what the user typed, then filter invalid chars
    const stripped = stripMask(input.value, pattern);
    const raw = processRawInput(stripped, pattern);

    // Update the raw value
    this.value = raw;

    // Write formatted value back to the input imperatively
    const formatted = applyMask(raw, pattern);
    input.value = formatted;

    // Position cursor after the last raw character
    const cursorPos = computeCursorPosition(raw.length, pattern);
    input.setSelectionRange(cursorPos, cursorPos);

    // Dispatch civ-input with the raw value
    dispatch(this, 'civ-input', { value: this.value });
    this.updateFormValue(this.value);
  }

  /**
   * Handle change events when a mask is active.
   */
  private _onMaskChange(_e: Event): void {
    const maskDef = this._maskDef;
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
    this.updateFormValue(this.value);
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
