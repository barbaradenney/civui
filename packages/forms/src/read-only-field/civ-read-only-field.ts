import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

/**
 * CivUI Read-Only Field
 *
 * Displays a label and value in read-only mode. Used for identity-verified
 * data that the user cannot edit (e.g., masked SSN, verified name).
 *
 * @element civ-read-only-field
 *
 * @example
 * ```html
 * <civ-read-only-field
 *   label="Social Security number"
 *   value="●●●-●●-6789"
 * ></civ-read-only-field>
 * ```
 */
@customElement('civ-read-only-field')
export class CivReadOnlyField extends CivBaseElement {
  /** Field label. */
  @property({ type: String }) label = '';

  /** Display value. */
  @property({ type: String }) value = '';

  /** Optional hint below the value. */
  @property({ type: String }) hint = '';

  override render() {
    const displayLabel = this.label || t('readOnlyLabel');

    return html`
      <div class="civ-read-only-field civ-mb-4">
        <dt class="civ-label civ-text-secondary">${displayLabel}</dt>
        <dd class="civ-text-base civ-font-medium civ-mt-0.5 civ-ms-0">
          ${this.value || html`<span class="civ-text-muted civ-italic">Not provided</span>`}
        </dd>
        ${this.hint ? html`
          <span class="civ-hint civ-text-sm civ-text-secondary civ-block civ-mt-0.5">${this.hint}</span>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-read-only-field': CivReadOnlyField;
  }
}
