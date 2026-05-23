// Schema: packages/schema/src/components/civ-accordion.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';
import type { CivAccordionItem } from './civ-accordion-item.js';

/**
 * CivUI Accordion
 *
 * A grouped stack of full-width expandable rows. Children are
 * `<civ-accordion-item>`. Each item composes the same visual
 * language as `<civ-disclosure>` (chevron caret, 90° rotation on
 * open) but spans the row with a larger tap target.
 *
 * **Default behavior:** multiple items can be open at once. Pass
 * `single` to enforce one-open-at-a-time — when the user opens an
 * item, the parent collapses any other open siblings. The
 * single-open invariant is also enforced on first paint (if multiple
 * items ship with `open`, the parent keeps the first and closes the
 * rest) and when `single` transitions from false to true at runtime.
 *
 * **Keyboard navigation** follows the ARIA APG accordion pattern:
 * when a summary has focus, `ArrowDown` / `ArrowUp` move between
 * item headers (wraps at edges), and `Home` / `End` jump to the
 * first / last item. Disabled items are skipped.
 *
 * **`disabled` cascades** to all direct-child items — both the
 * visual treatment and the behavioral gate (programmatic opens
 * rejected, user-clicks reverted). Individual items can also be
 * disabled independently via their own `disabled` prop.
 *
 * Nested accordions are supported: each `<civ-accordion>` only
 * coordinates the items that are its OWN direct descendants. Events
 * from grandchild items (in a nested accordion) are ignored.
 *
 * The outer wrapper renders a rounded bordered group; items
 * separate with inter-item dividers.
 *
 * @element civ-accordion
 *
 * @prop {boolean} single - When true, opening one item closes any other open siblings
 * @prop {boolean} disabled - Disables every direct-child item — both visually and behaviorally
 * @prop {string} variant - `'tertiary'` (default, bordered list), `'secondary'` (filled action-button palette), or `'primary'` (filled main-button palette, larger/bolder)
 *
 * @slot - One or more `<civ-accordion-item>` children
 *
 * @example
 * ```html
 * <civ-accordion>
 *   <civ-accordion-item label="Eligibility">…</civ-accordion-item>
 *   <civ-accordion-item label="How to apply">…</civ-accordion-item>
 *   <civ-accordion-item label="What to expect">…</civ-accordion-item>
 * </civ-accordion>
 * ```
 */
export type AccordionVariant = 'primary' | 'secondary' | 'tertiary';

@customElement('civ-accordion')
export class CivAccordion extends LightDomSlotMixin(CivBaseElement) {
  /** When true, opening one item closes any other open siblings. */
  @property({ type: Boolean, reflect: true }) single = false;

  /**
   * Disables every direct-child item. Children check their own
   * `disabled` AND the nearest ancestor accordion's `disabled` when
   * deciding whether to accept toggle attempts, so a true value
   * here cascades automatically.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Visual variant. Three levels of prominence:
   *
   * - `'tertiary'` (default) — bordered group with transparent
   *   triggers and inter-item dividers. The quietest, list-like
   *   affordance. Use for FAQ pages, help content, optional detail.
   * - `'secondary'` — each item rendered as a filled
   *   primary-lightest button (matches `civ-action-btn--secondary`'s
   *   palette and chrome scale). Items are separated by gap, no
   *   outer border. Use for navigation-like menus or choose-one
   *   sections where the affordance should read as actionable.
   * - `'primary'` — same palette as `secondary` but with the larger
   *   padding and bolder type of `civ-btn--secondary` (the main
   *   button family). The most prominent variant; use for hub-page
   *   sections or hero CTAs.
   */
  @property({ type: String, reflect: true }) variant: AccordionVariant = 'tertiary';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-accordion-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-accordion-item-toggle', this._onItemToggle as EventListener);
    this.addEventListener('keydown', this._onKeydown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('civ-accordion-item-toggle', this._onItemToggle as EventListener);
    this.removeEventListener('keydown', this._onKeydown);
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // Items may ship pre-authored with `open`. In `single` mode we
    // need to reconcile to one-open-at-a-time on first paint.
    if (this.single) this._enforceSingleOpen();
  }

