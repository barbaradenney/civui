// Schema: packages/schema/src/components/civ-accordion-item.schema.ts

import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin, warnInvalidProp } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Accordion Item
 *
 * One full-width expandable row inside `<civ-accordion>`. Composes
 * the same visual language as `<civ-disclosure>` — chevron caret
 * beside the label, 90° rotation on open — but renders as a full-row
 * trigger with a larger tap target. Built on native
 * `<details>`/`<summary>` so it works without JavaScript and is
 * announced as a disclosure widget by every screen reader.
 *
 * `headingLevel` (1–6) optionally wraps the label in an `<h1>`–`<h6>`
 * so screen-reader rotor users can jump between accordion sections.
 * The visual treatment is held constant across all levels — the
 * heading element only affects assistive-tech navigation, not the
 * rendered font size or weight.
 *
 * `disabled` rejects both user-clicks AND programmatic `open`
 * changes. While disabled, the trigger has `aria-disabled="true"`
 * and `tabindex="-1"`, removing it from the tab order; mouse and
 * keyboard activation are intercepted before the `<details>` paints
 * the expanded state. A parent `<civ-accordion disabled>` cascades
 * the same disabled treatment to every direct-child item — the
 * effective disabled state is `this.disabled || parent.disabled`.
 *
 * The component dispatches `civ-toggle` (non-bubbling, mirrors
 * civ-disclosure) on EVERY open-state transition — user-initiated
 * OR parent-driven (e.g. `<civ-accordion single>` collapsing a
 * sibling). Consumers tracking open state subscribe to `civ-toggle`
 * and don't have to differentiate the source. An internal
 * `civ-accordion-item-toggle` event (bubbling) is used by the
 * parent `<civ-accordion>` to coordinate `single`-open mode.
 *
 * @element civ-accordion-item
 *
 * @prop {string} label - Header text rendered on the trigger row
 * @prop {boolean} open - Whether the panel is currently expanded
 * @prop {boolean} disabled - Disables interaction; rejects user-clicks and programmatic open changes
 * @prop {number} headingLevel - 1–6 wraps the label in an `<h1>`–`<h6>` for screen-reader navigation
 *
 * @fires civ-toggle - When the open/closed state changes (any source), detail: { open }
 * @fires civ-accordion-item-toggle - Bubbling internal coordination event used by the parent `<civ-accordion>` for single-open mode. Subscribe to `civ-toggle` instead — this event is not part of the public consumer API
 * @fires civ-analytics - Analytics tracking on toggle
 *
 * @slot - Panel content rendered when open
 */
@customElement('civ-accordion-item')
export class CivAccordionItem extends LightDomSlotMixin(CivBaseElement) {
  /** Header text shown on the full-width trigger row. */
  @property({ type: String }) label = '';

  /**
   * Disables interaction. While true, both user-clicks AND
   * programmatic `el.open = …` are rejected. The trigger gets
   * `aria-disabled="true"` and `tabindex="-1"` so keyboard users
   * skip it.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Wrap the label in an `<h1>`–`<h6>` for screen-reader rotor
   * navigation. Visual treatment stays constant across levels.
   * Values outside 1–6 (or non-integers) trigger a dev-mode
   * warning and fall back to a `<span>`.
   */
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Whether the panel is currently expanded.
   *
   * Uses a manual accessor so we can gate runtime programmatic
   * changes on the effective disabled state — the auto-generated
   * Lit setter would accept the change and let Lit reflect it to
   * `<details>`, defeating the disabled contract. The gate only
   * applies after `firstUpdated()` so initial markup
   * (`<civ-accordion-item disabled open>`) paints in its authored
   * state. The check also reads the parent accordion's `disabled`
   * so `<civ-accordion disabled>` cascades to every child.
   */
  @property({ type: Boolean, reflect: true })
  get open(): boolean { return this._open; }
  set open(value: boolean) {
    if (this._initialized && this._effectivelyDisabled && value !== this._open) {
      // Reject runtime programmatic changes while disabled — the
      // user-click revert in `_onToggle` handles the equivalent
      // browser-initiated path.
      return;
    }
    const old = this._open;
    if (old === value) return;
    this._open = value;
    this.requestUpdate('open', old);
  }

