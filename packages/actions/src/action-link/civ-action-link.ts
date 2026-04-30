import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';
import '@civui/navigation/link';

export type ActionLinkType = 'phone' | 'email' | 'download';

/**
 * CivUI Action Link
 *
 * A link that triggers a device action (phone call or email compose)
 * rather than navigating to a page. Renders the correct protocol,
 * icon, and formatted display text based on the `type` prop.
 *
 * @element civ-action-link
 *
 * @prop {'phone' | 'email' | 'download'} type - The action type
 * @prop {string} number - Phone number (used when type="phone")
 * @prop {string} address - Email address (used when type="email")
 * @prop {string} subject - Pre-filled email subject (used when type="email")
 * @prop {string} href - File URL (used when type="download")
 * @prop {string} filename - Suggested download filename (used when type="download")
 * @prop {string} fileSize - Display file size e.g. "2.4 MB" (used when type="download")
 * @prop {string} label - Override display text
 *
 * @fires civ-analytics - Analytics tracking event on click
 *
 * @example
 * ```html
 * <civ-action-link type="phone" number="800-555-1234"></civ-action-link>
 * <civ-action-link type="email" address="help@va.gov"></civ-action-link>
 * <civ-action-link type="download" href="/forms/10-10EZ.pdf" label="VA Form 10-10EZ" file-size="1.2 MB"></civ-action-link>
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

  /** File URL. Used when type="download". */
  @property({ type: String }) href = '';

  /** Suggested download filename. Used when type="download". */
  @property({ type: String }) filename = '';

  /** Human-readable file size displayed after link text. Used when type="download". */
  @property({ type: String, attribute: 'file-size' }) fileSize = '';

  /** Override display text. Defaults to formatted number, email address, or filename. */
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
    if (this.type === 'download') {
      return this.href;
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
    if (this.type === 'download') {
      return this.filename || this.href;
    }
    return '';
  }

  /** Icon based on type. */
  private get _icon(): string {
    if (this.type === 'phone') return 'phone';
    if (this.type === 'email') return 'mail';
    return 'download';
  }

  override render() {
    const isDownload = this.type === 'download';

    return html`
      <civ-link
        label="${this._displayText}"
        href="${this._href}"
        icon-start="${this._icon}"
        download="${isDownload ? (this.filename || '') : nothing}"
        ?disabled="${this.disabled}"
      ></civ-link>${isDownload && this.fileSize ? html`<span class="civ-text-sm civ-text-base civ-ms-1">(${this.fileSize})</span>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-action-link': CivActionLink;
  }
}
