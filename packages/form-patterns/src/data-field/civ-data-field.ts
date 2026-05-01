import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';
import '@civui/navigation/link';

/**
 * CivUI Data Field
 *
 * Displays a label and value as a single row — label on the left,
 * bold value on the right, with an optional inline edit link.
 * Stacks vertically on mobile (label on top, value below).
 *
 * Renders a self-contained `<dl>` so it can be used standalone
 * or composed inside `civ-summary` sections.
 *
 * @element civ-data-field
 *
 * @prop {string} label - Field label (left side)
 * @prop {string} value - Display value (right side, bold)
 * @prop {string} href - When set, renders the value as a download link
 * @prop {string} editHref - Edit link destination (renders inline edit link)
 * @prop {string} editLabel - Edit link text (default: "Edit")
 * @prop {string} spacing - Vertical padding: 'default' or 'sm'
 *
 * @example
 * ```html
 * <civ-data-field label="Phone" value="(555) 123-4567" edit-href="#/phone"></civ-data-field>
 * <civ-data-field label="DD214" value="discharge-papers.pdf (2.4 MB)" href="/files/dd214.pdf"></civ-data-field>
 * ```
 */
@customElement('civ-data-field')
export class CivDataField extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Array, attribute: false }) values: string[] = [];
  @property({ type: String }) hint = '';

  /** When set, renders the value as a download link. */
  @property({ type: String }) href = '';

  /** Edit link destination. When set, renders an inline edit link. */
  @property({ type: String, attribute: 'edit-href' }) editHref = '';

  /** Edit link text. */
  @property({ type: String, attribute: 'edit-label' }) editLabel = '';

  /** Vertical padding: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  override render() {
    const displayLabel = this.label || t('dataFieldLabel');
    const hasValue = this.values.length > 0 || Boolean(this.value);
    const editText = this.editLabel || t('summaryEditLink');

    return html`
      <dl class="${[
          'civ-data-field',
          this.spacing === 'sm' ? 'civ-data-field--sm civ-py-1' : 'civ-py-2',
        ].filter(Boolean).join(' ')}">
        <dt class="civ-data-field__label">${displayLabel}</dt>
        <dd class="civ-data-field__value">
          <span class="civ-data-field__data">
            ${hasValue
              ? this.values.length > 0
                ? this.values.map(v => html`<span class="civ-block">${v}</span>`)
                : this.href
                  ? html`<civ-link href="${this.href}" label="${this.value}" new-tab></civ-link>`
                  : this.value
              : html`<span class="civ-text-muted civ-italic civ-font-normal">${t('summaryNotProvided')}</span>`}
          </span>
          ${this.editHref
            ? html`<civ-link
                href="${this.editHref}"
                label="${editText}"
                aria-label="${editText} ${displayLabel}"
                variant="tertiary"
                class="civ-data-field__edit"
              ></civ-link>`
            : nothing}
        </dd>
      </dl>
      ${this.hint ? html`
        <span class="civ-hint civ-text-sm civ-text-muted civ-block">${this.hint}</span>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-data-field': CivDataField;
  }
}
