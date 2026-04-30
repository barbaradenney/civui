import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, renderError } from '@civui/core';
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
 * Three slot zones: start (leading content like icons), default (body),
 * and end (trailing content like badges or action buttons).
 *
 * @element civ-list-item
 *
 * @prop {string} href - Optional navigation target.
 * @prop {boolean} current - Mark as current page (`aria-current="page"`).
 * @prop {string} heading - Bold heading text.
 * @prop {string} description - Secondary text below the heading.
 * @prop {string} error - Error text below content (uses shared renderError from core).
 *
 * @slot start - Leading content via `data-list-item-start` attribute (icons, avatars, thumbnails).
 * @slot - Primary content. When `heading` is set, slot content renders after heading/description.
 * @slot end - Trailing content via `data-list-item-end` attribute (badges, action buttons).
 *
 * @fires civ-analytics - Analytics tracking on click (when href set).
 *
 * @example
 * ```html
 * <civ-list-item href="/claims" heading="My claims" description="3 active">
 *   <civ-icon data-list-item-start name="edit"></civ-icon>
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

  /** Bold heading text. */
  @property({ type: String }) heading = '';

  /** Secondary text below the heading. */
  @property({ type: String }) description = '';

  /** Error text below the content. Uses the shared renderError pattern from core. */
  @property({ type: String }) error = '';

  override _getSlotConfig(): SlotConfig {
    return {
      'data-list-item-start': '[data-civ-list-item-start-slot]',
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

    const headingBlock = this.heading ? html`
      <span class="civ-block civ-font-bold">${this.heading}</span>
      ${this.description ? html`<span class="civ-block civ-text-sm civ-text-base-dark">${this.description}</span>` : nothing}
    ` : nothing;

    const inner = html`
      ${hasStart ? html`
        <span class="civ-flex-shrink-0 civ-flex civ-items-center" data-civ-list-item-start-slot></span>
      ` : nothing}
      <span class="civ-flex-1 civ-min-w-0">
        ${headingBlock}
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
