import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/** Protocols that are never allowed in link href values. */
const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

/**
 * CivUI List Item
 *
 * A row inside `<civ-list>`. Renders as `<li>`. When `href` is set,
 * the entire row becomes a clickable anchor; otherwise it's a plain
 * `<li>` with the same layout.
 *
 * Supports a leading icon, trailing content slot, and nesting
 * (place a `<civ-list>` as a child for sub-lists).
 *
 * @element civ-list-item
 *
 * @prop {string} href - Optional navigation target.
 * @prop {boolean} current - Mark as current page (`aria-current="page"`).
 * @prop {string} iconStart - Leading icon name from the civ-icon library.
 * @prop {string} heading - Bold heading text. When set, renders above the description and default slot.
 * @prop {string} description - Secondary text below the heading.
 *
 * @slot - Primary content (label, description, anything). When `heading` is set, slot content renders after the heading/description.
 * @slot end - Trailing content via `data-list-item-end` attribute.
 *
 * @fires civ-analytics - Analytics tracking on click (when href set).
 *
 * @example
 * ```html
 * <civ-list-item href="/claims" icon-start="edit">
 *   My claims
 *   <civ-badge data-list-item-end label="3" variant="info"></civ-badge>
 * </civ-list-item>
 * ```
 */
@customElement('civ-list-item')
export class CivListItem extends LightDomSlotMixin(CivBaseElement) {
  /** Optional navigation target. When set, the row becomes a clickable anchor. */
  @property({ type: String }) href = '';

  /** Mark this row as the current page. Sets aria-current="page" on the anchor. */
  @property({ type: Boolean }) current = false;

  /** Leading icon name from the civ-icon library. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  /** Bold heading text. When set, renders above the description and default slot. */
  @property({ type: String }) heading = '';

  /** Secondary text below the heading. */
  @property({ type: String }) description = '';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-list-item-end': '[data-civ-list-item-end-slot]',
      default: '[data-civ-list-item-content-slot]',
    };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  /** Return sanitized href, stripping dangerous protocols. */
  private get _safeHref(): string {
    if (UNSAFE_HREF_PATTERN.test(this.href)) return '';
    return this.href;
  }

  override render() {
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
      'focus-visible:civ-focus-ring',
      'civ-transition-colors',
    ].join(' ');

    const icon = this.iconStart
      ? html`<civ-icon name="${this.iconStart}" class="civ-flex-shrink-0 civ-text-base"></civ-icon>`
      : nothing;

    const headingBlock = this.heading ? html`
      <span class="civ-block civ-font-bold">${this.heading}</span>
      ${this.description ? html`<span class="civ-block civ-text-sm civ-text-base-dark">${this.description}</span>` : nothing}
    ` : nothing;

    const inner = html`
      ${icon}
      <span class="civ-flex-1 civ-min-w-0">
        ${headingBlock}
        <span data-civ-list-item-content-slot></span>
      </span>
      ${hasEnd ? html`
        <span class="civ-flex-shrink-0 civ-flex civ-items-center" data-civ-list-item-end-slot></span>
      ` : nothing}
    `;

    if (isLink) {
      return html`
        <li class="civ-list-item">
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
      <li class="civ-list-item">
        <div class="${rowClasses}">${inner}</div>
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
