import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';
import '@civui/navigation/link';

export type ActionLinkType = 'phone' | 'email';

/**
 * CivUI Action Link
 *
 * A link that triggers a device action (phone call or email compose)
 * rather than navigating to a page. Renders the correct protocol,
 * icon, and formatted display text based on the `type` prop.
 *
 * @element civ-action-link
 *
 * @prop {'phone' | 'email'} type - The action type
 * @prop {string} number - Phone number (used when type="phone")
 * @prop {string} address - Email address (used when type="email")
 * @prop {string} subject - Pre-filled email subject (used when type="email")
 * @prop {string} label - Override display text
 *
 * @fires civ-analytics - Analytics tracking event on click
 *
 * @example
 * ```html
 * <civ-action-link type="phone" number="800-555-1234"></civ-action-link>
 * <civ-action-link type="email" address="help@va.gov"></civ-action-link>
 * ```
 */
@customElement('civ-action-link')
export class CivActionLink extends LightDomTextMixin(CivBaseElement) {
  /** The action type — determines protocol, icon, and formatting. */
  @property({ type: String }) type: ActionLinkType = 'phone';

  /** Phone number — digits, dashes, spaces, parens, and + allowed. Used when type="phone". */
  @property({ type: String }) number = '';

  /** Email address. Used when type="email". */
  @property({ type: String }) address = '';

  /** Pre-filled email subject line. Used when type="email". */
  @property({ type: String }) subject = '';

  /** Override display text. Defaults to formatted number or email address. */
  @property({ type: String }) label = '';

  /** Disabled state. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Build the href based on type. */
  private get _href(): string {
    if (this.type === 'phone') {
      const digits = this.number.replace(/[^\d+]/g, '');
      return digits ? `tel:${digits}` : '';
    }
    if (this.type === 'email') {
      if (!this.address) return '';
      const params = this.subject ? `?subject=${encodeURIComponent(this.subject)}` : '';
      return `mailto:${this.address}${params}`;
    }
    return '';
  }

  /** Determine the display text. */
  private get _displayText(): string {
    if (this.label) return this.label;
    if (this.type === 'phone') {
      const digits = this.number.replace(/\D/g, '');
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return this.number;
    }
    if (this.type === 'email') {
      return this.address;
    }
    return '';
  }

  /** Icon based on type. */
  private get _icon(): string {
    return this.type === 'phone' ? 'phone' : 'mail';
  }

  override render() {
    return html`
      <civ-link
        label="${this._displayText}"
        href="${this._href}"
        icon-start="${this._icon}"
        ?disabled="${this.disabled}"
      ></civ-link>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-link': CivActionLink;
  }
}
