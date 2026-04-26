import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin } from '@civui/core';
import '../link/civ-link.js';

/**
 * CivUI Download Link
 *
 * A link that triggers a file download. Renders a download icon and
 * optionally displays the file size.
 *
 * @element civ-download-link
 *
 * @prop {string} href - URL of the file to download
 * @prop {string} label - Link text
 * @prop {string} filename - Suggested filename for the download
 * @prop {string} fileSize - Display file size (e.g., "2.4 MB")
 *
 * @example
 * ```html
 * <civ-download-link href="/forms/10-10EZ.pdf" label="Download VA Form 10-10EZ"
 *   filename="10-10EZ.pdf" file-size="1.2 MB">
 * </civ-download-link>
 * ```
 */
@customElement('civ-download-link')
export class CivDownloadLink extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: String }) filename = '';
  @property({ type: String, attribute: 'file-size' }) fileSize = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  override render() {
    const text = this.label || this._initialText;

    return html`
      <civ-link
        label="${text}"
        href="${this.href}"
        download="${this.filename || ''}"
        icon-start="download"
        ?disabled="${this.disabled}"
      ></civ-link>${this.fileSize ? html`
      <span class="civ-text-sm civ-text-base civ-ms-1">(${this.fileSize})</span>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-download-link': CivDownloadLink;
  }
}
