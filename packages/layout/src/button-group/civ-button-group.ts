import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import '@civui/actions/button';
import '@civui/overlays/popover';

/**
 * Lightweight projection of a button child captured for the
 * overflow menu. The original element stays in the toolbar (hidden);
 * the menu item is a proxy that re-dispatches a click on it.
 */
interface OverflowItem {
  /** Index into the toolbar's content children — used to dispatch the synthetic click. */
  index: number;
  label: string;
  icon: string;
  href: string;
  disabled: boolean;
}

/**
 * CivUI Button Group
 *
 * Joins adjacent action buttons into a connected toolbar. Removes
 * inner border-radius so buttons sit flush together.
 *
 * Optionally collapses trailing buttons into a "More" popover-menu
 * when the toolbar overflows its container width. Opt in with
 * `allow-overflow`; horizontal orientation only.
 *
 * @element civ-button-group
 *
 * @prop {'horizontal' | 'vertical'} orientation - Layout direction
 * @prop {string} label - **Strongly recommended.** Accessible name for the
 *   toolbar (`aria-label`). `role="toolbar"` requires a name per WAI-ARIA;
 *   without one, AT users navigating by landmark see an unnamed toolbar.
 *   Omit only when the surrounding context (e.g. an outer `<section
 *   aria-label="…">`) already names the group.
 * @prop {boolean} allowOverflow - Opt-in. When set on a horizontal group,
 *   measure available width on mount + resize and collapse trailing
 *   buttons that don't fit into a "More" menu (composed from civ-popover
 *   + civ-menu). The collapsed buttons stay in the DOM (hidden in the
 *   toolbar layer) so author-attached event listeners keep firing.
 * @prop {string} overflowLabel - Accessible name for the More button.
 *   Defaults to the localized "More" string.
 * @prop {string} overflowIcon - Icon on the More button. Defaults to
 *   `more-horiz`.
 *
 * @example
 * ```html
 * <civ-button-group label="Text formatting">
 *   <civ-action-button label="Bold"></civ-action-button>
 *   <civ-action-button label="Italic"></civ-action-button>
 *   <civ-action-button label="Underline"></civ-action-button>
 * </civ-button-group>
 * ```
 */
