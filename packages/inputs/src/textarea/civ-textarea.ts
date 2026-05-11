import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, LegendHeadingMixin, debounce, dispatch, inputClasses, renderLabel, renderFormHeader, t, interpolate, validate, COUNT_ANNOUNCE_MS } from '@civui/core';

export type TextareaValidate = 'length' | '';

/**
 * CivUI Textarea
 *
 * Multi-line text input with optional character count display.
 * Uses ElementInternals for native form participation.
 *
 * @element civ-textarea
 *
 * @prop {string} label - Textarea label text
 * @prop {string} name - Form field name
 * @prop {string} value - Current value
 * @prop {string} hint - Hint text displayed below label
 * @prop {string} error - Error message (shows error state)
 * @prop {number} rows - Number of visible text rows
 * @prop {number} maxlength - Maximum character length (enables character count)
 * @prop {string} placeholder - Placeholder text
 * @prop {boolean} required - Whether the field is required
 * @prop {boolean} disabled - Whether the field is disabled
 * @prop {boolean} autogrow - Whether the textarea auto-grows to fit content
 * @prop {string} maxHeight - Maximum height for autogrow (CSS value, e.g. '300px')
 *
 * @fires civ-input - When value changes (on input), detail: { value }
 * @fires civ-change - When value changes (on change/blur), detail: { value }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-textarea')
export class CivTextarea extends LegendHeadingMixin(CivFormElement) {
  @property({ type: Number }) rows = 5;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxwords?: number;
  @property({ type: String }) placeholder = '';
  @property({ type: Boolean }) autogrow = false;
  @property({ type: String, attribute: 'max-height' }) maxHeight = '';

  /**
   * Declarative validation. When set, the validator runs on blur (and the
   * inner state flag tracks the resulting error so it can be cleared on
   * subsequent valid input without disturbing externally-set errors).
   *
   * Supported:
   * - `length` — checks `value.length` against `minlength`/`maxlength` and
   *   surfaces a "Must be at least/no more than/between X and Y characters"
   *   message via the standard locale keys.
   *
   * Other text-input validators (email, ssn, phone, …) don't fit the
   * multi-line use case and are intentionally not accepted here.
   */
  @property({ type: String, attribute: 'validate' }) validateType: TextareaValidate = '';

  /** Tracks whether the current error was set by the validate system. */
  private _validateError = false;

  @state() private _charCount = 0;
  @state() private _announcedCharCount = 0;
  @state() private _wordCount = 0;
  @state() private _announcedWordCount = 0;

  /** Tracks whether the current error was set by the word count system. */
  private _wordCountError = false;

  private _charCountId = this.generateId('charcount');
  private _wordCountId = this.generateId('wordcount');
  // Debounce SR character count announcements (COUNT_ANNOUNCE_MS) to
  // avoid spamming screen readers on every keystroke. The visual counter
  // updates immediately; the aria-live region updates after a pause.
  private _debouncedAnnounceCount = debounce(() => {
    this._announcedCharCount = this._charCount;
  }, COUNT_ANNOUNCE_MS);

  private _debouncedAnnounceWordCount = debounce(() => {
    this._announcedWordCount = this._wordCount;
  }, COUNT_ANNOUNCE_MS);

  override firstUpdated(): void {
    super.firstUpdated();
    this._autoGrow();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('value')) {
      this._autoGrow();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._charCount = this.value?.length || 0;
    this._announcedCharCount = this._charCount;
    this._wordCount = this._countWords(this.value);
    this._announcedWordCount = this._wordCount;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._debouncedAnnounceCount.cancel();
    this._debouncedAnnounceWordCount.cancel();
  }


  protected override get _ariaDescribedBy(): string {
    const ids: string[] = [];
    if (this.hint) ids.push(this._hintId);
    if (this.error) ids.push(this._errorId);
    if (this.maxlength != null && this.maxlength > 0) ids.push(this._charCountId);
    if (this._showWordCount) ids.push(this._wordCountId);
    return ids.join(' ');
  }

  private get _showWordCount(): boolean {
    return this.maxwords != null && this.maxwords > 0 && !(this.maxlength != null && this.maxlength > 0);
  }

  private _countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  override render() {
    const classes = inputClasses({
      extra: [this.autogrow ? 'civ-resize-none civ-overflow-hidden' : 'civ-resize-y'],
    });

    const showCharCount = this.maxlength != null && this.maxlength > 0;
    const remaining = showCharCount ? this.maxlength! - this._charCount : 0;

    const inner = html`
        <textarea
          class="${classes}"
          id="${this._inputId}"
          name="${this.name}"
          rows="${this.rows}"
          .value="${this.value}"
          placeholder="${this.placeholder || nothing}"
          maxlength="${this.maxlength && this.maxlength > 0 ? this.maxlength : nothing}"
          minlength="${this.minlength && this.minlength > 0 ? this.minlength : nothing}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          @input="${this._onInput}"
          @change="${this._onChange}"
          @blur="${this.validateType === 'length' ? this._onValidateBlur : nothing}"
        ></textarea>
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
        ${this._showWordCount
          ? html`
              <span
                id="${this._wordCountId}"
                class="civ-block civ-mt-0.5 civ-text-sm ${this._wordCount > this.maxwords!
                  ? 'civ-text-error civ-font-bold'
                  : 'civ-text-muted'}"
              >
                ${interpolate(t('textareaWordsRemaining'), { count: this.maxwords! - this._wordCount })}
              </span>
              <span class="civ-sr-only" aria-live="polite">
                ${interpolate(t('textareaWordsRemaining'), { count: this.maxwords! - this._announcedWordCount })}
              </span>
            `
          : nothing}
    `;

    return html`
      <div class="civ-mb-4">
        ${renderFormHeader({
          label: renderLabel({
            label: this.label,
            inputId: this._inputId,
            required: this.required,
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

  override formResetCallback(): void {
    super.formResetCallback();
    this._charCount = this._defaultValue?.length || 0;
    this._announcedCharCount = this._charCount;
    this._wordCount = this._countWords(this._defaultValue || '');
    this._announcedWordCount = this._wordCount;
    this._debouncedAnnounceCount.cancel();
    this._debouncedAnnounceWordCount.cancel();
  }

  private _autoGrow(): void {
    if (!this.autogrow) return;
    const textarea = this.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    if (this.maxHeight) {
      textarea.style.maxHeight = this.maxHeight;
      textarea.style.overflowY = 'auto';
    }
  }

  protected override _onInput(e: Event): void {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
    this._charCount = target.value.length;
    this._debouncedAnnounceCount();
    this._autoGrow();
    if (this._showWordCount) {
      this._wordCount = this._countWords(target.value);
      this._debouncedAnnounceWordCount();
      if (this.maxwords && this._wordCount > this.maxwords) {
        // Only set the error if no external error is already showing,
        // OR if we previously set the word-count error (so we can update the count).
        if (!this.error || this._wordCountError) {
          this.error = interpolate(t('textareaWordsOverLimit'), { count: this._wordCount - this.maxwords });
          this._wordCountError = true;
        }
      } else if (this.maxwords && this._wordCount <= this.maxwords && this._wordCountError) {
        this.error = '';
        this._wordCountError = false;
      }
    }
    // Form value sync handled by _syncFormValue() in updated()
    dispatch(this, 'civ-input', { value: this.value });
  }

  /**
   * Run the declarative validator on blur. Currently only `validate="length"`
   * is supported; it checks `value.length` against `minlength` and
   * `maxlength`. Empty values are skipped — required-field validation is
   * the base class's job.
   */
  private _onValidateBlur(): void {
    if (this.validateType !== 'length' || !this.value) {
      if (this._validateError) {
        this.error = '';
        this._validateError = false;
      }
      return;
    }

    const min = this.minlength && this.minlength > 0 ? this.minlength : undefined;
    const max = this.maxlength && this.maxlength > 0 ? this.maxlength : undefined;
    if (min == null && max == null) return;

    const result = validate.length(this.value, { min, max });
    if (!result.valid) {
      this.error = result.error || '';
      this._validateError = true;
    } else if (this._validateError) {
      this.error = '';
      this._validateError = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-textarea': CivTextarea;
  }
}
