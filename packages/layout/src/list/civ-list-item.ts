import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, renderError } from '@civui/core';
import type { SlotConfig } from '@civui/core';

export type ListItemStatus = '' | 'success' | 'error' | 'warning' | 'loading';

/** Protocols that are never allowed in link href values. */
const UNSAFE_HREF_PATTERN = /^\s*javascript\s*:/i;

/** Status → icon name mapping. */
const STATUS_ICON: Record<string, string> = {
  success: 'check-circle',
  error: 'error',
  warning: 'warning',
  loading: 'loading',
};

/**
 * CivUI List Item
 *
 * A row inside `<civ-list>`. Renders as `<li>`. When `href` is set,
 * the entire row becomes a clickable anchor; otherwise it's a plain
 * `<li>` with the same layout.
 *
 * @element civ-list-item
 *
 * @prop {string} href - Optional navigation target.
 * @prop {boolean} current - Mark as current page (`aria-current="page"`).
 * @prop {string} iconStart - Leading icon name. Overridden by status icon when status is set.
 * @prop {string} heading - Bold heading text.
 * @prop {string} description - Secondary text below the heading.
 * @prop {ListItemStatus} status - Renders a colored status icon (reuses civ-icon).
 * @prop {string} error - Error text below content (uses shared renderError from core).
 *
 * @slot - Primary content. When `heading` is set, slot content renders after heading/description.
 * @slot end - Trailing content via `data-list-item-end` attribute.
 *
 * @fires civ-analytics - Analytics tracking on click (when href set).
 */
@customElement('civ-list-item')
export class CivListItem extends LightDomSlotMixin(CivBaseElement) {
  /** Optional navigation target. When set, the row becomes a clickable anchor. */
  @property({ type: String }) href = '';

  /** Mark this row as the current page. Sets aria-current="page" on the anchor. */
  @property({ type: Boolean }) current = false;

  /** Leading icon name. Overridden by status icon when status is set. */
  @property({ type: String, attribute: 'icon-start' }) iconStart = '';

  /** Bold heading text. */
  @property({ type: String }) heading = '';

  /** Secondary text below the heading. */
  @property({ type: String }) description = '';

  /** Status — renders a colored status icon automatically. */
  @property({ type: String }) status: ListItemStatus = '';

  /** Error text below the content. Uses the shared renderError pattern from core. */
  @property({ type: String }) error = '';

  override _getSlotConfig(): SlotConfig {
    return {
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

  private get _effectiveIcon(): string {
    if (this.status && STATUS_ICON[this.status]) return STATUS_ICON[this.status];
    return this.iconStart;
  }

  private get _iconColorClass(): string {
    if (this.status === 'success') return 'civ-text-success';
    if (this.status === 'error') return 'civ-text-error';
    if (this.status === 'warning') return 'civ-text-warning';
    return 'civ-text-base';
  }

  override render() {
    const hasEnd = this._hasSlottedChildren('data-list-item-end');
    const isLink = !!this._safeHref;
    const effectiveIcon = this._effectiveIcon;

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

    const icon = effectiveIcon
      ? html`<civ-icon name="${effectiveIcon}" class="civ-flex-shrink-0 ${this._iconColorClass}"></civ-icon>`
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
