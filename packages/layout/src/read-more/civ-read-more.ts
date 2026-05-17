import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, generateId, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Read More
 *
 * Two-stage content disclosure: an always-visible teaser paragraph
 * with a "Read more" button that reveals additional content kept
 * hidden in the DOM until expansion. Differs from `civ-disclosure`,
 * which hides ALL content behind a trigger — read-more keeps a
 * teaser visible so the user can decide whether to expand.
 *
 * **Two-slot API** — author the teaser as the default children, and
 * mark the expandable rest with `data-civ-read-more-rest`:
 *
 * ```html
 * <civ-read-more>
 *   <p>This is the teaser that's always visible.</p>
 *   <div data-civ-read-more-rest>
 *     <p>Hidden until the user expands.</p>
 *     <p>More paragraphs here.</p>
 *   </div>
 * </civ-read-more>
 * ```
 *
 * **Accessibility** — the trigger is a real `<button>` with
 * `aria-expanded` and `aria-controls` pointing at the rest region.
 * When collapsed, the rest region carries the `hidden` attribute so
 * screen readers skip it entirely; on expand, `hidden` is removed
 * and `aria-expanded` flips to `true`. Button text toggles between
 * "Read more" and "Read less" so the accessible name reflects the
 * action that will result from activating it.
 *
 * @element civ-read-more
 *
 * @prop {boolean} expanded - Whether the rest region is visible
 * @prop {string} moreLabel - Override the "Read more" trigger text
 * @prop {string} lessLabel - Override the "Read less" trigger text
 * @prop {string} icon - Optional icon name shown before the label; empty = no icon
 * @prop {string} size - Trigger size: 'default' or 'sm'
 *
 * @fires civ-toggle - When the expanded state changes, detail: { expanded }
 * @fires civ-analytics - Analytics tracking on toggle
 *
 * @slot - Always-visible teaser content (default slot)
 * @slot data-civ-read-more-rest - Content revealed when expanded
 */
@customElement('civ-read-more')
export class CivReadMore extends LightDomSlotMixin(CivBaseElement) {
  /** Whether the rest region is currently visible. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /** Override the "Read more" trigger text. */
  @property({ type: String, attribute: 'more-label' }) moreLabel = '';

  /** Override the "Read less" trigger text. */
  @property({ type: String, attribute: 'less-label' }) lessLabel = '';

  /**
   * Icon name from the civ-icon library shown before the label. Empty
   * by default — the trigger text alone is the affordance. Pass e.g.
   * `chevron-down` for a 180° rotate-on-expand visual cue.
   */
  @property({ type: String }) icon = '';

  /** Trigger size: 'default' or 'sm'. */
  @property({ type: String }) size: 'default' | 'sm' = 'default';

  private readonly _restId = generateId('civ-read-more-rest');

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-read-more-rest': '[data-civ-read-more-rest-slot]',
      default: '[data-civ-read-more-teaser]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const moreText = this.moreLabel || t('readMoreButton');
    const lessText = this.lessLabel || t('readLessButton');
    const buttonText = this.expanded ? lessText : moreText;
    const sizeClass = this.size === 'sm' ? 'civ-read-more__trigger--sm' : '';
    return html`
      <div class="civ-read-more__teaser" data-civ-read-more-teaser></div>
      <div
        class="civ-read-more__rest"
        id="${this._restId}"
        data-civ-read-more-rest-slot
        ?hidden="${!this.expanded}"
      ></div>
      <button
        type="button"
        class="civ-read-more__trigger ${sizeClass}"
        aria-expanded="${this.expanded ? 'true' : 'false'}"
        aria-controls="${this._restId}"
        @click="${this._onToggle}"
      >
        ${this.icon
          ? html`<civ-icon name="${this.icon}" class="civ-read-more__icon" aria-hidden="true"></civ-icon>`
          : nothing}
        <span>${buttonText}</span>
      </button>
    `;
  }

  /**
   * Toggle. Fires `civ-toggle` as a local (non-bubbling, non-composed)
   * event — read-more often lives inside `civ-form`; if the event
   * composed and bubbled, form-level `civ-input` listeners would see
   * a non-form-field payload. Consumers who want the event subscribe
   * directly on the host.
   */
  private _onToggle(): void {
    this.expanded = !this.expanded;
    this.dispatchEvent(new CustomEvent('civ-toggle', {
      detail: { expanded: this.expanded },
      bubbles: false,
      composed: false,
    }));
    this.sendAnalytics('change', { expanded: this.expanded });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-read-more': CivReadMore;
  }
}
