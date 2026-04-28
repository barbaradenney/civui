import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { LightDomSlotMixin } from '../base/light-dom-mixins.js';
import type { SlotConfig } from '../base/light-dom-mixins.js';
import { renderLabel, renderFormHeader, buildDescribedBy } from '../templates/form-templates.js';

const NATIVE_INPUT_SELECTOR = 'input, select, textarea, button[role="switch"]';
const CIV_CONTROL_SELECTOR = '[data-civ-form-field]';

/**
 * CivUI FormField
 *
 * Wrapper that provides label, hint, and error rendering for a single
 * form control. Automatically wires ARIA attributes to the child input
 * and cascades `required` / `disabled` to the child CivUI component.
 *
 * Every form control should be wrapped in a `<civ-form-field>`:
 *
 * ```html
 * <civ-form-field label="Email address" hint="We'll never share this" required>
 *   <civ-text-input type="email" name="email"></civ-text-input>
 * </civ-form-field>
 * ```
 *
 * @element civ-form-field
 */
@customElement('civ-form-field')
export class CivFormField extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-form-field-content]' };
  }

  @property({ type: String }) label = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, attribute: 'required-message' }) requiredMessage = '';

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override firstUpdated(): void {
    this._relocateSlots();
    // Re-render so the label's `for` attribute picks up the child input's ID
    // (not available during the initial render before slot relocation).
    this.requestUpdate();
  }

  override updated(_changed: Map<string, unknown>): void {
    super.updated(_changed);
    // Wire ARIA and cascade props after every render — the child may not be
    // available until after slot relocation completes in the second render.
    this._wireChild();
  }

  /**
   * Wire ARIA attributes to the child's native input and cascade
   * props to the child CivUI component.
   */
  private _wireChild(): void {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    // Wire ARIA to the native input element
    const input = this.querySelector(NATIVE_INPUT_SELECTOR) as HTMLElement | null;
    if (input) {
      if (describedBy) {
        input.setAttribute('aria-describedby', describedBy);
      } else {
        input.removeAttribute('aria-describedby');
      }

      if (this.error) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }

      if (this.required) {
        input.setAttribute('aria-required', 'true');
      } else {
        input.removeAttribute('aria-required');
      }
    }

    // Cascade props to the child CivUI component
    const control = this.querySelector(CIV_CONTROL_SELECTOR) as any;
    if (control) {
      control.label = this.label;
      control.hint = this.hint;
      control.error = this.error;
      control.required = this.required;
      control.disabled = this.disabled;
      if (this.requiredMessage) {
        control.requiredMessage = this.requiredMessage;
      }
    }
  }

  /** Get the native input's ID for the label `for` attribute. */
  private get _inputId(): string {
    const input = this.querySelector(NATIVE_INPUT_SELECTOR) as HTMLElement | null;
    return input?.id || '';
  }

  override render() {
    return html`
      <div class="civ-mb-4">
        ${renderFormHeader({
          label: renderLabel({
            label: this.label,
            inputId: this._inputId,
            required: this.required,
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
        })}
        <div data-civ-form-field-content></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-field': CivFormField;
  }
}