@customElement('civ-button-group')
export class CivButtonGroup extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  @property({ type: String }) label = '';
  @property({ type: Boolean, attribute: 'allow-overflow' }) allowOverflow = false;
  @property({ type: String, attribute: 'overflow-label' }) overflowLabel = '';
  @property({ type: String, attribute: 'overflow-icon' }) overflowIcon = 'more-horiz';

  /** Items that have been collapsed into the overflow menu. */
  @state() private _overflowItems: OverflowItem[] = [];

  /** Width reserved for the "More" trigger; cached after first render. */
  private _moreButtonWidth = 0;

  /** Width of each toolbar child (in source order). Captured once per measure. */
  private _childWidths: number[] = [];

  private _resizeObserver?: ResizeObserver;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-button-group-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
    if (this._overflowEligible()) {
      this._resizeObserver = new ResizeObserver(() => this._scheduleMeasure());
      this._resizeObserver.observe(this);
      // First measure runs after slot relocation + initial paint so child
      // widths are accurate. `requestAnimationFrame` gives the browser a
      // tick to compute layout.
      requestAnimationFrame(() => this._measure());
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    if (this._measureTimer !== undefined) {
      clearTimeout(this._measureTimer);
      this._measureTimer = undefined;
    }
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated?.(changed);
    if (changed.has('allowOverflow') || changed.has('orientation')) {
      if (this._overflowEligible() && !this._resizeObserver) {
        this._resizeObserver = new ResizeObserver(() => this._scheduleMeasure());
        this._resizeObserver.observe(this);
        requestAnimationFrame(() => this._measure());
      } else if (!this._overflowEligible() && this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = undefined;
        this._overflowItems = [];
        this._resetHiddenChildren();
      }
    }
  }

  private _overflowEligible(): boolean {
    return this.allowOverflow && this.orientation === 'horizontal';
  }

  /**
   * Force a re-measure. Call after async DOM changes (permission gating
   * adds or removes buttons) when ResizeObserver's container-width
   * observation isn't enough.
   */
  recompute(): void {
    if (this._overflowEligible()) this._measure();
  }

  private _measureTimer?: ReturnType<typeof setTimeout>;

  private _scheduleMeasure(): void {
    // Debounce so a continuous drag-resize doesn't thrash overflow state.
    if (this._measureTimer !== undefined) clearTimeout(this._measureTimer);
    this._measureTimer = setTimeout(() => {
      this._measureTimer = undefined;
      this._measure();
    }, 80);
  }

  private _toolbarContent(): HTMLElement | null {
    return this.querySelector<HTMLElement>('[data-civ-button-group-content]');
  }

  private _toolbarChildren(): HTMLElement[] {
    const content = this._toolbarContent();
    if (!content) return [];
    return Array.from(content.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && !c.hasAttribute('data-civ-more-button'),
    );
  }

  /** Reveal everything in the toolbar (called when overflow is turned off). */
  private _resetHiddenChildren(): void {
    for (const child of this._toolbarChildren()) {
      child.removeAttribute('data-civ-overflow');
    }
  }

  private _measure(): void {
    const content = this._toolbarContent();
    if (!content) return;

    const children = this._toolbarChildren();
    if (children.length === 0) {
      this._overflowItems = [];
      return;
    }

    // Reveal all children before measuring so the widths reflect their
    // unhidden sizes. Otherwise a previously-hidden child reports 0 and
    // we'd never re-promote it back into the toolbar on widen.
    for (const child of children) child.removeAttribute('data-civ-overflow');

    // Capture per-child widths once. offsetWidth includes border but not
    // margin; getBoundingClientRect plus the parent's column-gap would
    // be more precise but flex's gap is already accounted for by
    // measuring the parent's content-box width against the SUM of child
    // widths plus (n-1) * gap. For toolbars where gap is 0 (the flush
    // connected-button case is our default), this is exact.
    this._childWidths = children.map((c) => c.getBoundingClientRect().width);

    const containerWidth = this.getBoundingClientRect().width;
    const totalChildWidth = this._childWidths.reduce((s, w) => s + w, 0);

    // If everything fits, no overflow.
    if (totalChildWidth <= containerWidth) {
      this._overflowItems = [];
      return;
    }

    // Reserve space for the More button. First time through we render
    // it via a state flip and re-measure to cache the width.
    if (this._moreButtonWidth === 0) {
      this._overflowItems = [
        {
          index: children.length - 1,
          label: this._labelFor(children[children.length - 1]),
          icon: this._iconFor(children[children.length - 1]),
          href: this._hrefFor(children[children.length - 1]),
          disabled: children[children.length - 1].hasAttribute('disabled'),
        },
      ];
      // After the next render, _captureMoreButtonWidth runs and we
      // re-measure with the cached width.
      this.updateComplete.then(() => this._captureMoreButtonWidth());
      return;
    }

    // Walk left→right packing children until adding the NEXT one would
    // overflow once the More-button width is reserved.
    const budget = containerWidth - this._moreButtonWidth;
    let used = 0;
    let firstOverflow = -1;
    for (let i = 0; i < children.length; i++) {
      const w = this._childWidths[i];
      if (used + w > budget) {
        firstOverflow = i;
        break;
      }
      used += w;
    }

    if (firstOverflow === -1) {
      // Edge case: every child fits within the budget, which means
      // we're actually under the no-More container width (re-measure
      // is consistent — clear overflow).
      this._overflowItems = [];
      return;
    }

    const overflow: OverflowItem[] = [];
    for (let i = firstOverflow; i < children.length; i++) {
      const child = children[i];
      child.setAttribute('data-civ-overflow', '');
      overflow.push({
        index: i,
        label: this._labelFor(child),
        icon: this._iconFor(child),
        href: this._hrefFor(child),
        disabled: child.hasAttribute('disabled'),
      });
    }
    this._overflowItems = overflow;
  }

  private _captureMoreButtonWidth(): void {
    const more = this.querySelector<HTMLElement>('[data-civ-more-button]');
    if (!more) return;
    this._moreButtonWidth = more.getBoundingClientRect().width;
    // Re-run the real measurement on the next frame so Lit can flush
    // any pending updates from the previous render cycle before we
    // mutate `_overflowItems` again.
    requestAnimationFrame(() => this._measure());
  }

  private _labelFor(child: HTMLElement): string {
    return child.getAttribute('label') || child.textContent?.trim() || '';
  }

  private _iconFor(child: HTMLElement): string {
    return child.getAttribute('icon-start') || child.getAttribute('icon') || '';
  }

  private _hrefFor(child: HTMLElement): string {
    return child.getAttribute('href') || '';
  }

  private _onOverflowSelect(item: OverflowItem): void {
    const children = this._toolbarChildren();
    const target = children[item.index];
    if (!target || target.hasAttribute('disabled')) return;
    // For link buttons, the menu-item is itself an <a href> — the
    // browser handles navigation directly. We still proxy click so
    // any JS-attached click listener on the original fires.
    target.click();
  }

  override render() {
    const classes = this.orientation === 'vertical'
      ? 'civ-button-group--vertical'
      : 'civ-button-group';

    const moreLabel = this.overflowLabel || t('buttonGroupOverflowLabel') || 'More';
    const hasOverflow = this._overflowItems.length > 0;

    return html`
      <div
        class="${classes}"
        role="toolbar"
        aria-label="${ifDefined(this.label || undefined)}"
        aria-orientation="${this.orientation}"
        data-civ-button-group-content
      ></div>
      ${hasOverflow ? html`
        <civ-popover panel-role="group" trigger-haspopup="true" label="${moreLabel}" no-tab-close data-civ-more-popover>
          <civ-button
            data-civ-popover-trigger
            data-civ-more-button
            variant="secondary"
            icon-start="${this.overflowIcon}"
            label="${moreLabel}"
            icon-only
          ></civ-button>
          <div class="civ-button-group__overflow-panel">
            ${this._overflowItems.map((item) => html`
              <civ-button
                class="civ-button-group__overflow-item"
                variant="tertiary"
                label="${item.label}"
                icon-start="${item.icon || nothing}"
                href="${item.href || nothing}"
                ?disabled="${item.disabled}"
                @click="${() => this._onOverflowSelect(item)}"
              ></civ-button>
            `)}
          </div>
        </civ-popover>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-button-group': CivButtonGroup;
  }
}
