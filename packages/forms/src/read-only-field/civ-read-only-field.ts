import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

/**
 * CivUI Read-Only Field
 *
 * Displays a label and value in read-only mode. The reusable data row
 * used across the design system: in summary sections, task previews,
 * profile cards, and standalone read-only displays.
 *
 * @element civ-read-only-field
 *
 * @prop {string} label - Field label
 * @prop {string} value - Display value (or set values for multi-line)
 * @prop {string} hint - Optional hint below the value
 * @prop {string} source - Data source annotation ('profile' shows tag)
 * @prop {string} actionLabel - Inline action link text
 * @prop {string} actionHref - Inline action link destination
 *
 * @example
 * ```html
 * <civ-read-only-field label="Name" value="Jane M. Doe"></civ-read-only-field>
 * <civ-read-only-field label="SSN" value="●●●-●●-6789" source="profile"></civ-read-only-field>
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

  /** Optional hint below the value. */
  @property({ type: String }) hint = '';

  /** Data source. When 'profile', shows a "From your profile" tag. */
  @property({ type: String }) source: 'profile' | 'user' | 'api' | '' = '';

  /** Inline action link label (e.g., "Choose one"). */
  @property({ type: String, attribute: 'action-label' }) actionLabel = '';

  /** Inline action link destination. */
  @property({ type: String, attribute: 'action-href' }) actionHref = '';

  override render() {
    const displayLabel = this.label || t('readOnlyLabel');
    const hasValue = this.values.length > 0 || Boolean(this.value);

    return html`
      <div class="civ-read-only-field civ-mb-4">
        <dt class="civ-label civ-text-muted">${displayLabel}</dt>
        <dd class="civ-text-base civ-font-medium civ-mt-0.5 civ-ms-0">
          ${hasValue
            ? this.values.length > 0
              ? this.values.map(v => html`<span class="civ-block">${v}</span>`)
              : this.value
            : html`<span class="civ-text-muted civ-italic">${t('summaryNotProvided')}</span>`}
          ${this.source === 'profile'
            ? html`<civ-tag label="${t('summarySourceProfile')}" variant="gray" tag-style="secondary" class="civ-ms-1"></civ-tag>`
            : nothing}
          ${this.actionLabel && this.actionHref
            ? html`<a href="${this.actionHref}" class="civ-link civ-text-sm civ-ms-2">${this.actionLabel}</a>`
            : nothing}
        </dd>
        ${this.hint ? html`
          <span class="civ-hint civ-text-sm civ-text-muted civ-block civ-mt-0.5">${this.hint}</span>
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
