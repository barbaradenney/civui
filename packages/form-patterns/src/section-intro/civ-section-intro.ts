import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import '@civui/layout/callout';

/**
 * CivUI Section Intro
 *
 * Context panel displayed before a sensitive or complex form section.
 * Sets expectations ("the next questions ask about...") so users are not
 * ambushed by difficult content. Authored body content is rendered as
 * provided children — headings, paragraphs, lists, links all work.
 *
 * **Heading level:** Renders at `heading-level` (default 3). Set to match
 * the section depth — e.g., inside a form step under an `h2`, use the
 * default `3`. Inside a nested fieldset, use `4`.
 *
 * @element civ-section-intro
 *
 * @prop {string} heading - Section heading (required for accessible labelling)
 * @prop {number} headingLevel - Heading level 2-6 (default: 3)
 * @prop {'info' | 'sensitive' | 'neutral'} tone - Visual tone (default: 'info')
 *
 * @example
 * ```html
 * <civ-section-intro heading="About your service-connected trauma" tone="sensitive">
 *   <p>The next questions ask about events that may be difficult to remember.</p>
 *   <p>You can skip any question and come back to it later.</p>
 * </civ-section-intro>
 * ```
 */
@customElement('civ-section-intro')
export class CivSectionIntro extends LightDomSlotMixin(CivBaseElement) {
  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-section-intro-body]' };
  }

  /** Section heading text. */
  @property({ type: String }) heading = '';

  /** Heading level (2-6). */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel: 2 | 3 | 4 | 5 | 6 = 3;

  /**
   * Visual tone. `sensitive` uses a warning-colored accent for PII /
   * trauma-informed sections; `info` and `neutral` both render with
   * the primary accent (kept as separate tokens for semantic clarity
   * in markup — they are visually identical today).
   *
   * Reflected to the host attribute so consumer theming overrides
   * can target `civ-section-intro[tone='sensitive']` instead of the
   * removed `.civ-section-intro--sensitive` class.
   */
  @property({ type: String, reflect: true, useDefault: true })
  tone: 'info' | 'sensitive' | 'neutral' = 'info';

  private _headingId = this.generateId('section-intro-heading');

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const regionLabel = this.heading ? undefined : t('sectionIntroRegionLabel');
    const variant = this.tone === 'sensitive' ? 'warning' : nothing;

    return html`
      <civ-callout
        variant="${variant}"
        role="region"
        aria-labelledby="${this.heading ? this._headingId : nothing}"
        aria-label="${regionLabel ?? nothing}"
      >
        ${this.heading
          ? html`<p
              id="${this._headingId}"
              class="civ-section-intro__heading"
              role="heading"
              aria-level="${this.headingLevel}"
            >${this.heading}</p>`
          : nothing}
        <div class="civ-section-intro__body" data-civ-section-intro-body></div>
      </civ-callout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-section-intro': CivSectionIntro;
  }
}
