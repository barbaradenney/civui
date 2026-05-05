import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type SupportResourcesTone = 'default' | 'crisis';

/**
 * CivUI Support Resources
 *
 * A structured container for support/crisis contact information. Renders
 * as an `<aside>` landmark with a heading and slotted action links for
 * phone, email, or other contact methods.
 *
 * Use at the bottom of sensitive forms (benefits, healthcare, housing)
 * to provide crisis lines, helpdesk numbers, or support links.
 *
 * @element civ-support-resources
 *
 * @prop {string} heading - Heading text (default: "If you need support")
 * @prop {number} headingLevel - Semantic heading level (2–6, default 3)
 * @prop {SupportResourcesTone} tone - 'default' or 'crisis' (error border for urgency)
 *
 * @slot - Action links and contact information (civ-action-link, civ-link, text)
 *
 * @example
 * ```html
 * <civ-support-resources heading="If you need support">
 *   <civ-action-link type="phone" number="988" label="Veterans Crisis Line"></civ-action-link>
 *   <civ-action-link type="phone" number="18774243838" label="Homeless Veterans Hotline"></civ-action-link>
 * </civ-support-resources>
 * ```
 */
@customElement('civ-support-resources')
export class CivSupportResources extends LightDomSlotMixin(CivBaseElement) {
  /** Heading text. */
  @property({ type: String }) heading = '';

  /** Semantic heading level. */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel = 3;

  /** Visual tone — 'crisis' uses error color left border for urgency. */
  @property({ type: String }) tone: SupportResourcesTone = 'default';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-support-resources-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const headingText = this.heading || t('supportResourcesHeading');
    const toneClass = this.tone === 'crisis' ? 'civ-callout--error' : '';
    const level = Math.max(2, Math.min(6, this.headingLevel));

    return html`
      <aside
        class="civ-support-resources civ-callout ${toneClass}"
        role="complementary"
        aria-label="${headingText}"
      >
        <p
          class="civ-support-resources__heading"
          role="heading"
          aria-level="${level}"
        >${headingText}</p>
        <div class="civ-support-resources__content" data-civ-support-resources-content></div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-support-resources': CivSupportResources;
  }
}
