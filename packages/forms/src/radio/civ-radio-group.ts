import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivFormElement, dispatch } from '@civui/core';

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
 */
@customElement('civ-radio-group')
export class CivRadioGroup extends CivFormElement {
  @property({ type: String }) legend = '';
  @property({ type: Boolean, reflect: true }) tile = false;
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  protected override _defaultValue = '';
  private _boundOnChildChange = this._onChildChange.bind(this);
  private _boundOnKeydown = this._onKeydown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.addEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-change', this._boundOnChildChange as EventListener);
    this.removeEventListener('keydown', this._boundOnKeydown as EventListener);
  }

  override firstUpdated(): void {
    this._syncRadioNames();
    this._syncRadioChecked();
    this._syncTabindex();
    this._syncRadioRequired();
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
  }

  override formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
    this._syncRadioDisabled();
  }

  override render() {
    const describedBy = [
      this.hint ? this._hintId : '',
      this.error ? this._errorId : '',
    ]
      .filter(Boolean)
      .join(' ');

    const slotClasses =
      this.orientation === 'horizontal'
        ? 'civ-flex civ-flex-row civ-flex-wrap civ-gap-4'
        : 'civ-flex civ-flex-col civ-gap-1';

    return html`
      <fieldset
        class="civ-border-0 civ-p-0 civ-m-0 civ-mb-4"
        role="radiogroup"
        aria-orientation="${this.orientation}"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required}"
        ?disabled="${this.disabled}"
      >
        ${this.legend
          ? html`
              <legend class="civ-block civ-mb-1 civ-text-base-darkest civ-font-bold civ-text-base">
                ${this.legend}
                ${this.required
                  ? html`<abbr class="civ-text-error civ-no-underline" title="required">*</abbr>`
                  : nothing}
              </legend>
            `
          : nothing}
        ${this.hint
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-base" id="${this._hintId}">${this.hint}</span>`
          : nothing}
        ${this.error
          ? html`<span class="civ-block civ-mb-2 civ-text-sm civ-text-error civ-font-bold" id="${this._errorId}" role="alert">${this.error}</span>`
          : nothing}
        <div class="${slotClasses}">
          <slot></slot>
        </div>
      </fieldset>
    `;
  }

  private _getRadios(): Element[] {
    return Array.from(this.querySelectorAll('civ-radio'));
  }

  private _getEnabledRadios(): Element[] {
    return this._getRadios().filter((r: any) => !r.disabled);
  }

  private _syncRadioNames(): void {
    if (!this.name) return;
    this._getRadios().forEach((radio: any) => {
      radio.name = this.name;
      radio.disableAnalytics = true;
    });
  }

  private _syncRadioChecked(): void {
    this._getRadios().forEach((radio: any) => {
      radio.checked = radio.value === this.value;
    });
  }

  private _syncRadioError(): void {
    const hasError = !!this.error;
    this._getRadios().forEach((radio: any) => {
      radio.error = hasError ? this.error : '';
    });
  }

  private _syncRadioDisabled(): void {
    if (!this.disabled) return;
    this._getRadios().forEach((radio: any) => {
      radio.disabled = true;
    });
  }

  private _syncRadioRequired(): void {
    this._getRadios().forEach((radio: any) => {
      radio.required = this.required;
    });
  }

  private _syncTabindex(): void {
    const radios = this._getRadios();
    const checkedRadio = radios.find((r: any) => r.checked);
    const enabledRadios = radios.filter((r: any) => !r.disabled);
    const focusTarget = checkedRadio || enabledRadios[0];

    radios.forEach((radio: any) => {
      radio.managedTabIndex = radio === focusTarget ? 0 : -1;
    });
  }

  private _onChildChange(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (!detail?.value) return;

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

    const currentIndex = radios.findIndex((r: any) => r.checked);

    let nextIndex: number | undefined;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex < radios.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : radios.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = radios.length - 1;
        break;
    }

    if (nextIndex !== undefined) {
      const radio = radios[nextIndex] as any;
      radio.checked = true;
      this.value = radio.value;
      this.updateFormValue(this.value);
      this._syncRadioChecked();
      this._syncTabindex();

      // Focus the input inside the radio
      const input = radio.querySelector('input[type="radio"]') as HTMLInputElement | null;
      if (input) input.focus();

      dispatch(this, 'civ-input', { value: this.value });
      dispatch(this, 'civ-change', { value: this.value });
      this.sendAnalytics('change');
    }
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
