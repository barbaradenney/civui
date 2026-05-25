import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin, dispatch, clickOutside, generateId } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Popover
 *
 * Low-level popover primitive: a trigger button anchored to a floating panel.
 * Handles the scaffolding every "popup from a trigger" component needs:
 *
 * - Slotted trigger with auto-wired `aria-haspopup`, `aria-expanded`,
 *   `aria-controls`.
 * - Click-to-toggle on the trigger; programmatic `open` property.
 * - Click-outside, Escape, and (optionally) Tab close — with focus return
 *   to the trigger.
 * - JS-computed panel position with viewport-aware auto-flip (above/below,
 *   start/end), re-computed on resize and scroll-ancestor scroll.
 * - Mobile bottom-sheet pattern (≤480px) via the shared `.civ-bottom-sheet`
 *   rule — backdrop appears, panel pins to the viewport bottom, JS
 *   placement is skipped.
 *
 * **No semantics.** civ-popover doesn't choose a role for the panel or
 * pick keyboard navigation between children — that's the consumer's job.
 * Use the `panel-role` prop to declare the panel's ARIA role
 * (`menu`, `group`, `dialog`, `listbox`, etc.) and slot whatever children
 * the higher-level component needs. `civ-menu` and `civ-column-visibility`
 * both compose this primitive and add their own item rendering and
 * keyboard model on top.
 *
 * @element civ-popover
 *
 * @prop {boolean} open - Controlled open state. Reflects to the `open` attribute.
 * @prop {string} label - Accessible name applied to the panel (`aria-label`).
 * @prop {'start' | 'end'} align - Horizontal alignment hint; auto-flips when it would clip the viewport edge.
 * @prop {string} panelRole - ARIA role applied to the panel. Defaults to `dialog`. Set to `menu`, `group`, `listbox`, etc. to match the panel's semantics.
 * @prop {string} triggerHaspopup - Value for `aria-haspopup` on the trigger. Defaults to `true`. Set to `menu` for a single-select menu, `dialog` / `listbox` to match the panel.
 * @prop {boolean} noTabClose - Disable closing on Tab. Default false (Tab closes — matches the menu pattern). Set true when the panel contains naturally-tabbable items (checkboxes, form controls) so the user can Tab between them without dismissing the popover.
 * @prop {boolean} noClickOutsideClose - Disable click-outside close. Default false.
 * @prop {boolean} noEscapeClose - Disable Escape close. Default false.
 *
 * @fires civ-open - When the popover opens.
 * @fires civ-close - When the popover closes.
 * @fires civ-popover-trigger-arrow - When ArrowDown / ArrowUp is pressed on the trigger. `detail.direction` is `'down'` or `'up'`. Composers (civ-menu) use this to pre-focus the first / last item once the panel renders.
 *
 * @slot data-civ-popover-trigger - The activator. Must be a focusable element (typically `<button>` or `<civ-button>`). The popover auto-wires click + keyboard handlers and ARIA on it.
 * @slot - Default slot: the panel content.
 *
 * @example
 * ```html
 * <civ-popover panel-role="dialog" label="Filter results">
 *   <button data-civ-popover-trigger>Filters</button>
 *   <div class="filter-list">...</div>
 * </civ-popover>
 * ```
 */
@customElement('civ-popover')
export class CivPopover extends LightDomSlotMixin(CivBaseElement) {
  /**
   * Whether the popover panel is currently visible.
   *
   * Implemented as an accessor pair so EVERY transition — user click,
   * programmatic `popover.open = true`, the public `openPopover()` /
   * `closePopover()` methods, lit-html `.open=${flag}` two-way binding
   * — dispatches `civ-open` / `civ-close` synchronously. The previous
   * shape only dispatched from the private `_requestOpen` /
   * `_requestClose` helpers (the user-input paths), which broke
   * controlled patterns where a parent component flips `open`
   * programmatically and listens for the event to update its own state.
   */
  @property({ type: Boolean, reflect: true })
  get open(): boolean { return this._openState; }
  set open(value: boolean) {
    const old = this._openState;
    if (old === value) return;
    this._openState = value;
    this.requestUpdate('open', old);
    // Explicit branches (rather than a ternary on the event name) so the
    // schema-parity Lit-event parser recognizes both dispatch sites.
    if (value) dispatch(this, 'civ-open');
    else dispatch(this, 'civ-close');
  }
  private _openState = false;

