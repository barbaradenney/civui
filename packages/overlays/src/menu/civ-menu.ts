import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, clickOutside, t } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Menu
 *
 * Anchored on-page menu — kebab menus, row actions, overflow menus. Composes
 * a slotted trigger with a popup panel of `<civ-menu-item>` children.
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

  private _clickOutside = clickOutside(this, () => this._requestClose());
  private _boundOnKeydown = this._onKeydown.bind(this);
  private _wired = false;

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-menu-trigger': '[data-civ-menu-trigger-slot]',
      default: '[data-civ-menu-panel-content]',
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundOnKeydown);
  }

  override firstUpdated(): void {
    this._relocateSlots();
    this._wireTrigger();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundOnKeydown);
    this._clickOutside.remove();
    this._unwireTrigger();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('open')) {
      this._syncOpenState();
    }
  }

  override render() {
    const open = this.open;
    const panelClasses = [
      'civ-menu__panel',
      'civ-bottom-sheet',
      `civ-menu__panel--align-${this.align}`,
      open ? 'civ-menu__panel--open' : '',
    ].filter(Boolean).join(' ');

    return html`
      <span class="civ-menu__trigger" data-civ-menu-trigger-slot></span>
      ${open ? html`<div class="civ-menu__backdrop" @click="${this._onBackdropClick}"></div>` : nothing}
      <div
        class="${panelClasses}"
        role="menu"
        aria-label="${this.label || t('menuLabel')}"
        ?hidden="${!open}"
        data-civ-menu-panel-content
        @click="${this._onPanelClick}"
      ></div>
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

  private _getTrigger(): HTMLElement | null {
    const slotted = this._getSlottedChildren('data-civ-menu-trigger');
    for (const node of slotted) {
      if (node instanceof HTMLElement) return node;
    }
    return null;
  }

  private _getItems(): HTMLElement[] {
    const panel = this.querySelector('[data-civ-menu-panel-content]');
    if (!panel) return [];
    return Array.from(
      panel.querySelectorAll<HTMLElement>(':scope > civ-menu-item:not([disabled])'),
    );
  }

  private _wireTrigger(): void {
    if (this._wired) return;
    const trigger = this._getTrigger();
    if (!trigger) return;
    trigger.addEventListener('click', this._onTriggerClick);
    trigger.addEventListener('keydown', this._onTriggerKeydown);
    if (!trigger.hasAttribute('aria-haspopup')) {
      trigger.setAttribute('aria-haspopup', 'menu');
    }
    trigger.setAttribute('aria-expanded', String(this.open));
    this._wired = true;
  }

  private _unwireTrigger(): void {
    const trigger = this._getTrigger();
    if (!trigger) return;
    trigger.removeEventListener('click', this._onTriggerClick);
    trigger.removeEventListener('keydown', this._onTriggerKeydown);
    this._wired = false;
  }

  private _onTriggerClick = (e: Event): void => {
    e.stopPropagation();
    if (this.open) {
      this._requestClose();
    } else {
      this._requestOpen();
    }
  };

  private _onTriggerKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._requestOpen(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const items = this._getItems();
      this._requestOpen(items.length - 1);
    }
  };

  private _onBackdropClick = (): void => {
    this._requestClose();
  };

  private _onPanelClick(e: Event): void {
    const target = e.target as HTMLElement;
    const item = target.closest('civ-menu-item') as HTMLElement | null;
    if (!item) return;
    if (item.hasAttribute('disabled')) return;
    if (item.closest('civ-menu') !== this) return;
    const items = this._getItems();
    const index = items.indexOf(item);
    const value = item.getAttribute('value') ?? undefined;
    dispatch(this, 'civ-menu-select', { value, index });
    this._requestClose(true);
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this._requestClose(true);
      return;
    }
    if (e.key === 'Tab') {
      this._requestClose();
      return;
    }
    const items = this._getItems();
    if (items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._activeIndex = (this._activeIndex + 1) % items.length;
      items[this._activeIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._activeIndex = (this._activeIndex - 1 + items.length) % items.length;
      items[this._activeIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._activeIndex = 0;
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      this._activeIndex = items.length - 1;
      items[items.length - 1]?.focus();
    }
  }

  private _requestOpen(focusIndex = 0): void {
    if (this.open) return;
    this._activeIndex = focusIndex;
    this.open = true;
    dispatch(this, 'civ-menu-open');
  }

  private _requestClose(returnFocus = false): void {
    if (!this.open) return;
    this.open = false;
    this._activeIndex = -1;
    dispatch(this, 'civ-menu-close');
    if (returnFocus) {
      const trigger = this._getTrigger();
      trigger?.focus?.();
    }
  }

  private async _syncOpenState(): Promise<void> {
    const trigger = this._getTrigger();
    trigger?.setAttribute('aria-expanded', String(this.open));

    if (this.open) {
      this._clickOutside.add();
      await this.updateComplete;
      const items = this._getItems();
      if (items.length && this._activeIndex >= 0) {
        items[Math.min(this._activeIndex, items.length - 1)]?.focus();
      }
    } else {
      this._clickOutside.remove();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-menu': CivMenu;
  }
}
