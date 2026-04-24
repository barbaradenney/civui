import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type LinkCardVariant = 'primary' | 'secondary' | 'tertiary' | 'critical' | 'danger';

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
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 * @prop {string} iconStart - Icon name to render before the heading
 * @prop {string} iconEnd - Icon name to render after the heading
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
export class CivLinkCard extends CivBaseElement {
  /** Navigation destination. */
  @property({ type: String }) href = '';

  /** Card heading text. */
  @property({ type: String }) heading = '';

  /** Descriptive text below the heading. */
  @property({ type: String }) description = '';

  /** Visual variant. */
  @property({ type: String }) variant: LinkCardVariant = 'primary';

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

  override render() {
    const classes = [
      'civ-link-card',
      `civ-link-card--${this.variant}`,
      this.spacing === 'sm' ? 'civ-link-card--sm' : '',
      'focus-visible:civ-focus-ring',
    ].filter(Boolean).join(' ');

    return html`
      <a
        href="${this._safeHref}"
        class="${classes}"
        @click="${this._onClick}"
      >
        <span class="civ-link-card__heading">
          ${this.iconStart ? html`<civ-icon name="${this.iconStart}" aria-hidden="true"></civ-icon>` : nothing}
          ${this.heading}
          ${this.iconEnd ? html`<civ-icon name="${this.iconEnd}" aria-hidden="true"></civ-icon>` : nothing}
        </span>
        ${this.description
          ? html`<span class="civ-link-card__description">${this.description}</span>`
          : nothing}
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
