import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomTextMixin, t } from '@civui/core';
import '../link/civ-link.js';

/**
 * CivUI External Link
 *
 * A link that opens in a new tab with proper security attributes and
 * a screen reader announcement. Renders the external-link icon and
 * appends "(opens in new tab)" for assistive technology.
 *
 * @element civ-external-link
 *
 * @example
 * ```html
 * <civ-external-link href="https://va.gov" label="Visit VA.gov"></civ-external-link>
 * ```
 */
@customElement('civ-external-link')
export class CivExternalLink extends LightDomTextMixin(CivBaseElement) {
  @property({ type: String }) label = '';
  @property({ type: String }) href = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  override render() {
    const text = this.label || this._initialText;

    return html`
      <civ-link
        label="${text}"
        href="${this.href}"
        target="_blank"
        rel="noopener noreferrer"
        icon-end="external-link"
        ?disabled="${this.disabled}"
      ></civ-link>
      <span class="civ-sr-only">${t('externalLinkNewTab')}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-external-link': CivExternalLink;
  }
}
