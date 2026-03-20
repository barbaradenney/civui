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
 * @prop {string} value - Currently selected value ('yes' | 'no' | '')
 * @prop {string} yesLabel - Label for the Yes button (default: 'Yes')
 * @prop {string} noLabel - Label for the No button (default: 'No')
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

  protected override _defaultValue = '';
  private _boundOnKeydown = this._onKeydown.bind(this);

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

    const yesSelected = this.value === 'yes';
    const noSelected = this.value === 'no';

    const yesClasses = [
      'civ-btn',
      yesSelected ? 'civ-bg-primary civ-text-white civ-border-primary' : 'civ-bg-white civ-border-base-light',
      'focus-visible:civ-focus-ring',
    ].join(' ');

    const noClasses = [
      'civ-btn',
      noSelected ? 'civ-bg-primary civ-text-white civ-border-primary' : 'civ-bg-white civ-border-base-light',
      'focus-visible:civ-focus-ring',
    ].join(' ');

    const yesTabindex = this.value === '' || this.value === 'yes' ? 0 : -1;
    const noTabindex = this.value === 'no' ? 0 : -1;

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
            aria-checked="${yesSelected ? 'true' : 'false'}"
            tabindex="${yesTabindex}"
            class="${yesClasses}"
            ?disabled="${this.disabled}"
            ?aria-readonly="${this.readonly}"
            @click="${() => this._select('yes')}"
          >${this.yesLabel}</button>
          <button
            type="button"
            role="radio"
            aria-checked="${noSelected ? 'true' : 'false'}"
            tabindex="${noTabindex}"
            class="${noClasses}"
            ?disabled="${this.disabled}"
            ?aria-readonly="${this.readonly}"
            @click="${() => this._select('no')}"
          >${this.noLabel}</button>
        </div>
      </fieldset>
    `;
  }

  private _select(val: 'yes' | 'no'): void {
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

    const options: ('yes' | 'no')[] = ['yes', 'no'];
    const currentIndex = this.value ? options.indexOf(this.value as 'yes' | 'no') : 0;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (target.getAttribute('role') === 'radio') {
        const val = target.getAttribute('aria-checked') !== 'true'
          ? (options[target === this._getButtons()[0] ? 0 : 1])
          : undefined;
        if (val !== undefined) {
          this._select(val);
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
      this.announce(nextIndex === 0 ? this.yesLabel : this.noLabel);
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