  /**
   * Effective disabled state: the item is treated as disabled if
   * EITHER its own `disabled` prop is true OR the nearest ancestor
   * `<civ-accordion>` has `disabled` set. The parent ripples a
   * `requestUpdate()` to children when its `disabled` flips so the
   * computed state stays in sync.
   */
  private get _effectivelyDisabled(): boolean {
    if (this.disabled) return true;
    const parent = this.closest('civ-accordion') as
      | (HTMLElement & { disabled?: boolean })
      | null;
    return !!parent?.disabled;
  }

  private _open = false;
  private _initialized = false;
  private _invalidLevelWarned = false;

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-accordion-item-content]' };
  }

  override firstUpdated(): void {
    // Mark the component as past initial render. After this point,
    // the `open` setter's disabled gate becomes active. Before this
    // point, attribute-driven initial state (`<civ-accordion-item
    // disabled open>`) is allowed through.
    this._initialized = true;
  }

  /**
   * Dispatch `civ-toggle` and `civ-accordion-item-toggle` whenever
   * `open` transitions to a new value — regardless of whether the
   * change came from a user click, a programmatic property set, or
   * a parent-driven single-mode collapse. Centralizing the dispatch
   * here means consumers see every state change exactly once.
   *
   * `changes.get('open') === undefined` indicates the initial set
   * (Lit's first-update bookkeeping uses undefined as the previous
   * value when a property was set from an attribute), so we skip
   * dispatch on mount.
   */
  override updated(changes: Map<PropertyKey, unknown>): void {
    super.updated(changes);
    if (changes.has('open') && changes.get('open') !== undefined) {
      this.dispatchEvent(new CustomEvent('civ-toggle', {
        detail: { open: this.open },
        bubbles: false,
        composed: false,
      }));
      this.dispatchEvent(new CustomEvent('civ-accordion-item-toggle', {
        detail: { open: this.open },
        bubbles: true,
        composed: false,
      }));
      this.sendAnalytics('change', { open: this.open });
    }
  }

  override render() {
    const disabled = this._effectivelyDisabled;
    return html`
      <details
        class="civ-accordion-item"
        ?open="${this.open}"
        @toggle="${this._onToggle}"
      >
        <summary
          class="civ-accordion-item__trigger"
          aria-disabled="${ifDefined(disabled ? 'true' : undefined)}"
          tabindex="${ifDefined(disabled ? '-1' : undefined)}"
        >
          <civ-icon name="chevron-right" class="civ-accordion-item__icon" aria-hidden="true"></civ-icon>
          ${this._renderLabel()}
        </summary>
        <div class="civ-accordion-item__content" data-civ-accordion-item-content></div>
      </details>
    `;
  }

  private _renderLabel(): TemplateResult {
    const cls = 'civ-accordion-item__label';
    const level = this.headingLevel;
    if (
      level !== undefined &&
      (!Number.isInteger(level) || level < 1 || level > 6) &&
      !this._invalidLevelWarned
    ) {
      this._invalidLevelWarned = true;
      warnInvalidProp(
        'civ-accordion-item',
        'heading-level',
        'an integer between 1 and 6',
        level,
      );
    }
    switch (level) {
      case 1: return html`<h1 class="${cls}">${this.label}</h1>`;
      case 2: return html`<h2 class="${cls}">${this.label}</h2>`;
      case 3: return html`<h3 class="${cls}">${this.label}</h3>`;
      case 4: return html`<h4 class="${cls}">${this.label}</h4>`;
      case 5: return html`<h5 class="${cls}">${this.label}</h5>`;
      case 6: return html`<h6 class="${cls}">${this.label}</h6>`;
      default: return html`<span class="${cls}">${this.label}</span>`;
    }
  }

  /**
   * Sync native `<details>` open state back to the component
   * property. When disabled, revert the browser's optimistic toggle
   * before any visible state appears. The `_onToggle` path only
   * fires for user-initiated activation — programmatic `el.open = …`
   * changes are gated in the setter above.
   *
   * When the change is allowed, set `this.open = details.open`. The
   * setter triggers Lit's update cycle, which `updated()` observes
   * and uses to dispatch `civ-toggle` / `civ-accordion-item-toggle`.
   */
  private _onToggle(e: Event): void {
    const details = e.target as HTMLDetailsElement;
    if (details.open === this.open) return;
    if (this._effectivelyDisabled) {
      details.open = this.open;
      return;
    }
    this.open = details.open;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-accordion-item': CivAccordionItem;
  }
}
