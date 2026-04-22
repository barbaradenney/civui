import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

export type LinkCardVariant = 'primary' | 'secondary' | 'tertiary' | 'critical' | 'danger';

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

  override render() {
    const classes = `civ-link-card civ-link-card--${this.variant} focus-visible:civ-focus-ring`;

    return html`
      <a
        href="${this.href}"
        class="${classes}"
        @click="${this._onClick}"
      >
        <span class="civ-link-card__heading">${this.heading}</span>
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