  /**
   * Reconcile when `single` toggles at runtime. If `disabled`
   * changes, ripple a re-render to every direct-child item so they
   * pick up the new effective-disabled state (`aria-disabled`,
   * `tabindex`, and the setter gate all read the live parent state).
   */
  override updated(changes: Map<PropertyKey, unknown>): void {
    super.updated(changes);
    if (changes.has('single') && this.single && changes.get('single') === false) {
      this._enforceSingleOpen();
    }
    if (changes.has('disabled')) {
      for (const item of this._directChildItems()) {
        item.requestUpdate();
      }
    }
  }

  override render() {
    const variantClass = `civ-accordion__inner--${this.variant}`;
    return html`
      <div class="civ-accordion__inner ${variantClass}" data-civ-accordion-content></div>
    `;
  }

  /**
   * Open every direct-child item. In `single` mode, opens only the
   * first non-disabled item (since "all open" violates the
   * invariant). Disabled items are skipped — the per-item `open`
   * setter rejects programmatic changes while disabled, so a forced
   * `item.open = true` would be a no-op anyway.
   */
  expandAll(): void {
    const items = this._directChildItems().filter((i) => !i.disabled);
    if (items.length === 0) return;
    if (this.single) {
      items[0].open = true;
      return;
    }
    for (const item of items) {
      item.open = true;
    }
  }

  /**
   * Close every direct-child item. Disabled items are skipped (their
   * setter rejects the change), matching the contract that `disabled`
   * freezes the item's state.
   */
  collapseAll(): void {
    for (const item of this._directChildItems()) {
      item.open = false;
    }
  }

  /**
   * Single-mode coordination. Each accordion is responsible for
   * coordinating ONLY its direct-descendant items (items whose
   * closest accordion ancestor is `this`). The same event-handling
   * code runs on any nested accordion ancestor, but each instance
   * filters to its own children.
   *
   * On a match we `stopPropagation()` so the internal coordination
   * event doesn't leak past the accordion to ancestor listeners
   * (e.g. an outer `<civ-form>` analytics catch-all). The public
   * `civ-toggle` event remains the consumer-facing signal.
   */
  private _onItemToggle = (e: CustomEvent<{ open: boolean }>): void => {
    const target = e.target as Element | null;
    if (!target || target.closest('civ-accordion') !== this) return;

    e.stopPropagation();

    if (!this.single || !e.detail.open) return;

    for (const item of this._directChildItems()) {
      if (item !== target && item.open) {
        item.open = false;
      }
    }
  };

  /**
   * ARIA APG keyboard pattern. ArrowDown / ArrowUp move between
   * item headers; Home / End jump to first / last. Disabled items
   * are skipped. Only acts when focus is on a `<summary>` belonging
   * to one of THIS accordion's direct-child items — nested
   * accordions' summaries are handled by their own listener.
   */
  private _onKeydown = (e: KeyboardEvent): void => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const target = e.target as Element | null;
    if (!target || target.tagName !== 'SUMMARY') return;
    const item = target.closest('civ-accordion-item') as CivAccordionItem | null;
    if (!item || item.closest('civ-accordion') !== this) return;

    const items = this._directChildItems().filter((i) => !i.disabled);
    if (items.length === 0) return;
    const currentIdx = items.indexOf(item);
    if (currentIdx < 0) return;

    let nextIdx = currentIdx;
    switch (e.key) {
      case 'ArrowDown':
        nextIdx = (currentIdx + 1) % items.length;
        break;
      case 'ArrowUp':
        nextIdx = (currentIdx - 1 + items.length) % items.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = items.length - 1;
        break;
    }

    e.preventDefault();
    items[nextIdx].querySelector<HTMLElement>('summary')?.focus();
  };

  /** Items whose closest accordion ancestor is THIS accordion. */
  private _directChildItems(): CivAccordionItem[] {
    return Array.from(
      this.querySelectorAll<CivAccordionItem>('civ-accordion-item'),
    ).filter((item) => item.closest('civ-accordion') === this);
  }

  /** Keep the first open direct-child item; close the rest. */
  private _enforceSingleOpen(): void {
    let kept = false;
    for (const item of this._directChildItems()) {
      if (item.open) {
        if (kept) {
          item.open = false;
        } else {
          kept = true;
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-accordion': CivAccordion;
  }
}
