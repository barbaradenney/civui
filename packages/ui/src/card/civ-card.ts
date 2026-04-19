import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement } from '@civui/core';
import type { TagVariant } from '../tag/civ-tag.js';

/**
 * CivUI Card
 *
 * A structured container with optional header (heading + eyebrow + actions),
 * body (slotted content), and footer. The footer supports any content —
 * action links, buttons, or native `<details>` for expandable sections.
 *
 * @element civ-card
 *
 * @prop {string} heading - Card title
 * @prop {string} eyebrow - Small label above the heading (status, category)
 * @prop {string} eyebrowVariant - Tag color for the eyebrow
 * @prop {string} href - Makes the heading a link
 * @prop {string} spacing - Padding size: 'default' or 'sm'
 *
 * @example Basic card
 * ```html
 * <civ-card heading="Section title">
 *   <p>Card content goes here.</p>
 * </civ-card>
 * ```
 *
 * @example Card with eyebrow status and footer action
 * ```html
 * <civ-card heading="Disability compensation" eyebrow="In progress" eyebrow-variant="teal">
 *   <p>Filed: March 10, 2026</p>
 *   <div data-card-footer>
 *     <a href="/claims/123" class="civ-link">View details</a>
 *   </div>
 * </civ-card>
 * ```
 *
 * @example Card with expandable footer
 * ```html
 * <civ-card heading="Payment history">
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
  /** Card title. */
  @property({ type: String }) heading = '';

  /** Small label above the heading (e.g., status, category). */
  @property({ type: String }) eyebrow = '';

  /** Tag color variant for the eyebrow. */
  @property({ type: String, attribute: 'eyebrow-variant' }) eyebrowVariant: TagVariant = 'gray';

  /** Makes the heading a link. */
  @property({ type: String }) href = '';

  /** Padding size. */
  @property({ type: String }) spacing: 'default' | 'sm' = 'default';

  private _footerChildren: Node[] = [];
  private _actionChildren: Node[] = [];
  private _bodyChildren: Node[] = [];
  private _childrenSorted = false;

  override connectedCallback(): void {
    // Sort children into body, footer, and actions before super captures them
    if (!this._childrenSorted) {
      for (const child of Array.from(this.childNodes)) {
        if (child instanceof Element) {
          if (child.hasAttribute('data-card-footer')) {
            this._footerChildren.push(child);
          } else if (child.hasAttribute('data-card-actions')) {
            this._actionChildren.push(child);
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
    // Relocate body children
    const body = this.querySelector('[data-civ-card-body]');
    if (body) {
      for (const child of this._bodyChildren) body.appendChild(child);
    }
    // Relocate footer children
    const footer = this.querySelector('[data-civ-card-footer]');
    if (footer) {
      for (const child of this._footerChildren) footer.appendChild(child);
    }
    // Relocate action children
    const actions = this.querySelector('[data-civ-card-actions]');
    if (actions) {
      for (const child of this._actionChildren) actions.appendChild(child);
    }
  }

  override render() {
    const classes = [
      'civ-card',
      this.spacing === 'sm' ? 'civ-card--sm' : '',
    ].filter(Boolean).join(' ');

    const hasHeader = this.heading || this.eyebrow;
    const hasFooter = this._footerChildren.length > 0;
    const hasActions = this._actionChildren.length > 0;

    return html`
      <div class="${classes}">
        ${hasHeader ? html`
          <div class="civ-card__header">
            ${this.eyebrow ? html`
              <div class="civ-card__eyebrow">
                <civ-tag label="${this.eyebrow}" variant="${this.eyebrowVariant}" size="sm"></civ-tag>
              </div>
            ` : nothing}
            ${this.heading ? html`
              <div class="civ-card__title-row">
                ${this.href
                  ? html`<a href="${this.href}" class="civ-heading-md civ-link civ-card__title">${this.heading}</a>`
                  : html`<span class="civ-heading-md civ-card__title">${this.heading}</span>`}
                ${hasActions ? html`<span data-civ-card-actions class="civ-card__actions"></span>` : nothing}
              </div>
            ` : nothing}
          </div>
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
