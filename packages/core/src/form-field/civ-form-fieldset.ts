import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '../base/civ-base-element.js';
import { LightDomSlotMixin } from '../base/light-dom-mixins.js';
import type { SlotConfig } from '../base/light-dom-mixins.js';
import { renderLegend, renderFormHeader, buildDescribedBy } from '../templates/form-templates.js';
import type { HeadingLevel, LabelSize } from '../templates/form-templates.js';
import type { FormControlLike } from '../types/sub-components.js';

const CIV_CONTROL_SELECTOR = '[data-civ-form-field]';

/**
 * CivUI FormFieldset
 *
 * Wrapper that provides fieldset + legend + hint + error rendering for
 * Use this for genuine multi-field grouping — putting one section
 * heading over several controls (e.g. an address with street/city/state).
 * Cascades `required` / `disabled` to the child CivUI component.
 *
 * The six self-contained group components (radio-group, checkbox-group,
 * segmented-control, yes-no, memorable-date, date-range-picker) render
 * their own legend / hint / error from a `legend` prop and should NOT
 * be wrapped in this — pass `legend` directly on the component.
 *
 * ```html
 * <civ-form-fieldset legend="Mailing address" required>
 *   <civ-form-field label="Street"><civ-text-input name="street" required></civ-text-input></civ-form-field>
 *   <civ-form-field label="City"><civ-text-input name="city" required></civ-text-input></civ-form-field>
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

  /**
   * Promote the legend to a heading via `role="heading"` + `aria-level=N` so
   * screen-reader users can navigate to it by heading. Use sparingly —
   * typically only for the primary question on a single-question page
   * (level 1) or the top legend inside a form-step (level 2 or 3). Leave
   * unset for inline legends.
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the legend. Default (omitted) and `sm` render at body
   * size; `md`/`lg`/`xl` step up through the typography scale for use as a
   * section/page heading. Heads up: at `[data-civ-scale="fluid"]`, `xl`
   * renders very large (clamp up to ~2.6rem) — only use it when the legend
   * is the page's primary heading.
   */
  @property({ type: String }) size?: LabelSize;

  /**
   * Pull the hint visually flush with the controls below it by removing the
   * default 16px gap under group hints. Useful for compact compounds where
   * the legend + hint should read as one stacked header (e.g. the OMB race
   * group's "Race / Select one or more"). Renders as `tight-hint` attribute
   * for CSS targeting.
   */
  @property({ type: Boolean, attribute: 'tight-hint', reflect: true }) tightHint = false;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  private _boundOnChildErrorChange = this._onChildErrorChange.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    // Mirror child-internal error state (e.g. memorable-date rejecting an
    // invalid date) up so the visible error text re-renders.
    this.addEventListener('civ-error-change', this._boundOnChildErrorChange as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('civ-error-change', this._boundOnChildErrorChange as EventListener);
  }

  private _onChildErrorChange(e: CustomEvent<{ error: string }>): void {
    if (e.target === this) return;
    if (e.detail.error === this.error) return;
    this.error = e.detail.error;
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // Re-render so legend / inner controls bind to the relocated children.
    // Lit warns ("scheduled an update after an update completed") — we
    // accept it; deferring via queueMicrotask resolves after consumers'
    // `await el.updateComplete`, leaving them reading a half-bound DOM.
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
    const control = this.querySelector(CIV_CONTROL_SELECTOR) as FormControlLike | null;
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
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({
          label: renderLegend({
            legend: this.legend,
            required: this.required,
            headingLevel: this.headingLevel,
            size: this.size,
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
