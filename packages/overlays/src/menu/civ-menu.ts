import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, resolveGroupNavIndex, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import '../popover/civ-popover.js';

/**
 * CivUI Menu
 *
 * Anchored on-page menu — kebab menus, row actions, overflow menus. Composes
 * a slotted trigger with a popup panel of `<civ-menu-item>` children.
 *
 * **Built on `civ-popover`.** All the trigger / panel / click-outside /
 * positioning / mobile-sheet scaffolding lives in `civ-popover`. civ-menu
 * adds the menu-specific layer on top: the `role="menu"` semantics,
 * arrow-key navigation between items, and close-on-activation. If you
 * need a multi-select panel instead (column toggles, filter checkboxes),
 * compose `civ-popover` directly with `panel-role="group"` — see
 * `civ-column-visibility` for the canonical example.
 *
 * Renders as an anchored popover on desktop (≥481px) and as a bottom sheet
 * on mobile (≤480px), per the project-wide mobile-popup rule.
 *
 * **Keyboard semantics** (WAI-ARIA Menu Button pattern):
 * - Enter / Space / ArrowDown on trigger → opens menu, focuses first item
 * - ArrowUp / ArrowDown move between items (wrapping)
 * - Home / End jump to first / last
 * - Escape closes and returns focus to trigger
 * - Tab also closes (mirrors native `<select>` behavior)
 * - Activating an item closes the menu and returns focus to trigger
 *
 * @element civ-menu
 *
 * @prop {boolean} open - Controlled open state. When omitted the menu manages its own open state.
 * @prop {string} label - Accessible name for the menu (aria-label on the menuitem container). Strongly recommended.
 * @prop {'start' | 'end'} align - Horizontal alignment of the panel relative to the trigger. Defaults to 'end' (right-aligned).
 *
 * @fires civ-menu-open - When the menu opens
 * @fires civ-menu-close - When the menu closes
 * @fires civ-menu-select - When a menu item is activated. detail: { value?: string, index: number }
 *
 * @slot data-civ-menu-trigger - The activator. Must be a focusable element (typically `<civ-button>` or `<button>`).
 * @slot - Menu items (`<civ-menu-item>` children).
 *
 * @example
 * ```html
 * <civ-menu label="Row actions">
 *   <civ-button data-civ-menu-trigger variant="tertiary" icon="more" icon-only label="More"></civ-button>
 *   <civ-menu-item value="edit">Edit</civ-menu-item>
 *   <civ-menu-item value="duplicate">Duplicate</civ-menu-item>
 *   <civ-menu-item value="delete" destructive>Delete</civ-menu-item>
 * </civ-menu>
 * ```
 */
