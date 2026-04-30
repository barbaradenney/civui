import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';
import '@civui/navigation/link';

/**
 * CivUI Phone Link
 *
 * A clickable phone number link with `tel:` protocol, phone icon,
 * and properly formatted display text.
 *
 * @element civ-phone-link
 *
 * @prop {string} number - The phone number (digits, dashes, spaces allowed)
 * @prop {string} label - Override display text (defaults to formatted number)
 *
 * @example
 * ```html
 * <civ-phone-link number="800-555-1234"></civ-phone-link>
 * <civ-phone-link number="8005551234" label="Call us"></civ-phone-link>
 * ```
 */
@customElement('civ-phone-link')
export class CivPhoneLink extends LightDomTextMixin(CivBaseElement) {
  /** Phone number — digits, dashes, spaces, parens, and + allowed. */
  @property({ type: String }) number = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Strip to digits and optional leading + for the tel: URI. */
  private get _telHref(): string {
    const digits = this.number.replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : '';
  }

  /** Format for display: if 10 digits, show (XXX) XXX-XXXX. */
  private get _displayText(): string {
    if (this.label) return this.label;
    const digits = this.number.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return this.number;
  }

  override render() {
    return html`
      <civ-link
        label="${this._displayText}"
        href="${this._telHref}"
        icon-start="phone"
        ?disabled="${this.disabled}"
      ></civ-link>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-phone-link': CivPhoneLink;
  }
}
