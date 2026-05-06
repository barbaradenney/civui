import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, renderError } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/** Protocols that are never allowed in link href values. */
const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

/**
 * CivUI List Item
 *
 * A row inside `<civ-list>`. Five slot zones for flexible composition:
 *
 * - **start** (`data-list-item-start`) — leading content (icons, avatars)
 * - **heading** (`data-list-item-heading`) — heading element (any level)
 * - **description** (`data-list-item-description`) — secondary/rich text
 * - **default** — body content
 * - **end** (`data-list-item-end`) — trailing content (badges, buttons)
 *
 * String props `heading` and `description` are convenience shorthand.
 * When the corresponding slot is present, it takes priority over the prop.
 *
 * @element civ-list-item
 *
 * @prop {string} href - Optional navigation target.
 * @prop {boolean} current - Mark as current page (`aria-current="page"`).
 * @prop {string} heading - Shorthand bold heading text.
 * @prop {string} description - Shorthand secondary text below heading.
 * @prop {string} error - Error text below content.
 *
 * @slot start - Leading content via `data-list-item-start`.
 * @slot heading - Rich heading via `data-list-item-heading` (overrides heading prop).
 * @slot description - Rich description via `data-list-item-description` (overrides description prop).
 * @slot - Body content.
 * @slot end - Trailing content via `data-list-item-end`.
 *
 * @fires civ-analytics - Analytics tracking on click (when href set).
 *
 * @example
 * ```html
 * <!-- Simple (string props) -->
 * <civ-list-item heading="Personal info" description="Name, DOB, SSN">
 *   <civ-badge data-list-item-end label="Complete" variant="success"></civ-badge>
 * </civ-list-item>
 *
 * <!-- Rich (slots — any heading level, links in description) -->
 * <civ-list-item>
 *   <civ-icon data-list-item-start name="edit"></civ-icon>
 *   <h3 data-list-item-heading class="civ-font-bold">Contact information</h3>
 *   <p data-list-item-description class="civ-text-sm">
 *     Phone, email, and <a href="#/address">mailing address</a>
 *   </p>
 *   <civ-badge data-list-item-end label="In progress" variant="info"></civ-badge>
 * </civ-list-item>
 * ```
 */
@customElement('civ-list-item')
export class CivListItem extends LightDomSlotMixin(CivBaseElement) {
  /** Optional navigation target. When set, the row becomes a clickable anchor. */
  @property({ type: String }) href = '';

  /** Mark this row as the current page. Sets aria-current="page" on the anchor. */
  @property({ type: Boolean }) current = false;

  /** Shorthand bold heading text. Overridden by the heading slot. */
  @property({ type: String }) heading = '';

  /** Shorthand secondary text. Overridden by the description slot. */
  @property({ type: String }) description = '';

  /** Error text below the content. */
  @property({ type: String }) error = '';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-list-item-start': '[data-civ-list-item-start-slot]',
      'data-list-item-heading': '[data-civ-list-item-heading-slot]',
      'data-list-item-description': '[data-civ-list-item-description-slot]',
      'data-list-item-end': '[data-civ-list-item-end-slot]',
      default: '[data-civ-list-item-content-slot]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  private get _safeHref(): string {
    if (UNSAFE_HREF_PATTERN.test(this.href)) return '';
    return this.href;
  }

  override render() {
    const hasStart = this._hasSlottedChildren('data-list-item-start');
    const hasHeadingSlot = this._hasSlottedChildren('data-list-item-heading');
    const hasDescriptionSlot = this._hasSlottedChildren('data-list-item-description');
    const hasEnd = this._hasSlottedChildren('data-list-item-end');
    const isLink = !!this._safeHref;

    const rowClasses = [
      'civ-list-item__row',
      'civ-flex',
      'civ-items-center',
      'civ-gap-3',
    ].join(' ');

    const linkClasses = [
      rowClasses,
      'civ-no-underline',
      'civ-text-inherit',
      'hover:civ-bg-primary-lightest',
      'civ-transition-colors',
    ].join(' ');

    // Heading: slot takes priority, then prop fallback
    const headingContent = hasHeadingSlot
      ? html`<span data-civ-list-item-heading-slot></span>`
      : this.heading
        ? html`<span class="civ-block civ-font-bold civ-list-item-heading-prop">${this.heading}</span>`
        : nothing;

    // Description: slot takes priority, then prop fallback
    const descriptionContent = hasDescriptionSlot
      ? html`<span data-civ-list-item-description-slot></span>`
      : this.description
        ? html`<span class="civ-block civ-text-sm">${this.description}</span>`
        : nothing;

    const inner = html`
      ${hasStart ? html`
        <span class="civ-flex-shrink-0 civ-flex civ-items-center" data-civ-list-item-start-slot></span>
      ` : nothing}
      <span class="civ-flex-1 civ-min-w-0">
        ${headingContent}
        ${descriptionContent}
        <span data-civ-list-item-content-slot></span>
        ${renderError(this.generateId('error'), this.error)}
      </span>
      ${hasEnd ? html`
        <span class="civ-flex-shrink-0 civ-flex civ-items-center civ-gap-1" data-civ-list-item-end-slot></span>
      ` : nothing}
    `;

    if (isLink) {
      return html`
        <li>
          <a
            href="${this._safeHref}"
            class="${linkClasses}"
            aria-current="${this.current ? 'page' : nothing}"
            @click="${this._onClick}"
          >
            ${inner}
          </a>
        </li>
      `;
    }

    return html`
      <li>
        <div class="${rowClasses}" aria-current="${this.current ? 'page' : nothing}">${inner}</div>
      </li>
    `;
  }

  private _onClick(): void {
    this.sendAnalytics('click');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-list-item': CivListItem;
  }
}
