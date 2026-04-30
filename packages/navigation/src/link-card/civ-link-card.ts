import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type LinkCardVariant = 'primary' | 'secondary' | 'tertiary' | 'critical' | 'danger';
export type LinkCardColor = 'blue' | 'teal' | 'red' | 'green' | 'yellow' | 'orange' | 'purple' | 'gray';

/** Protocols that are never allowed in link href values. */
const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

/**
 * CivUI Link Card
 *
 * A clickable card that navigates to a destination. The entire card
 * is the click target. Renders as an `<a>` element wrapping the content.
 *
 * **Variants:**
 * - `primary` (default) — filled primary color, white text
 * - `secondary` — light primary tint background
 * - `tertiary` — white with border outline
 * - `critical` — yellow/gold background for urgent actions
 * - `danger` — filled error color, white text for destructive actions
 *
 * @element civ-link-card
 *
 * @prop {string} href - Navigation destination (required)
 * @prop {string} heading - Card heading text
 * @prop {string} description - Descriptive text below the heading
 * @prop {LinkCardVariant} variant - Visual variant
 * @prop {LinkCardColor} color - Color variant (same palette as civ-card and civ-tag)
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the heading
 * @prop {string} iconEnd - Icon name to render after the heading
 *
 * @slot - Optional content rendered inside the anchor above the heading
 *         (e.g., a status tag).
 * @slot end - Optional content rendered on the trailing edge of the card,
 *             aligned vertically with the heading. Children with the
 *             `data-civ-link-card-end` attribute are placed in this slot.
 *             Use either `iconEnd` *or* the end slot — when both are set
 *             they render as adjacent siblings on the trailing edge with
 *             no separator.
 *
 * @fires civ-analytics - Analytics tracking event on click
 *
 * @example
 * ```html
 * <civ-link-card
 *   href="/benefits/disability"
 *   heading="Disability compensation"
 *   description="File a claim for a service-connected disability."
 * ></civ-link-card>
 * ```
 */
@customElement('civ-link-card')
export class CivLinkCard extends LightDomSlotMixin(CivBaseElement) {
  /** Navigation destination. */
  @property({ type: String }) href = '';

  /** Card heading text. */
  @property({ type: String }) heading = '';

  /** Descriptive text below the heading. */
  @property({ type: String }) description = '';

  /** Visual variant. */
  @property({ type: String }) variant: LinkCardVariant = 'primary';

  /** Color variant — same palette as civ-card and civ-tag. */
  @property({ type: String }) color: LinkCardColor | '' = '';

  /** Padding size: 'default' or 'sm' for compact layouts. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  /** Icon name to render before the heading. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  /** Icon name to render after the heading. */
  @property({ type: String, attribute: 'icon-end' }) iconEnd = '';

  /** Return sanitized href, stripping dangerous protocols. */
  private get _safeHref(): string {
    if (UNSAFE_HREF_PATTERN.test(this.href)) return '';
    return this.href;
  }

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-link-card-end': '[data-civ-link-card-end-slot]',
      default: '[data-civ-link-card-slot]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const colorClass = this.color
      ? (this.variant === 'primary' ? `civ-card--${this.color}-primary` : `civ-card--${this.color}`)
      : `civ-link-card--${this.variant}`;

    const classes = [
      'civ-link-card',
      colorClass,
      this.spacing === 'sm' ? 'civ-link-card--sm' : '',
      'focus-visible:civ-focus-ring',
    ].filter(Boolean).join(' ');

    const hasEndSlot = this._hasSlottedChildren('data-civ-link-card-end');
    const useLayout = this.iconStart || this.iconEnd || hasEndSlot;

    return html`
      <a
        href="${this._safeHref}"
        class="${classes}"
        @click="${this._onClick}"
      >
        <span data-civ-link-card-slot></span>
        ${useLayout ? html`
          <span class="civ-link-card__layout">
            ${this.iconStart ? html`<span class="civ-link-card__start"><civ-icon class="civ-link-card__icon" name="${this.iconStart}" aria-hidden="true"></civ-icon></span>` : nothing}
            <span class="civ-link-card__content">
              <span class="civ-link-card__heading">${this.heading}</span>
              ${this.description
                ? html`<span class="civ-link-card__description">${this.description}</span>`
                : nothing}
            </span>
            ${this.iconEnd ? html`<span class="civ-link-card__end"><civ-icon class="civ-link-card__icon" name="${this.iconEnd}" aria-hidden="true"></civ-icon></span>` : nothing}
            ${hasEndSlot ? html`<span class="civ-link-card__end" data-civ-link-card-end-slot></span>` : nothing}
          </span>
        ` : html`
          <span class="civ-link-card__heading">${this.heading}</span>
          ${this.description
            ? html`<span class="civ-link-card__description">${this.description}</span>`
            : nothing}
        `}
      </a>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-link-card': CivLinkCard;
  }
}
