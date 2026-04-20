import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Link Card
 *
 * A clickable card that navigates to a destination. The entire card
 * is the click target. Renders as an `<a>` element wrapping the content.
 *
 * @element civ-link-card
 *
 * @prop {string} href - Navigation destination (required)
 * @prop {string} heading - Card heading text
 * @prop {string} description - Descriptive text below the heading
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

  override render() {
    return html`
      <a
        href="${this.href}"
        class="civ-link-card focus-visible:civ-focus-ring"
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
