
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, renderLegend, renderFormHeader, buildDescribedBy } from '@civui/core';
import type { HeadingLevel, LabelSize, SlotConfig } from '@civui/core';

/**
 * CivUI Fieldset
 *
 * Native `<fieldset>` + `<legend>` wrapper for multi-field grouping —
 * several related controls sharing one section heading (e.g. a manually
 * composed address block of street / city / state, where each child input
 * carries its own `label`).
 *
 * The wrapper renders its own legend; children render their own labels.
 * No prop cascade — each child stays the source of truth for its own
 * label / hint / error / required / disabled state. Native `disabled`
 * cascades automatically to all child form controls.
 *
 * **Do not wrap a single input or a self-contained group component
 * (radio-group, checkbox-group, segmented-control, yes-no,
 * memorable-date, date-range-picker) in this** — those already render
 * their own chrome, so you'd get nested fieldsets with double legends.
 * The `lint:fieldsets` CI check enforces this.
 *
 * In Light DOM, `<slot>` does not project children. This component
 * relocates slotted children into the rendered `<fieldset>` in
 * `firstUpdated()` so native disabled cascade works correctly.
 *
 * ```html
 * <civ-fieldset legend="Mailing address">
 *   <civ-text-input label="Street" name="street" required></civ-text-input>
 *   <civ-text-input label="City" name="city" required></civ-text-input>
 *   <civ-select label="State" name="state" preset="us-state" required></civ-select>
 * </civ-fieldset>
 * ```
 *
 * @element civ-fieldset
 */
@customElement('civ-fieldset')
export class CivFieldset extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-fieldset-content]' };
  }

  @property({ type: String }) legend = '';
  @property({ type: String }) hint = '';
  @property({ type: String }) error = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

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
        <div data-civ-fieldset-content></div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-fieldset': CivFieldset;
  }
}
