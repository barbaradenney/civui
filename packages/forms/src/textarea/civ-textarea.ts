import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivFormElement, debounce, dispatch, renderLabel, renderHint, renderError, inputClasses, t, interpolate } from '@civui/core';

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
 *
 * @fires civ-input - When value changes (on input), detail: { value }
 * @fires civ-change - When value changes (on change/blur), detail: { value }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-textarea')
export class CivTextarea extends CivFormElement {
  @property({ type: Number }) rows = 5;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) maxwords?: number;
  @property({ type: String }) placeholder = '';

  @state() private _charCount = 0;
  @state() private _announcedCharCount = 0;
  @state() private _wordCount = 0;
  @state() private _announcedWordCount = 0;

  private _charCountId = this.generateId('charcount');
  private _wordCountId = this.generateId('wordcount');
  // Debounce SR character count announcements at 1000ms to avoid
  // spamming screen readers on every keystroke. The visual counter
  // updates immediately; the aria-live region updates after a pause.
  private _debouncedAnnounceCount = debounce(() => {
    this._announcedCharCount = this._charCount;
  }, 1000);

  private _debouncedAnnounceWordCount = debounce(() => {
    this._announcedWordCount = this._wordCount;
  }, 1000);

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
    return ids.join(' ') || '';
  }

  private get _showWordCount(): boolean {
    return this.maxwords != null && this.maxwords > 0 && !(this.maxlength != null && this.maxlength > 0);
  }

  private _countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  override render() {
    const classes = inputClasses({
      extra: ['civ-resize-y'],
    });

    const showCharCount = this.maxlength != null && this.maxlength > 0;
    const remaining = showCharCount ? this.maxlength! - this._charCount : 0;

    return html`
      <div class="civ-mb-4">
        ${renderLabel({ label: this.label, inputId: this._inputId, required: this.required })}
        ${renderHint(this._hintId, this.hint)}
        ${renderError(this._errorId, this.error)}
        <textarea
          class="${classes}"
          id="${this._inputId}"
          name="${this.name}"
          rows="${this.rows}"
          .value="${this.value}"
          placeholder="${this.placeholder || nothing}"
          maxlength="${this.maxlength && this.maxlength > 0 ? this.maxlength : nothing}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          aria-required="${this.required || nothing}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          @input="${this._onInput}"
          @change="${this._handleChange}"
        ></textarea>
        ${showCharCount
          ? html`
              <span
                id="${this._charCountId}"
                class="civ-block civ-mt-0.5 civ-text-sm ${remaining < 0
                  ? 'civ-text-error civ-font-bold'
                  : 'civ-text-muted'}"
              >
                ${remaining} characters remaining
              </span>
              <span class="civ-sr-only" aria-live="polite">
                ${this.maxlength! - this._announcedCharCount} characters remaining
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

  private _onInput(e: Event): void {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
    this._charCount = target.value.length;
    this._debouncedAnnounceCount();
    if (this._showWordCount) {
      this._wordCount = this._countWords(target.value);
      this._debouncedAnnounceWordCount();
    }
    // Form value sync handled by _syncFormValue() in updated()
    dispatch(this, 'civ-input', { value: this.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-textarea': CivTextarea;
  }
}