  @property({ type: String }) label = '';
  @property({ type: String }) align: 'start' | 'end' = 'end';
  @property({ type: String, attribute: 'panel-role' }) panelRole = 'dialog';
  @property({ type: String, attribute: 'trigger-haspopup' }) triggerHaspopup = 'true';
  @property({ type: Boolean, attribute: 'no-tab-close' }) noTabClose = false;
  @property({ type: Boolean, attribute: 'no-click-outside-close' }) noClickOutsideClose = false;
  @property({ type: Boolean, attribute: 'no-escape-close' }) noEscapeClose = false;

  private _panelId = generateId('civ-popover-panel');
  private _clickOutside = clickOutside(this, () => this._requestClose());
  private _boundOnKeydown = this._onKeydown.bind(this);
  private _boundOnReflow = this._repositionPanel.bind(this);
  /** Reference to the focusable trigger we've wired listeners + ARIA on. */
  private _wiredTrigger: HTMLElement | null = null;
  /**
   * Watches the trigger slot for changes. The slot starts empty after
   * civ-popover's first render and may be populated asynchronously by
   * a higher-level composer (civ-menu, civ-column-visibility relocate
   * the authored trigger into the slot via their own
   * `LightDomSlotMixin` lifecycle) — so we can't rely on `firstUpdated`
   * alone to find the trigger. The observer rewires ARIA + listeners
   * whenever the focusable element identity changes.
   */
  private _triggerSlotObserver: MutationObserver | null = null;
  /** Scrollable ancestors we've attached reflow listeners to during open. */
  private _scrollAncestors: Element[] = [];

  override _getSlotConfig(): SlotConfig {
    return {
      'data-civ-popover-trigger': '[data-civ-popover-trigger-slot]',
      default: '[data-civ-popover-panel-content]',
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._boundOnKeydown);
  }

