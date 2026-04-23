import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

/**
 * CivUI Read-Only Field
 *
 * Displays a label and value as a single row — label on the left,
 * bold value on the right, with an optional inline edit link.
 * Stacks vertically on mobile (label on top, value below).
 *
 * Renders a self-contained `<dl>` so it can be used standalone
 * or composed inside `civ-summary` sections.
 *
 * @element civ-read-only-field
 *
 * @prop {string} label - Field label (left side)
 * @prop {string} value - Display value (right side, bold)
 * @prop {string} editHref - Edit link destination (renders inline edit link)
 * @prop {string} editLabel - Edit link text (default: "Edit")
 *
 * @example
 * ```html
 * <civ-read-only-field label="Phone" value="(555) 123-4567" edit-href="#/phone"></civ-read-only-field>
 * ```
 */
@customElement('civ-read-only-field')
export class CivReadOnlyField extends CivBaseElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Array, attribute: false }) values: string[] = [];
  @property({ type: String }) hint = '';

  /** Edit link destination. When set, renders an inline edit link. */
  @property({ type: String, attribute: 'edit-href' }) editHref = '';

  /** Edit link text. */
  @property({ type: String, attribute: 'edit-label' }) editLabel = '';

  override render() {
    const displayLabel = this.label || t('readOnlyLabel');
    const hasValue = this.values.length > 0 || Boolean(this.value);
    const editText = this.editLabel || t('summaryEditLink');

    return html`
      <dl class="civ-read-only-field civ-py-2">
        <dt class="civ-read-only-field__label">${displayLabel}</dt>
        <dd class="civ-read-only-field__value">
          <span class="civ-read-only-field__data">
            ${hasValue
              ? this.values.length > 0
                ? this.values.map(v => html`<span class="civ-block">${v}</span>`)
                : this.value
              : html`<span class="civ-text-muted civ-italic civ-font-normal">${t('summaryNotProvided')}</span>`}
          </span>
          ${this.editHref
            ? html`<civ-link
                href="${this.editHref}"
                label="${editText}"
                aria-label="${editText} ${displayLabel}"
                variant="tertiary"
                class="civ-read-only-field__edit"
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
    'civ-read-only-field': CivReadOnlyField;
  }
}
