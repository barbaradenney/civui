import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Profile Card
 *
 * A gray card displaying locked identity data from the user's profile.
 * Used for verified information (name, DOB, SSN) that cannot be edited
 * within the form — the user must go to profile settings instead.
 *
 * Place `civ-read-only-field` children inside for each locked field.
 *
 * @element civ-profile-card
 *
 * @prop {string} heading - Card heading (default from i18n)
 * @prop {string} profileHref - URL to profile settings page
 * @prop {string} linkText - Custom link text (default from i18n)
 *
 * @example
 * ```html
 * <civ-profile-card profile-href="/profile/settings">
 *   <civ-read-only-field label="Name" value="Jane M. Doe"></civ-read-only-field>
 *   <civ-read-only-field label="Date of birth" value="March 15, 1985"></civ-read-only-field>
 *   <civ-read-only-field label="Social Security number" value="●●●-●●-6789"></civ-read-only-field>
 * </civ-profile-card>
 * ```
 */
@customElement('civ-profile-card')
export class CivProfileCard extends LightDomSlotMixin(CivBaseElement) {
  /** Card heading text. Uses i18n default if empty. */
  @property({ type: String }) heading = '';

  /** URL to profile settings page. */
  @property({ type: String, attribute: 'profile-href' }) profileHref = '';

  /** Custom link text. Uses i18n default if empty. */
  @property({ type: String, attribute: 'link-text' }) linkText = '';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-profile-card-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const headingText = this.heading || t('profileCardHeading');
    const linkLabel = this.linkText || t('profileCardLink');

    return html`
      <div class="civ-profile-card civ-bg-base-lightest civ-border civ-border-base-lighter civ-p-4 civ-mb-4">
        <p class="civ-font-bold civ-text-base civ-mb-3" role="heading" aria-level="3">
          ${headingText}
        </p>
        <div data-civ-profile-card-content></div>
        ${this.profileHref ? html`
          <div class="civ-mt-3 civ-pt-3 civ-border-t civ-border-base-lighter">
            <civ-link
              href="${this.profileHref}"
              label="${linkLabel}"
              variant="secondary"
            ></civ-link>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-profile-card': CivProfileCard;
  }
}
