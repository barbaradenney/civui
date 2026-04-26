import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';
import '../link/civ-link.js';

/**
 * CivUI Email Link
 *
 * A clickable email address link with `mailto:` protocol and mail icon.
 *
 * @element civ-email-link
 *
 * @prop {string} address - The email address
 * @prop {string} label - Override display text (defaults to the address)
 * @prop {string} subject - Pre-filled email subject line
 *
 * @example
 * ```html
 * <civ-email-link address="help@va.gov"></civ-email-link>
 * <civ-email-link address="help@va.gov" label="Email us" subject="Benefits question"></civ-email-link>
 * ```
 */
@customElement('civ-email-link')
export class CivEmailLink extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) address = '';
  @property({ type: String }) label = '';
  @property({ type: String }) subject = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  private get _mailtoHref(): string {
    if (!this.address) return '';
    const params = this.subject ? `?subject=${encodeURIComponent(this.subject)}` : '';
    return `mailto:${this.address}${params}`;
  }

  override render() {
    const text = this.label || this.address;

    return html`
      <civ-link
        label="${text}"
        href="${this._mailtoHref}"
        icon-start="mail"
        ?disabled="${this.disabled}"
      ></civ-link>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-email-link': CivEmailLink;
  }
}
