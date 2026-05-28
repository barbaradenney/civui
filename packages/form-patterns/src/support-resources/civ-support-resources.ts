import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import '@civui/feedback/callout';

export type SupportResourcesTone = 'default' | 'crisis';

/**
 * CivUI Support Resources
 *
 * A structured container for support/crisis contact information.
 * Renders a `complementary` landmark (composed from `civ-callout`)
 * with a heading and slotted action links for phone, email, or other
 * contact methods.
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
 * @slot - Contact links and information (civ-link with type="phone" | "email" | "download", or plain civ-link)
 *
 * @example
 * ```html
 * <civ-support-resources heading="If you need support">
 *   <civ-link type="phone" number="988" label="Veterans Crisis Line"></civ-link>
 *   <civ-link type="phone" number="18774243838" label="Homeless Veterans Hotline"></civ-link>
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

  /**
   * Stable id for the heading, generated once per instance. Generating it
   * inside render() would mint a new id on every re-render — harmless for
   * the aria-labelledby reference (it updates in lockstep) but wasteful and
   * inconsistent with every sibling (civ-fieldset, civ-section-intro, …).
   */
  private _headingId = this.generateId('heading');

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-support-resources-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const headingText = this.heading || t('supportResourcesHeading');
    const variant = this.tone === 'crisis' ? 'error' : nothing;
    // Guard NaN before clamping — Lit's `@property({ type: Number })`
    // returns NaN for any non-numeric attribute value
    // (e.g. `heading-level="three"`), which would propagate into
    // `aria-level="NaN"` (invalid ARIA).
    const rawLevel = Number.isFinite(this.headingLevel) ? this.headingLevel : 3;
    const level = Math.max(2, Math.min(6, rawLevel));

    const headingId = this._headingId;

    // `aria-labelledby` resolves to the heading text via the rendered
    // `<p>`'s id, but we also set `aria-label` as a safety net:
    // landmark enumeration tools that scan before child custom
    // elements upgrade still get a meaningful accessible name on
    // the complementary region. Per ARIA spec, aria-labelledby
    // takes precedence over aria-label when both are present, so
    // the heading text wins under normal conditions.
    return html`
      <civ-callout
        class="civ-support-resources"
        intent="${variant}"
        role="complementary"
        aria-label="${headingText}"
        aria-labelledby="${headingId}"
      >
        <p
          id="${headingId}"
          class="civ-support-resources__heading"
          role="heading"
          aria-level="${level}"
        >${headingText}</p>
        <div class="civ-support-resources__content" data-civ-support-resources-content></div>
      </civ-callout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-support-resources': CivSupportResources;
  }
}
