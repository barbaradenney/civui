import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { LightDomSlotMixin } from '../base/light-dom-mixins.js';
import type { SlotConfig } from '../base/light-dom-mixins.js';
import { renderLegend, renderFormHeader, buildDescribedBy } from '../templates/form-templates.js';

const CIV_CONTROL_SELECTOR = '[data-civ-form-field]';

/**
 * CivUI FormFieldset
 *
 * Wrapper that provides fieldset + legend + hint + error rendering for
 * group controls (radio-group, checkbox-group, segmented-control, etc.).
 * Cascades `required` / `disabled` to the child CivUI component.
 *
 * ```html
 * <civ-form-fieldset legend="Preferred contact method" required>
 *   <civ-radio-group name="contact">
 *     <civ-radio value="email" label="Email"></civ-radio>
 *     <civ-radio value="phone" label="Phone"></civ-radio>
 *   </civ-radio-group>
 * </civ-form-fieldset>
 * ```
 *
 * @element civ-form-fieldset
 */
@customElement('civ-form-fieldset')
export class CivFormFieldset extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-form-fieldset-content]' };
  }

  @property({ type: String }) legend = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, attribute: 'required-message' }) requiredMessage = '';

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');

  override firstUpdated(): void {
    this._relocateSlots();
    this.requestUpdate();
  }

  override updated(_changed: Map<string, unknown>): void {
    super.updated(_changed);
    this._wireChild();
  }

  /**
   * Cascade props to the child CivUI component.
   */
  private _wireChild(): void {
    const control = this.querySelector(CIV_CONTROL_SELECTOR) as any;
    if (control) {
      control.label = this.legend;
      control.hint = this.hint;
      control.error = this.error;
      control.required = this.required;
      control.disabled = this.disabled;
      if (this.requiredMessage) {
        control.requiredMessage = this.requiredMessage;
      }
    }
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        aria-required="${this.required || nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({
          label: renderLegend({
            legend: this.legend,
            required: this.required,
            textSizeClass: '',
          }),
          hintId: this._hintId,
          hint: this.hint,
          errorId: this._errorId,
          error: this.error,
          fieldset: true,
        })}
        <div data-civ-form-fieldset-content></div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-form-fieldset': CivFormFieldset;
  }
}