@customElement('civ-menu')
export class CivMenu extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) label = '';
  @property({ type: String }) align: 'start' | 'end' = 'end';

  @state() private _activeIndex = -1;
  /**
   * Initial focus index requested by ArrowDown / ArrowUp on the closed
   * trigger, consumed after the panel renders. Stored as a literal:
   *   - `'first'` → focus items[0]
   *   - `'last'`  → focus items[items.length - 1]
   *   - `null`    → default to items[0]
   *
   * Ordering invariant: `_onTriggerArrow` (which sets this) runs in the
   * same synchronous click-handler chain as `_onPopoverOpen` (which
   * reads it after `updateComplete`). Both come from civ-popover's
   * keydown handler, which dispatches `civ-popover-open` *before*
   * `civ-popover-trigger-arrow` — so the read happens after the write
   * because the `updateComplete.then(...)` callback queues behind the
   * remaining synchronous dispatch. Swapping that dispatch order would
   * silently break keyboard focus management; tread carefully.
   */
  private _pendingFocusIndex: 'first' | 'last' | null = null;

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-menu-trigger': '[data-civ-menu-trigger-slot]',
      default: '[data-civ-menu-items]',
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundOnItemKeydown);
  }

  override async firstUpdated(): Promise<void> {
    // Two-level LightDomSlotMixin coordination: the inner civ-popover
    // captures its slot children (the placeholders in our template) in
    // its own connectedCallback, then restores them in its firstUpdated.
    // Both of those happen AFTER our render but BEFORE our firstUpdated
    // returns to the Lit scheduler — so the slot targets we'd query for
    // (`[data-civ-menu-trigger-slot]`, `[data-civ-menu-items]`) are
    // detached at this exact moment. Wait one microtask cycle so the
    // popover finishes restoring its DOM before we try to relocate the
    // authored trigger + items into the now-attached slot targets.
    await Promise.resolve();
    this._relocateSlots();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundOnItemKeydown);
  }

  override render() {
    return html`
      <civ-popover
        ?open="${this.open}"
        align="${this.align}"
        panel-role="menu"
        trigger-haspopup="menu"
        label="${this.label || t('menuLabel')}"
        @civ-popover-open="${this._onPopoverOpen}"
        @civ-popover-close="${this._onPopoverClose}"
        @civ-popover-trigger-arrow="${this._onTriggerArrow}"
      >
        <span data-civ-popover-trigger data-civ-menu-trigger-slot></span>
        <div
          class="civ-menu__items"
          data-civ-menu-items
          @click="${this._onItemsClick}"
        ></div>
      </civ-popover>
    `;
  }

  /** Programmatic open. */
  public openMenu(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Programmatic close. */
  public closeMenu(): void {
    if (!this.open) return;
    this.open = false;
  }

  /**
   * The slotted trigger element (captured via the trigger key), or null
   * when none. The trigger is relocated inside `civ-popover`'s trigger
   * slot at first render — `civ-popover` does the ARIA wiring.
   */
  private _getTrigger(): HTMLElement | null {
    const slotted = this._getSlottedChildren('data-civ-menu-trigger');
    for (const node of slotted) {
      if (node instanceof HTMLElement) return node;
    }
    return null;
  }

  private _getItems(): HTMLElement[] {
    const panel = this.querySelector('[data-civ-menu-items]');
    if (!panel) return [];
    return Array.from(
      panel.querySelectorAll<HTMLElement>(':scope > civ-menu-item:not([disabled])'),
    );
  }

  private _onPopoverOpen = (e: Event): void => {
    e.stopPropagation();
    if (!this.open) {
      this.open = true;
    }
    dispatch(this, 'civ-menu-open');
    // After the panel renders, focus the first item (or whichever index
    // ArrowUp/ArrowDown on the trigger preselected — see the
    // _pendingFocusIndex docstring for the ordering invariant).
    void this.updateComplete.then(() => {
      const items = this._getItems();
      if (!items.length) return;
      const idx = this._pendingFocusIndex === 'last' ? items.length - 1 : 0;
      this._activeIndex = idx;
      this._pendingFocusIndex = null;
      items[idx]?.focus();
    });
  };

  private _onPopoverClose = (e: Event): void => {
    e.stopPropagation();
    if (this.open) {
      this.open = false;
    }
    this._activeIndex = -1;
    dispatch(this, 'civ-menu-close');
  };

  private _onTriggerArrow = (e: Event): void => {
    const detail = (e as CustomEvent<{ direction: 'up' | 'down' }>).detail;
    if (!detail) return;
    this._pendingFocusIndex = detail.direction === 'up' ? 'last' : 'first';
  };

  private _boundOnItemKeydown = this._onItemKeydown.bind(this);

  private _onItemKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    const items = this._getItems();
    if (items.length === 0) return;
    const nextIndex = resolveGroupNavIndex(e.key, this._activeIndex, items.length);
    if (nextIndex === undefined) return;
    e.preventDefault();
    this._activeIndex = nextIndex;
    items[nextIndex]?.focus();
  }

  private _onItemsClick(e: Event): void {
    const target = e.target as HTMLElement;
    const item = target.closest('civ-menu-item') as HTMLElement | null;
    if (!item) return;
    if (item.hasAttribute('disabled')) return;
    if (item.closest('civ-menu') !== this) return;
    const items = this._getItems();
    const index = items.indexOf(item);
    const value = item.getAttribute('value') ?? undefined;
    dispatch(this, 'civ-menu-select', { value, index });
    // Close after selection — single-select menu semantics. Return focus
    // to the trigger for keyboard users.
    this.open = false;
    void this.updateComplete.then(() => {
      const trigger = this._getTrigger();
      trigger?.focus?.();
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-menu': CivMenu;
  }
}
