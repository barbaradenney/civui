import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch, renderLegend, renderHint, renderError, resolveGroupNavIndex, isRtl } from '@civui/core';
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
export class CivRadioGroup extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundStopChildInput = this._stopChildInput.bind(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  private _userChildren: Node[] = [];

  override connectedCallback(): void {
    // Capture authored children before Lit's first render replaces them
    this._userChildren = Array.from(this.childNodes);
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
    if (changed.has('legend')) {
      this.label = this.legend;
    }
  }

  override firstUpdated(): void {
    // Move authored children into the layout container
    const layoutDiv = this.querySelector('.civ-group-layout--vertical, .civ-group-layout--horizontal');
    if (layoutDiv) {
      for (const child of this._userChildren) {
        layoutDiv.appendChild(child);
      }
    }

    this._syncRadioNames();
    if (this.value) {
      this._syncRadioChecked();
    } else {
      // Read initial checked state from children (e.g., set via HTML attribute)
      const checked = this._getRadios().find((r) => r.checked);
      if (checked) this.value = checked.value;
      this._syncRadioChecked();
    }
    this._syncTabindex();
    this._syncRadioRequired();
    this._syncRadioTile();
    this._defaultValue = this.value;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('name')) {
      this._syncRadioNames();
    }
    if (changed.has('value')) {
      this._syncRadioChecked();
      this._syncTabindex();
    }
    if (changed.has('error')) {
      this._syncRadioError();
    }
    if (changed.has('disabled')) {
      this._syncRadioDisabled();
    }
    if (changed.has('required')) {
      this._syncRadioRequired();
    }
    if (changed.has('tile')) {
      this._syncRadioTile();
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

    return html`
      <fieldset
        class="civ-fieldset"
        role="radiogroup"
        aria-orientation="${this.orientation}"
        aria-describedby="${this._ariaDescribedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderLegend({ legend: this.legend, required: this.required })}
        ${renderHint(this._hintId, this.hint, true)}
        ${renderError(this._errorId, this.error, true)}
        <div class="${layoutClass}"></div>
      </fieldset>
    `;
  }

  private _getRadios(): CivRadio[] {
    return Array.from(this.querySelectorAll('civ-radio')) as CivRadio[];
  }

  private _getEnabledRadios(): CivRadio[] {
    return this._getRadios().filter((r) => !r.disabled);
  }

  private _syncRadioNames(): void {
    if (!this.name) return;
    this._getRadios().forEach((radio) => {
      radio.name = this.name;
      radio.disableAnalytics = true;
    });
  }

  private _syncRadioChecked(): void {
    this._getRadios().forEach((radio) => {
      radio.checked = radio.value === this.value;
    });
  }

  private _syncRadioError(): void {
    const hasError = !!this.error;
    this._getRadios().forEach((radio) => {
      radio.error = hasError ? this.error : '';
    });
  }

  private _groupDisabledSet = new WeakSet<Element>();

  private _syncRadioDisabled(): void {
    const radios = this._getRadios();
    if (this.disabled) {
      radios.forEach((radio) => {
        if (!radio.disabled) this._groupDisabledSet.add(radio);
        radio.disabled = true;
      });
    } else {
      radios.forEach((radio) => {
        if (this._groupDisabledSet.has(radio)) {
          radio.disabled = false;
        }
      });
      this._groupDisabledSet = new WeakSet();
    }
  }

  private _syncRadioRequired(): void {
    this._getRadios().forEach((radio) => {
      radio.required = this.required;
    });
  }

  private _syncRadioTile(): void {
    if (!this.tile) return;
    this._getRadios().forEach((radio) => {
      radio.tile = true;
    });
  }

  private _syncTabindex(): void {
    const radios = this._getRadios();
    const checkedRadio = radios.find((r) => r.checked);
    const enabledRadios = radios.filter((r) => !r.disabled);
    const focusTarget =
      checkedRadio && !checkedRadio.disabled
        ? checkedRadio
        : enabledRadios[0];

    radios.forEach((radio) => {
      radio.managedTabIndex = radio === focusTarget ? 0 : -1;
    });
  }

  private _stopChildInput(e: Event): void {
    if (e.target !== this) e.stopPropagation();
  }

  private _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (detail?.value == null) return;

    // Prevent re-dispatch loop — only handle events from child radios
    if (e.target === this) return;

    this.value = detail.value;
    this.updateFormValue(this.value);
    this._syncRadioChecked();
    this._syncTabindex();

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
      this._syncRadioChecked();
      this._syncTabindex();

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
    this.updateFormValue(this.value || '');
  }

  override formResetCallback(): void {
    this.value = this._defaultValue;
    this.error = '';
    this._syncRadioChecked();
    this._syncTabindex();
    this.updateFormValue(this._defaultValue || '');
    dispatch(this, 'civ-reset');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-radio-group': CivRadioGroup;
  }
}
