import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

/**
 * CivUI Read-Only Field
 *
 * Displays a label and value as a single row — label on the left,
 * value on the right. The reusable data row used across the design
 * system: in summary sections, task previews, and standalone displays.
 *
 * @element civ-read-only-field
 *
 * @prop {string} label - Field label (left side)
 * @prop {string} value - Display value (right side)
 * @prop {string} hint - Optional hint below the row
 * @prop {string} actionLabel - Inline action link text
 * @prop {string} actionHref - Inline action link destination
 *
 * @example
 * ```html
 * <civ-read-only-field label="Name" value="Jane M. Doe"></civ-read-only-field>
 * ```
 */
@customElement('civ-read-only-field')
export class CivReadOnlyField extends CivBaseElement {
  /** Field label. */
  @property({ type: String }) label = '';

  /** Display value (single line). */
  @property({ type: String }) value = '';

  /** Multiple values (renders each on its own line). Set via JS. */
  @property({ type: Array, attribute: false }) values: string[] = [];

  /** Optional hint below the row. */
  @property({ type: String }) hint = '';

  /** Inline action link label (e.g., "Choose one"). */
  @property({ type: String, attribute: 'action-label' }) actionLabel = '';

  /** Inline action link destination. */
  @property({ type: String, attribute: 'action-href' }) actionHref = '';

  override render() {
    const displayLabel = this.label || t('readOnlyLabel');
    const hasValue = this.values.length > 0 || Boolean(this.value);

    return html`
      <div class="civ-read-only-field civ-flex civ-justify-between civ-items-baseline civ-py-2">
        <dt class="civ-read-only-field__label">${displayLabel}</dt>
        <dd class="civ-read-only-field__value civ-ms-4 civ-text-end">
          ${hasValue
            ? this.values.length > 0
              ? this.values.map(v => html`<span class="civ-block">${v}</span>`)
              : this.value
            : html`<span class="civ-text-muted civ-italic">${t('summaryNotProvided')}</span>`}
          ${this.actionLabel && this.actionHref
            ? html`<civ-link href="${this.actionHref}" label="${this.actionLabel}" variant="tertiary" class="civ-ms-2"></civ-link>`
            : nothing}
        </dd>
      </div>
      ${this.hint ? html`
        <span class="civ-hint civ-text-sm civ-text-muted civ-block">${this.hint}</span>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-read-only-field': CivReadOnlyField;
  }
}