  override firstUpdated(): void {
    this._relocateSlots();
    this._wireTrigger();
    this._observeTriggerSlot();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._boundOnKeydown);
    this._clickOutside.remove();
    this._detachReflowListeners();
    this._unwireTrigger();
    this._triggerSlotObserver?.disconnect();
    this._triggerSlotObserver = null;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('open')) {
      this._syncOpenState();
    } else if (changed.has('noClickOutsideClose') && this.open) {
      // `_syncOpenState` runs only on open changes, so a mid-open flip
      // of `noClickOutsideClose` wouldn't otherwise add or remove the
      // document listener. Keep them in sync here.
      if (this.noClickOutsideClose) this._clickOutside.remove();
      else this._clickOutside.add();
    }
    // Re-evaluate the trigger on every render so ARIA reflects the
    // current `open` value and the current `triggerHaspopup` setting.
    this._wireTrigger();
  }

  override render() {
    const open = this.open;
    const panelClasses = [
      'civ-popover__panel',
      'civ-bottom-sheet',
      `civ-popover__panel--align-${this.align}`,
      open ? 'civ-popover__panel--open' : '',
    ].filter(Boolean).join(' ');

    return html`
      <span class="civ-popover__trigger" data-civ-popover-trigger-slot></span>
      ${open ? html`<div class="civ-popover__backdrop" @click="${this._onBackdropClick}"></div>` : nothing}
      <div
        id="${this._panelId}"
        class="${panelClasses}"
        role="${this.panelRole}"
        aria-label="${this.label || nothing}"
        ?hidden="${!open}"
        data-civ-popover-panel-content
      ></div>
    `;
  }

  /** Programmatic open. Returns immediately if already open. */
  public openPopover(): void {
    if (this.open) return;
    this.open = true;
  }

  /** Programmatic close. Returns immediately if already closed. */
  public closePopover(): void {
    if (!this.open) return;
    this.open = false;
  }

  /**
   * The focusable trigger element. ARIA must land on the focusable
   * element so screen-reader users hear the popup affordance on the
   * thing they're focused on. When the slotted trigger is a native
   * `<button>` it IS the focusable; when it's a custom element like
   * `civ-button` whose internal render produces a `<button>`, we walk
   * down to find that inner button.
   *
   * Looked up live (not cached) so it survives re-renders of higher-
   * level components like civ-menu that re-template the trigger slot.
   */
  private _getTrigger(): HTMLElement | null {
    const slot = this.querySelector('[data-civ-popover-trigger-slot]');
    if (!slot) return null;
    // Native focusable inside the slot (button, a[href], input,
    // [tabindex>=0]).
    const focusable = slot.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable) return focusable;
    // Fall back to the first element child (a custom element that's
    // not yet rendered its focusable inner — uncommon, but lets a
    // bare consumer-supplied wrapper still get ARIA wiring).
    return slot.firstElementChild as HTMLElement | null;
  }

  /**
   * Wire (or re-wire) ARIA + listeners on the current focusable trigger.
   * Idempotent against the same element; tears down listeners + ARIA
   * on the previously-wired element when the focusable changes (e.g.
   * when a higher-level component relocates the authored trigger into
   * our slot after our own firstUpdated has already run, so the slot
   * wrapper temporarily looked like the trigger). Safe to call from
   * `firstUpdated`, `updated`, and the MutationObserver callback alike.
   */
  private _wireTrigger(): void {
    const trigger = this._getTrigger();
    if (trigger !== this._wiredTrigger) {
      if (this._wiredTrigger) {
        this._wiredTrigger.removeEventListener('click', this._onTriggerClick);
        this._wiredTrigger.removeEventListener('keydown', this._onTriggerKeydown);
        this._wiredTrigger.removeAttribute('aria-haspopup');
        this._wiredTrigger.removeAttribute('aria-expanded');
        this._wiredTrigger.removeAttribute('aria-controls');
      }
      this._wiredTrigger = trigger;
      if (trigger) {
        trigger.addEventListener('click', this._onTriggerClick);
        trigger.addEventListener('keydown', this._onTriggerKeydown);
      }
    }
    if (!trigger) return;
    if (trigger.getAttribute('aria-haspopup') !== this.triggerHaspopup) {
      trigger.setAttribute('aria-haspopup', this.triggerHaspopup);
    }
    const expanded = String(this.open);
    if (trigger.getAttribute('aria-expanded') !== expanded) {
      trigger.setAttribute('aria-expanded', expanded);
    }
    if (trigger.getAttribute('aria-controls') !== this._panelId) {
      trigger.setAttribute('aria-controls', this._panelId);
    }
  }

  private _unwireTrigger(): void {
    if (!this._wiredTrigger) return;
    this._wiredTrigger.removeEventListener('click', this._onTriggerClick);
    this._wiredTrigger.removeEventListener('keydown', this._onTriggerKeydown);
    this._wiredTrigger = null;
  }

  /**
   * Watch the trigger slot for DOM changes. Higher-level composers
   * (civ-menu, civ-column-visibility) relocate the authored trigger
   * into our trigger slot from their own `firstUpdated` — after our
   * own `firstUpdated` has already run. Without this observer the
   * trigger would never get its ARIA wiring or click handlers.
   *
   * `subtree: true` because the focusable element can be nested deep
   * inside a custom element (e.g. civ-button → inner `<button>`).
   */
  private _observeTriggerSlot(): void {
    const slot = this.querySelector('[data-civ-popover-trigger-slot]');
    if (!slot) return;
    this._triggerSlotObserver?.disconnect();
    this._triggerSlotObserver = new MutationObserver(() => this._wireTrigger());
    this._triggerSlotObserver.observe(slot, {
      childList: true,
      subtree: true,
    });
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
    // Enter / Space already activate the native button — let the click
    // path open the popover. ArrowDown / ArrowUp are common alternate
    // openers (matches the WAI-ARIA Menu Button pattern); higher-level
    // consumers (civ-menu) can do more with focusIndex after open.
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this._requestOpen();
      dispatch(this, 'civ-popover-trigger-arrow', { direction: e.key === 'ArrowDown' ? 'down' : 'up' });
    }
  };

  private _onBackdropClick = (): void => {
    this._requestClose();
  };

  private _onKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    if (e.key === 'Escape' && !this.noEscapeClose) {
      e.preventDefault();
      this._requestClose(true);
      return;
    }
    if (e.key === 'Tab' && !this.noTabClose) {
      this._requestClose();
    }
  }

  /**
   * Internal helpers for user-initiated transitions. The actual
   * `civ-open` / `civ-close` event dispatch lives in the `open`
   * setter (above) so programmatic property assignment dispatches
   * the same events these helpers used to fire eagerly.
   */
  private _requestOpen(): void {
    if (this.open) return;
    this.open = true;
  }

  private _requestClose(returnFocus = false): void {
    if (!this.open) return;
    this.open = false;
    if (returnFocus) {
      const trigger = this._getTrigger();
      trigger?.focus?.();
    }
  }

  private async _syncOpenState(): Promise<void> {
    // ARIA `aria-expanded` is reflected in `_wireTrigger`, which runs
    // in `updated()` after this method on every property change.

    if (this.open) {
      if (!this.noClickOutsideClose) this._clickOutside.add();
      await this.updateComplete;
      this._repositionPanel();
      this._attachReflowListeners();
    } else {
      this._clickOutside.remove();
      this._detachReflowListeners();
      this._clearPanelPlacement();
    }
  }

  /**
   * Compute the panel's viewport position and apply inline top/left
   * styles. The CSS sets `position: fixed` so the panel escapes any
   * overflow / transform ancestor (the data-grid scroll wrapper is the
   * common offender — row-action menus were clipped before this).
   *
   * **Auto-flip:** if the preferred horizontal alignment would clip the
   * viewport edge (panel exceeds the right edge with `align='start'`,
   * or extends past the left edge with `align='end'`), the positioner
   * flips to the opposite side. The same logic applies vertically: the
   * panel prefers to render below the trigger, but flips above when
   * there's more room there.
   *
   * **Mobile:** the bottom-sheet rule (`.civ-bottom-sheet` at ≤480px)
   * pins the panel to the viewport bottom and owns its own positioning.
   * Skip the JS placement so inline styles don't fight the CSS.
   */
  private _repositionPanel(): void {
    if (!this.open) return;
    const panel = this.querySelector<HTMLElement>('.civ-popover__panel');
    const trigger = this._getTrigger();
    if (!panel || !trigger) return;

    // Mobile bottom-sheet — CSS owns positioning. Clear any inline
    // styles we may have set from a previous desktop render and bail.
    // jsdom doesn't implement matchMedia, so guard the call before we
    // ask about the viewport width.
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 480px)').matches
    ) {
      this._clearPanelPlacement();
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;
    const gap = 4;

    // The panel is `display: block` once open, so dimensions are
    // measurable. Clear previous inline styles first so measurement
    // reflects the natural size at this viewport, not a stale offset.
    panel.style.top = '';
    panel.style.left = '';
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;

    // Vertical placement: prefer below the trigger; flip above when
    // there's more room there. Clamp to viewport so the panel never
    // hangs off the top/bottom even if both sides are tight.
    const spaceBelow = vh - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;
    let top: number;
    if (spaceBelow >= panelHeight + gap || spaceBelow >= spaceAbove) {
      top = triggerRect.bottom + gap;
    } else {
      top = triggerRect.top - panelHeight - gap;
    }
    top = Math.max(margin, Math.min(top, vh - panelHeight - margin));

    // Horizontal placement: `align='end'` (default) anchors the panel's
    // right edge to the trigger's right edge — panel extends leftward.
    // `align='start'` is the mirror. Flip when the preferred side would
    // clip past the viewport edge.
    const endLeft = triggerRect.right - panelWidth;
    const startLeft = triggerRect.left;
    let left: number;
    if (this.align === 'end') {
      left = endLeft >= margin ? endLeft : startLeft;
    } else {
      left = startLeft + panelWidth <= vw - margin ? startLeft : endLeft;
    }
    left = Math.max(margin, Math.min(left, vw - panelWidth - margin));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  private _clearPanelPlacement(): void {
    const panel = this.querySelector<HTMLElement>('.civ-popover__panel');
    if (!panel) return;
    panel.style.top = '';
    panel.style.left = '';
  }

  /**
   * Attach reflow listeners on every scrollable ancestor + the window
   * itself. When any of them scroll or the viewport resizes, recompute
   * the panel position so it stays glued to the trigger. `{ passive: true }`
   * because we never preventDefault.
   */
  private _attachReflowListeners(): void {
    window.addEventListener('resize', this._boundOnReflow, { passive: true });
    window.addEventListener('scroll', this._boundOnReflow, { passive: true });
    let node: Element | null = this.parentElement;
    while (node) {
      const overflow = getComputedStyle(node).overflow;
      if (/auto|scroll|hidden/.test(overflow)) {
        node.addEventListener('scroll', this._boundOnReflow, { passive: true });
        this._scrollAncestors.push(node);
      }
      node = node.parentElement;
    }
  }

  private _detachReflowListeners(): void {
    window.removeEventListener('resize', this._boundOnReflow);
    window.removeEventListener('scroll', this._boundOnReflow);
    for (const node of this._scrollAncestors) {
      node.removeEventListener('scroll', this._boundOnReflow);
    }
    this._scrollAncestors = [];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-popover': CivPopover;
  }
}
