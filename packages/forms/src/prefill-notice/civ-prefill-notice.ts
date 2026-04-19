import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, t } from '@civui/core';

/**
 * CivUI Prefill Notice
 *
 * An informational banner that tells users their form data was
 * prefilled from their profile. Includes optional link to update
 * profile settings.
 *
 * @element civ-prefill-notice
 *
 * @example
 * ```html
 * <civ-prefill-notice profile-href="/profile"></civ-prefill-notice>
 * ```
 */
@customElement('civ-prefill-notice')
export class CivPrefillNotice extends CivBaseElement {
  /** Custom heading text. Uses i18n default if empty. */
  @property({ type: String }) heading = '';

  /** Custom body text. Uses i18n default if empty. */
  @property({ type: String }) body = '';

  /** URL for the "update profile" link. Omit to hide the link. */
  @property({ type: String, attribute: 'profile-href' }) profileHref = '';

  /** Custom link text. Uses i18n default if empty. */
  @property({ type: String, attribute: 'link-text' }) linkText = '';

  override render() {
    const headingText = this.heading || t('prefillNoticeHeading');
    const bodyText = this.body || t('prefillNoticeBody');
    const linkLabel = this.linkText || t('prefillNoticeLink');

    return html`
      <div class="civ-prefill-notice civ-alert civ-alert--info civ-alert--style-secondary" role="status">
        <div class="civ-alert__header">
          <p class="civ-alert__heading" role="heading" aria-level="3">${headingText}</p>
        </div>
        <div class="civ-alert__content">
          <div class="civ-alert__body">
            ${bodyText}
            ${this.profileHref ? html`
              <a href="${this.profileHref}" class="civ-link civ-ms-1">${linkLabel}</a>
            ` : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-prefill-notice': CivPrefillNotice;
  }
}
