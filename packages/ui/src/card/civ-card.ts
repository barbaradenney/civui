import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';

/**
 * CivUI Card
 *
 * A structured container with three slot areas: header, body, and footer.
 * Use `data-card-header` and `data-card-footer` attributes to assign
 * children to those sections. Everything else goes into the body.
 *
 * The card provides the border, padding, and section styling — you
 * control all the content inside each slot.
 *
 * @element civ-card
 *
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 *
 * @example Basic card
 * ```html
 * <civ-card>
 *   <p>Card content goes here.</p>
 * </civ-card>
 * ```
 *
 * @example Card with header and footer
 * ```html
 * <civ-card>
 *   <div data-card-header>
 *     <civ-tag label="In progress" variant="teal"></civ-tag>
 *     <h3 class="civ-heading-md">Disability compensation</h3>
 *   </div>
 *   <p>Filed: March 10, 2026</p>
 *   <div data-card-footer>
 *     <civ-link href="/claims/123" variant="secondary">View details</civ-link>
 *   </div>
 * </civ-card>
 * ```
 *
 * @example Card with expandable footer
 * ```html
 * <civ-card>
 *   <div data-card-header>
 *     <h3 class="civ-heading-md">Payment history</h3>
 *   </div>
 *   <p>Last payment: $1,234.56</p>
 *   <details data-card-footer>
 *     <summary>View breakdown</summary>
 *     <p>Detail content here</p>
 *   </details>
 * </civ-card>
 * ```
 */
@customElement('civ-card')
export class CivCard extends CivBaseElement {
  /** Padding size. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  private _headerChildren: Node[] = [];
  private _footerChildren: Node[] = [];
  private _bodyChildren: Node[] = [];
  private _childrenSorted = false;

  override connectedCallback(): void {
    if (!this._childrenSorted) {
      for (const child of Array.from(this.childNodes)) {
        if (child instanceof Element) {
          if (child.hasAttribute('data-card-header')) {
            this._headerChildren.push(child);
          } else if (child.hasAttribute('data-card-footer')) {
            this._footerChildren.push(child);
          } else {
            this._bodyChildren.push(child);
          }
        } else {
          this._bodyChildren.push(child);
        }
      }
      this._childrenSorted = true;
    }
    super.connectedCallback();
  }

  override firstUpdated(): void {
    const header = this.querySelector('[data-civ-card-header]');
    if (header) {
      for (const child of this._headerChildren) header.appendChild(child);
    }
    const body = this.querySelector('[data-civ-card-body]');
    if (body) {
      for (const child of this._bodyChildren) body.appendChild(child);
    }
    const footer = this.querySelector('[data-civ-card-footer]');
    if (footer) {
      for (const child of this._footerChildren) footer.appendChild(child);
    }
  }

  override render() {
    const classes = [
      'civ-card',
      this.spacing === 'sm' ? 'civ-card--sm' : '',
    ].filter(Boolean).join(' ');

    const hasHeader = this._headerChildren.length > 0;
    const hasFooter = this._footerChildren.length > 0;

    return html`
      <div class="${classes}">
        ${hasHeader ? html`
          <div class="civ-card__header" data-civ-card-header></div>
        ` : nothing}

        <div class="civ-card__body" data-civ-card-body></div>

        ${hasFooter ? html`
          <div class="civ-card__footer" data-civ-card-footer></div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-card': CivCard;
  }
}
