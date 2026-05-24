import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type ProcessListItemState = 'default' | 'complete';

/**
 * CivUI Process List Item
 *
 * A single step inside `<civ-process-list>`. Renders the numbered (or
 * icon) marker + connecting segment on the leading edge, then a stack
 * of heading + slotted body on the trailing edge.
 *
 * Marker behavior:
 *  - **default** state, no `icon`: an auto-incremented step number
 *    appears inside the marker via a CSS counter on the parent list.
 *  - **complete** state: the marker swaps to a green "check" icon and
 *    a success-tinted background — the step has been completed.
 *  - explicit `icon` prop: the named icon replaces the number / check,
 *    for cases where the step has a more specific affordance (e.g.
 *    "lock" for an authentication step).
 *
 * The rail (marker + connecting line) is wrapped in `aria-hidden` so
 * screen readers hear only the heading and body content, not the
 * decorative geometry. Order in the markup is the visual order; the
 * `<ol>` semantics convey sequence and count to assistive tech.
 *
 * @element civ-process-list-item
 *
 * @prop {string} heading - Step title rendered prominently above the body.
 * @prop {number} headingLevel - Semantic heading level 2-6 (default 3) for screen-reader rotor navigation.
 * @prop {ProcessListItemState} state - 'default' (number marker) or 'complete' (check icon, success tint).
 * @prop {string} icon - Optional override icon name; replaces the auto-number or check.
 *
 * @slot - Body content: paragraphs, sub-lists, links, callouts.
 */
@customElement('civ-process-list-item')
export class CivProcessListItem extends LightDomSlotMixin(CivBaseElement) {
  /** Step title. */
  @property({ type: String }) heading = '';

  /** Semantic heading level 2-6. */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel = 3;

  /** Visual state — default (numbered) or complete (check + success tint). */
  @property({ type: String, reflect: true })
  state: ProcessListItemState = 'default';

  /** Optional icon override; replaces the auto-number or check. */
  @property({ type: String }) icon = '';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-process-list-item-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  /** Resolve the icon name that goes inside the marker. Explicit
   *  `icon` wins; otherwise the complete state implies `check`;
   *  otherwise empty (meaning "let the CSS counter render the step
   *  number"). */
  private get _markerIcon(): string {
    if (this.icon) return this.icon;
    if (this.state === 'complete') return 'check';
    return '';
  }

  override render() {
    const markerIcon = this._markerIcon;
    // Clamp the heading level into the legal range, but guard NaN
    // first — Lit's `@property({ type: Number })` converter returns
    // NaN for any non-numeric attribute value (e.g. `heading-level=
    // "h3"`), and an unguarded `Math.max(2, Math.min(6, NaN))`
    // propagates NaN into `aria-level="NaN"`, which violates ARIA.
    const rawLevel = Number.isFinite(this.headingLevel) ? this.headingLevel : 3;
    const level = Math.max(2, Math.min(6, rawLevel));

    // The marker's content is rendered explicitly here rather than via
    // a CSS `:empty::before` counter pseudo, because lit-html inserts
    // a ChildPart comment marker for the `${...}` expression — the
    // marker `<span>` is never truly `:empty`, so a `:empty::before`
    // rule would never fire and the auto-numbered step number would
    // never render. The CSS rule for `.civ-process-list-item__counter`
    // fires unconditionally on its `::before`.
    return html`
      <div class="civ-process-list-item">
        <div class="civ-process-list-item__rail" aria-hidden="true">
          <span class="civ-process-list-item__marker">
            ${markerIcon
              ? html`<civ-icon
                  class="civ-process-list-item__marker-icon"
                  name="${markerIcon}"
                ></civ-icon>`
              : html`<span class="civ-process-list-item__counter"></span>`}
          </span>
          <span class="civ-process-list-item__line"></span>
        </div>

        <div class="civ-process-list-item__content">
          ${this.heading
            ? html`<p
                class="civ-process-list-item__heading"
                role="heading"
                aria-level="${level}"
              >${this.heading}</p>`
            : nothing}
          <div
            class="civ-process-list-item__body"
            data-civ-process-list-item-content
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-process-list-item': CivProcessListItem;
  }
}
