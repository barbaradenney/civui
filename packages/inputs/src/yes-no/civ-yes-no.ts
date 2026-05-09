import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, buildDescribedBy, resolveGroupNavIndex, isRtl, renderFormHeader, renderLegend } from '@civui/core';
import type { HeadingLevel, LabelSize } from '@civui/core';

/**
 * CivUI Yes/No
 *
 * Self-contained boolean question component for yes/no questions in
 * government forms. Renders as a fieldset with two styled buttons
 * (Yes / No). Uses ElementInternals for form participation.
 *
 * Renders its own legend / hint / error — do **not** wrap in
 * `<civ-form-fieldset>` (you'd get nested fieldsets with double
 * legends). Use the `legend` prop directly on the component.
 *
 * @element civ-yes-no
 *
 * @prop {string} legend - Question text rendered as <legend>
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
  /** Question text rendered as the fieldset legend. */
  @property({ type: String }) legend = '';

  /** Promote the legend to a heading via `role="heading"` + `aria-level=N`. */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /** Visual size of the legend. */
  @property({ type: String }) size?: LabelSize;

  @property({ type: String, attribute: 'yes-label' }) yesLabel = 'Yes';
  @property({ type: String, attribute: 'no-label' }) noLabel = 'No';
  @property({ type: String, attribute: 'unsure-label' }) unsureLabel = '';
  @property({ type: String, attribute: 'unsure-value' }) unsureValue = 'unsure';

  /**
   * When non-empty, renders a "Prefer not to answer" affordance below the
   * main Yes/No row. Distinct from `unsureLabel` which expresses uncertainty
   * — `skipLabel` expresses opting out. Sets `value` to `skipValue` and fires
   * civ-input / civ-change. Kept outside the radiogroup so it isn't confused
   * with a normal choice.
   */
  @property({ type: String, attribute: 'skip-label' }) skipLabel = '';

  /** Form value used when the skip affordance is selected. */
  @property({ type: String, attribute: 'skip-value' }) skipValue = 'skip';

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

    const btnClasses = 'civ-btn civ-btn--yesno';

    // The radiogroup role lives on the inner div so the optional skip
    // affordance (which is a toggle-button, not a radio) can sit alongside
    // the radio choices inside the fieldset without becoming part of the
    // mutually-exclusive group.
    const inner = html`
      <div
        class="civ-flex civ-gap-2"
        role="radiogroup"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
      >
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
      ${this.skipLabel
        ? html`
            <button
              type="button"
              class="civ-yes-no__skip civ-btn--link"
              aria-pressed="${this.value === this.skipValue ? 'true' : 'false'}"
              data-civ-skip
              ?disabled="${this.disabled}"
              @click="${() => this._selectSkip()}"
            >${this.skipLabel}</button>
          `
        : nothing}
    `;

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${this.legend
          ? renderFormHeader({
              label: renderLegend({ legend: this.legend, required: this.required, headingLevel: this.headingLevel, size: this.size }),
              hintId: this._hintId,
              hint: this.hint,
              errorId: this._errorId,
              error: this.error,
              fieldset: true,
            })
          : nothing}
        ${inner}
      </fieldset>
    `;
  }

  private _selectSkip(): void {
    if (this.disabled || this.readonly) return;
    if (this.value === this.skipValue) return;
    this.value = this.skipValue;
    this.updateFormValue(this.value);
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change', { skipped: true });
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

    const target = e.target as HTMLElement;
    const isRadioTarget = target.getAttribute('role') === 'radio';

    const options = this._options;
    const currentIndex = this.value ? options.indexOf(this.value) : 0;

    if (e.key === ' ' || e.key === 'Enter') {
      // Only preempt native button activation when the target is a radio —
      // lets the skip affordance keep its default space/enter click behavior.
      if (!isRadioTarget) return;
      e.preventDefault();
      const buttons = this._getButtons();
      const btnIndex = buttons.indexOf(target as HTMLButtonElement);
      if (btnIndex >= 0 && target.getAttribute('aria-checked') !== 'true') {
        this._select(options[btnIndex]);
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
