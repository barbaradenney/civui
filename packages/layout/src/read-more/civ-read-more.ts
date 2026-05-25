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
 * mark the expandable rest with `data-rest`:
 *
 * ```html
 * <civ-read-more>
 *   <p>This is the teaser that's always visible.</p>
 *   <div data-rest>
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
 * @prop {boolean} open - Whether the rest region is visible
 * @prop {string} moreLabel - Override the "Read more" trigger text
 * @prop {string} lessLabel - Override the "Read less" trigger text
 * @prop {string} icon - Optional icon name shown before the label; empty = no icon
 * @prop {string} size - Trigger size: 'default' or 'sm'
 * @prop {boolean} inline - Render teaser, rest, and trigger inline
 * @prop {boolean} noFadeTrigger - Opt out of the default block-mode fade overlay: the trigger sits below the teaser as a plain button instead of floating over a gradient at the bottom of the text
 *
 * @fires civ-toggle - When the open state changes, detail: { open }
 * @fires civ-analytics - Analytics tracking on toggle
 *
 * @slot - Always-visible teaser content (default slot)
 * @slot data-rest - Content revealed when expanded
 */
@customElement('civ-read-more')
export class CivReadMore extends LightDomSlotMixin(CivBaseElement) {
  /** Whether the rest region is currently visible. */
  @property({ type: Boolean, reflect: true }) open = false;

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

  /**
   * Inline mode. The teaser, rest region, and trigger all render
   * inline so the button reads as "...the last words at the end of
   * the paragraph" rather than as a separate block-level affordance.
   * The trigger drops its button chrome (no background, underlined)
   * and any chevron icon is suppressed.
   *
   * Author the teaser as plain text (no `<p>` wrapper) so the inline
   * flow reads cleanly; block elements inside an inline container
   * defeat the layout.
   */
  @property({ type: Boolean, reflect: true }) inline = false;

  /**
   * Opt out of the default fade-and-overlay treatment in block mode.
   *
   * By default (block mode, collapsed), the teaser's bottom edge fades
   * into `--civ-read-more-bg` and the trigger sits centered over the
   * fade, visually integrating the affordance with the truncated text.
   * Setting this attribute reverts to the older layout — plain button
   * stacked below the teaser. Inline mode and the expanded state are
   * unaffected either way; the fade only renders when there's
   * collapsed block content to fade FROM.
   */
  @property({ type: Boolean, reflect: true, attribute: 'no-fade-trigger' }) noFadeTrigger = false;

  private readonly _restId = generateId('civ-read-more-rest');

  override _getSlotConfig(): SlotConfig {
    return {
      'data-rest': '[data-civ-read-more-rest]',
      default: '[data-civ-read-more-teaser]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const moreText = this.moreLabel || t('readMoreButton');
    const lessText = this.lessLabel || t('readLessButton');
    const buttonText = this.open ? lessText : moreText;
    const sizeClass = this.size === 'sm' ? 'civ-text-btn--sm' : '';
    // Inline mode still uses the shared `civ-text-btn civ-text-btn--chip`
    // palette so the affordance reads as a button (filled background,
    // rounded, semibold) rather than as an underlined link. The
    // component's own `--inline` modifier trims padding and zeroes
    // the trigger's top margin so it sits on the text baseline instead
    // of being pushed off it by the block-mode `civ-mt-2` rule.
    // Chevron icon is still suppressed inline — it breaks the text
    // flow.
    const triggerClasses = this.inline
      ? 'civ-text-btn civ-text-btn--chip civ-read-more__trigger civ-read-more__trigger--inline'
      : `civ-text-btn civ-text-btn--chip civ-read-more__trigger ${sizeClass}`;
    return html`
      <div class="civ-read-more__teaser" data-civ-read-more-teaser></div>
      <div
        class="civ-read-more__rest"
        id="${this._restId}"
        data-civ-read-more-rest
        ?hidden="${!this.open}"
      ></div>
      <button
        type="button"
        class="${triggerClasses}"
        aria-expanded="${this.open ? 'true' : 'false'}"
        aria-controls="${this._restId}"
        @click="${this._onToggle}"
      >
        ${this.icon && !this.inline
          ? html`<civ-icon name="${this.icon}" class="civ-read-more__icon" aria-hidden="true"></civ-icon>`
          : nothing}
        ${buttonText}
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
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent('civ-toggle', {
      detail: { open: this.open },
      bubbles: false,
      composed: false,
    }));
    this.sendAnalytics('change', { open: this.open });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-read-more': CivReadMore;
  }
}
