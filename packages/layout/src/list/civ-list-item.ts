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
 * the entire row becomes a clickable anchor (whole-row click target,
 * hover state, focus ring); otherwise it's a plain `<li>` with the
 * same layout. This lets clickable and static rows sit in the same
 * list with identical visual rhythm.
 *
 * Trailing content (status tag, switch, secondary action) goes in
 * the `end` slot via the `data-list-item-end` attribute on a child.
 *
 * @element civ-list-item
 *
 * @prop {string} href - Optional navigation target. When set, the
 *   entire row is a clickable anchor.
 *
 * @slot - Primary content (label, description, anything).
 * @slot end - Trailing content. Children with the `data-list-item-end`
 *   attribute are routed here.
 *
 * @fires civ-analytics - Analytics tracking event on click (only when href set).
 *
 * @example
 * ```html
 * <civ-list-item href="/personal">
 *   Personal information
 *   <civ-tag data-list-item-end label="Complete" variant="green"></civ-tag>
 * </civ-list-item>
 *
 * <civ-list-item>
 *   Locked task
 *   <civ-tag data-list-item-end label="Cannot start" variant="gray"></civ-tag>
 * </civ-list-item>
 * ```
 */
@customElement('civ-list-item')
export class CivListItem extends LightDomSlotMixin(CivBaseElement) {
  /** Optional navigation target. When set, the row becomes a clickable anchor. */
  @property({ type: String }) href = '';

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
      'civ-flex',
      'civ-justify-between',
      'civ-items-start',
      'civ-gap-4',
      'civ-py-4',
    ].join(' ');

    const linkClasses = [
      rowClasses,
      'civ-no-underline',
      'civ-text-inherit',
      'hover:civ-bg-primary-lightest',
      'focus-visible:civ-focus-ring',
      'civ-transition-colors',
    ].join(' ');

    const inner = html`
      <span class="civ-flex-1 civ-min-w-0" data-civ-list-item-content-slot></span>
      ${hasEnd ? html`
        <span class="civ-flex-shrink-0 civ-flex civ-items-center" data-civ-list-item-end-slot></span>
      ` : nothing}
    `;

    if (isLink) {
      return html`
        <li class="civ-list-item">
          <a href="${this._safeHref}" class="${linkClasses}" @click="${this._onClick}">
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
