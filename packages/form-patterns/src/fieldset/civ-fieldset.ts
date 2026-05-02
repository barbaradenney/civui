// Schema: packages/schema/src/components/civ-fieldset.schema.ts

import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, renderLegend, renderFormHeader, buildDescribedBy } from '@civui/core';
import type { HeadingLevel, LabelSize, SlotConfig } from '@civui/core';

/**
 * CivUI Fieldset
 *
 * Native fieldset wrapper with legend, hint, and error support.
 * Uses native <fieldset> for automatic disabled cascade to child form elements.
 *
 * In Light DOM, <slot> does not project children. This component
 * moves child elements into the rendered <fieldset> in updated()
 * so that native disabled cascade works correctly.
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
   * Promote the legend to a heading via `role="heading"` + `aria-level=N`.
   * Use sparingly — typically only when this fieldset wraps the primary
   * question on a single-question page (level 1) or the top section inside
   * a form-step (level 2 or 3).
   */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: HeadingLevel;

  /**
   * Visual size of the legend. Default and `sm` render at body size;
   * `md`/`lg`/`xl` increase the size for use as a section/page heading.
   * At `[data-civ-scale="fluid"]`, `xl` renders very large.
   */
  @property({ type: String }) size?: LabelSize;

  private _hintId = this.generateId('hint');
  private _errorId = this.generateId('error');
  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const describedBy = buildDescribedBy(this._hintId, this.hint, this._errorId, this.error);

    return html`
      <fieldset
        class="civ-fieldset"
        aria-describedby="${describedBy || nothing}"
        aria-required="${this.required || nothing}"
        aria-invalid="${this.error ? 'true' : nothing}"
        ?disabled="${this.disabled}"
      >
        ${renderFormHeader({ label: renderLegend({ legend: this.legend, required: this.required, headingLevel: this.headingLevel, size: this.size }), hintId: this._hintId, hint: this.hint, errorId: this._errorId, error: this.error, fieldset: true })}
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
