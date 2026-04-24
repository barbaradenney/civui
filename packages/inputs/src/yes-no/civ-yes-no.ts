import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, buildDescribedBy, resolveGroupNavIndex, isRtl } from '@civui/core';

/**
 * CivUI Yes/No
 *
 * A simple boolean question component for yes/no questions in government forms.
 * Renders as a fieldset with two styled buttons (Yes / No).
 * Uses ElementInternals for form participation.
 *
 * @element civ-yes-no
 *
 * @prop {string} legend - Question text
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} required - Whether a selection is required
 * @prop {boolean} disabled - Disables both buttons
 * @prop {boolean} readonly - Makes the control read-only
 * @prop {string} value - Currently selected value ('yes' | 'no' | unsureValue | '')
 * @prop {string} yesLabel - Label for the Yes button (default: 'Yes')
 * @prop {string} noLabel - Label for the No button (default: 'No')
 * @prop {string} unsureLabel - Label for an optional third button. When non-empty, a third option is rendered.
 * @prop {string} unsureValue - Form value for the third option (default: 'unsure')
 *
 * @fires civ-input - When the selected value changes, detail: { value }
 * @fires civ-change - When the selected value changes, detail: { value }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-yes-no')
export class CivYesNo extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: String, attribute: 'yes-label' }) yesLabel = 'Yes';
  @property({ type: String, attribute: 'no-label' }) noLabel = 'No';
  @property({ type: String, attribute: 'unsure-label' }) unsureLabel = '';
  @property({ type: String, attribute: 'unsure-value' }) unsureValue = 'unsure';

  protected override _defaultValue = '';
  private _boundOnKeydown = this._onKeydown.bind(this);

  /** Ordered list of option values, dynamically includes the third option. */
  private get _options(): string[] {
    const opts = ['yes', 'no'];
    if (this.unsureLabel) opts.push(this.unsureValue);
    return opts;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override firstUpdated(): void {
    super.firstUpdated();
    this._defaultValue = this.value;
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    const btnClasses = 'civ-btn civ-btn--yesno focus-visible:civ-focus-ring';

    return html`
      <fieldset
        class="civ-fieldset"
        role="radiogroup"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
        <div class="civ-flex civ-gap-2" role="presentation">
          <button
            type="button"
            role="radio"
            aria-checked="${this.value === 'yes' ? 'true' : 'false'}"
            tabindex="${this.value === '' || this.value === 'yes' ? 0 : -1}"
            class="${btnClasses}"
            ?disabled="${this.disabled}"
            ?aria-readonly="${this.readonly}"
            @click="${() => this._select('yes')}"
          >${this.yesLabel}</button>
          <button
            type="button"
            role="radio"
            aria-checked="${this.value === 'no' ? 'true' : 'false'}"
            tabindex="${this.value === 'no' ? 0 : -1}"
            class="${btnClasses}"
            ?disabled="${this.disabled}"
            ?aria-readonly="${this.readonly}"
            @click="${() => this._select('no')}"
          >${this.noLabel}</button>
          ${this.unsureLabel ? html`
            <button
              type="button"
              role="radio"
              aria-checked="${this.value === this.unsureValue ? 'true' : 'false'}"
              tabindex="${this.value === this.unsureValue ? 0 : -1}"
              class="${btnClasses}"
              ?disabled="${this.disabled}"
              ?aria-readonly="${this.readonly}"
              @click="${() => this._select(this.unsureValue)}"
            >${this.unsureLabel}</button>
          ` : nothing}
        </div>
      </fieldset>
    `;
  }

  private _select(val: string): void {
    if (this.disabled || this.readonly) return;
    if (this.value === val) return;

    this.value = val;
    this.updateFormValue(this.value);
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (this.disabled || this.readonly) return;

    const options = this._options;
    const currentIndex = this.value ? options.indexOf(this.value) : 0;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (target.getAttribute('role') === 'radio') {
        const buttons = this._getButtons();
        const btnIndex = buttons.indexOf(target as HTMLButtonElement);
        if (btnIndex >= 0 && target.getAttribute('aria-checked') !== 'true') {
          this._select(options[btnIndex]);
        }
      }
      return;
    }

    const nextIndex = resolveGroupNavIndex(e.key, currentIndex, options.length, isRtl(this));

    if (nextIndex !== undefined) {
      e.preventDefault();
      const val = options[nextIndex];
      this._select(val);
      const buttons = this._getButtons();
      buttons[nextIndex]?.focus();
      const labels = [this.yesLabel, this.noLabel, ...(this.unsureLabel ? [this.unsureLabel] : [])];
      this.announce(labels[nextIndex]);
    }
  }

  private _getButtons(): HTMLButtonElement[] {
    return Array.from(this.querySelectorAll('button[role="radio"]')) as HTMLButtonElement[];
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || '');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-yes-no': CivYesNo;
  }
}
