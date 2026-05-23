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
@customElement('civ-accordion')
export class CivAccordion extends LightDomSlotMixin(CivBaseElement) {
  /** When true, opening one item closes any other open siblings. */
  @property({ type: Boolean, reflect: true }) single = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-accordion-content]' };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('civ-accordion-item-toggle', this._onItemToggle as EventListener);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('civ-accordion-item-toggle', this._onItemToggle as EventListener);
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this._relocateSlots();
    // Items may ship pre-authored with `open`. In `single` mode we
    // need to reconcile to one-open-at-a-time on first paint.
    if (this.single) this._enforceSingleOpen();
  }

  /**
   * Reconcile when `single` is toggled at runtime. If a consumer
   * flips `single` to true on an accordion with multiple open
   * items, keep the first open item and close the rest.
   */
  override updated(changes: Map<PropertyKey, unknown>): void {
    super.updated(changes);
    if (changes.has('single') && this.single && changes.get('single') === false) {
      this._enforceSingleOpen();
    }
  }

  override render() {
    return html`
      <div class="civ-accordion__inner" data-civ-accordion-content></div>
    `;
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
