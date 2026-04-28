import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, LightDomSlotMixin, dispatch, resolveGroupNavIndex, isRtl, syncGroupDisabled, stopChildEvent, syncLegendToLabel } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivRadio } from './civ-radio.js';

/**
 * CivUI Radio Group
 *
 * Groups multiple civ-radio elements with mutual exclusivity,
 * a shared legend, hint, and error message using a native fieldset.
 * Uses ElementInternals for form participation.
 * Implements WAI-ARIA Radio Group pattern with roving tabindex.
 *
 * @element civ-radio-group
 *
 * @prop {string} legend - Group legend text
 * @prop {string} name - Shared form field name for all radios
 * @prop {string} value - Currently selected value
 * @prop {string} hint - Hint text displayed below legend
 * @prop {string} error - Error message for the group
 * @prop {boolean} tile - Apply tile variant to all child radios
 * @prop {boolean} required - Whether a selection is required
 * @prop {'vertical' | 'horizontal'} orientation - Layout direction
 *
 * @fires civ-change - When the selected value changes, detail: { value }
 * @fires civ-input - When the selected value changes (input event), detail: { value }
 * @fires civ-reset - When the form is reset
 * @fires civ-analytics - Analytics tracking event on change
 */
@customElement('civ-radio-group')
export class CivRadioGroup extends LightDomSlotMixin(CivFormElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '.civ-group-layout--vertical, .civ-group-layout--horizontal' };
  }

  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  /**
   * When non-empty, renders a "Prefer not to answer" affordance below the
   * radio group. Selecting it sets `value` to `skipValue` (default: `'skip'`)
   * and fires the same civ-input / civ-change events as a radio selection.
   * Kept outside the roving tabindex so it isn't confused with a normal choice.
   */
  @property({ type: String, attribute: 'skip-label' }) skipLabel = '';

  /** Form value used when the skip affordance is selected. */
  @property({ type: String, attribute: 'skip-value' }) skipValue = 'skip';

  /** Legend ID — referenced by the inner radiogroup's `aria-labelledby`. */
  private _legendId = this.generateId('radio-group-legend');

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundStopChildInput = stopChildEvent(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.addEventListener('civ-input', this._boundStopChildInput as EventListener);
    this.addEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.removeEventListener('civ-input', this._boundStopChildInput as EventListener);
    this.removeEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    super.willUpdate(changed);
    syncLegendToLabel(this, changed);
  }

  override firstUpdated(): void {
    this._relocateSlots();

    const radios = this._getRadios();
    this._syncRadioNames(radios);
    if (this.value) {
      this._syncRadioChecked(radios);
    } else {
      // Read initial checked state from children (e.g., set via HTML attribute)
      const checked = radios.find((r) => r.checked);
      if (checked) this.value = checked.value;
      this._syncRadioChecked(radios);
    }
    this._syncTabindex(radios);
    this._syncRadioRequired(radios);
    this._syncRadioTile(radios);
    this._defaultValue = this.value;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    const needsRadios =
      changed.has('name') || changed.has('value') ||
      changed.has('disabled') || changed.has('required') || changed.has('tile');
    const radios = needsRadios ? this._getRadios() : undefined;

    if (changed.has('name')) {
      this._syncRadioNames(radios);
    }
    if (changed.has('value')) {
      this._syncRadioChecked(radios);
      this._syncTabindex(radios);
    }
    if (changed.has('disabled')) {
      this._syncRadioDisabled(radios);
    }
    if (changed.has('required')) {
      this._syncRadioRequired(radios);
    }
    if (changed.has('tile')) {
      this._syncRadioTile(radios);
    }
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
    this._syncRadioDisabled();
  }

  override render() {
    const layoutClass =
      this.orientation === 'horizontal'
        ? 'civ-group-layout--horizontal'
        : 'civ-group-layout--vertical';

    // The radiogroup role lives on the inner div so the optional skip
    // affordance (a toggle-button, not a radio) can sit alongside the radio
    // choices inside the fieldset without joining the mutually-exclusive
    // group.
    return html`
        <div
          class="${layoutClass}"
          role="radiogroup"
          aria-labelledby="${this.legend ? this._legendId : nothing}"
          aria-orientation="${this.orientation}"
          aria-describedby="${this._ariaDescribedBy || nothing}"
          aria-invalid="${this.error ? 'true' : nothing}"
          aria-required="${this.required || nothing}"
        ></div>
        ${this.skipLabel
          ? html`
              <button
                type="button"
                class="civ-radio-group__skip civ-btn--link focus-visible:civ-focus-ring"
                aria-pressed="${this.value === this.skipValue ? 'true' : 'false'}"
                data-civ-skip
                ?disabled="${this.disabled}"
                @click="${this._onSkipClick}"
              >${this.skipLabel}</button>
            `
          : nothing}
    `;
  }

  private _onSkipClick(): void {
    if (this.disabled) return;
    if (this.value === this.skipValue) return;

    // Uncheck any currently checked radio
    const radios = this._getRadios();
    radios.forEach((r) => {
      r.checked = false;
    });
    this._syncTabindex(radios);

    this.value = this.skipValue;
    this.updateFormValue(this.value);
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change', { skipped: true });
  }

  private _getRadios(): CivRadio[] {
    return Array.from(this.querySelectorAll('civ-radio')) as CivRadio[];
  }

  private _getEnabledRadios(): CivRadio[] {
    return this._getRadios().filter((r) => !r.disabled);
  }

  private _syncRadioNames(radios?: CivRadio[]): void {
    if (!this.name) return;
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.name = this.name;
      radio.disableAnalytics = true;
    });
  }

  private _syncRadioChecked(radios?: CivRadio[]): void {
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.checked = radio.value === this.value;
    });
  }

  private _groupDisabledSet = new WeakSet<Element>();

  private _syncRadioDisabled(radios?: CivRadio[]): void {
    this._groupDisabledSet = syncGroupDisabled(radios ?? this._getRadios(), this.disabled, this._groupDisabledSet);
  }

  private _syncRadioRequired(radios?: CivRadio[]): void {
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.required = this.required;
    });
  }

  private _syncRadioTile(radios?: CivRadio[]): void {
    (radios ?? this._getRadios()).forEach((radio) => {
      radio.tile = this.tile;
    });
  }

  private _syncTabindex(radios?: CivRadio[]): void {
    const r = radios ?? this._getRadios();
    const checkedRadio = r.find((radio) => radio.checked);
    const enabledRadios = r.filter((radio) => !radio.disabled);
    const focusTarget =
      checkedRadio && !checkedRadio.disabled
        ? checkedRadio
        : enabledRadios[0];

    r.forEach((item) => {
      item.managedTabIndex = item === focusTarget ? 0 : -1;
    });
  }

  private _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (detail?.value == null) return;

    // Prevent re-dispatch loop — only handle events from child radios
    if (e.target === this) return;

    this.value = detail.value;
    this.updateFormValue(this.value);

    // Stop the child event and re-dispatch from the group
    e.stopPropagation();
    dispatch(this, 'civ-input', { value: this.value });
    dispatch(this, 'civ-change', { value: this.value });
    this.sendAnalytics('change');
  }

  private _onKeydown(e: KeyboardEvent): void {
    const radios = this._getEnabledRadios();
    if (radios.length === 0) return;

    const currentIndex = radios.findIndex((r) => r.checked);
    const nextIndex = resolveGroupNavIndex(e.key, currentIndex, radios.length, isRtl(this));

    if (nextIndex !== undefined) {
      e.preventDefault();
      const radio = radios[nextIndex];
      radio.checked = true;
      this.value = radio.value;
      this.updateFormValue(this.value);

      // Focus the input inside the radio
      const input = radio.querySelector('input[type="radio"]') as HTMLInputElement | null;
      if (input) input.focus();
      this.announce(radio.label);

      dispatch(this, 'civ-input', { value: this.value });
      dispatch(this, 'civ-change', { value: this.value });
      this.sendAnalytics('change');
    }
  }

  protected override _syncFormValue(): void {
    this.updateFormValue(this.value || null);
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    const radios = this._getRadios();
    this._syncRadioChecked(radios);
    this._syncTabindex(radios);
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-radio-group': CivRadioGroup;
  }
}
