import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, warnInvalidProp } from '@civui/core';

export type CalloutIntent = 'default' | 'info' | 'warning' | 'error' | 'success';
export type CalloutEmphasis = 'primary' | 'secondary';
export type CalloutSpacing = 'default' | 'sm';

const VALID_INTENTS: ReadonlySet<CalloutIntent> = new Set([
  'default',
  'info',
  'warning',
  'error',
  'success',
]);

const VALID_EMPHASIS: ReadonlySet<CalloutEmphasis> = new Set(['primary', 'secondary']);

const VALID_SPACING: ReadonlySet<CalloutSpacing> = new Set(['default', 'sm']);

/**
 * CivUI Callout
 *
 * A presentational primitive that frames slotted content with a left
 * accent border and consistent padding. Five color variants: `default`
 * (neutral gray, no urgency) plus four semantic palette variants —
 * `info`, `warning`, `error`, `success`.
 *
 * Use for important notices, tips, or contextual information. For
 * dismissible / live-region alerts (status + ARIA), use `civ-alert`
 * instead. For section openers with a heading slot, use
 * `civ-section-intro` (which composes `civ-callout` internally).
 *
 * Content is authored as direct children (Light DOM) — paragraphs,
 * lists, links, and other markup flow naturally. The host element
 * carries no ARIA role of its own; if you need a landmark, set
 * `role="region"` (or `role="complementary"`) AND `aria-labelledby`
 * directly on the `<civ-callout>` element so the labelled bounding
 * box and the visual chrome (border + padding) coincide. Do not wrap
 * the callout in an outer `<div role="region">` — the labelled region
 * would then exclude the callout's visual chrome from its bounding
 * box.
 *
 * **Render-root contract.** This component is a styled host with no
 * rendered template. `createRenderRoot()` returns a fresh detached
 * `<div>` so the host's authored Light-DOM children survive Lit's
 * update cycle, and composition inside other LightDomSlotMixin
 * components (e.g. `civ-section-intro`) is race-free. Consequences a
 * future maintainer should know:
 *  - **No `render()` allowed.** Any output a `render()` method
 *    returns would land in the orphan div and never reach the page.
 *  - **No `static styles` allowed.** `adoptStyles` runs against the
 *    detached div, so component-scoped CSS would be dropped. Add
 *    styles to `packages/core/src/styles/components.css` instead.
 *
 * **Weight.** `callout-style="primary"` (default) keeps the 5px
 * accent rail; `callout-style="secondary"` drops the rail to 3px for
 * a quieter affordance that doesn't compete with body content when
 * stacked next to primary surfaces. Padding, variant colors, and
 * content layout stay identical so the two styles read as the same
 * family at different weights.
 *
 * @element civ-callout
 *
 * @prop {CalloutIntent} intent - Accent border color
 * @prop {CalloutEmphasis} emphasis - `primary` (default, 5px rail) or `secondary` (3px rail for subtle emphasis)
 * @prop {CalloutSpacing} spacing - Inner padding density. `default` (12/16px) or `sm` (8/12px) for placements inside dense surfaces (data-grid empty state, sidebar notes)
 *
 * @example
 * ```html
 * <civ-callout>
 *   <p class="civ-font-bold civ-mb-1">Note</p>
 *   <p>You must complete this section before continuing.</p>
 * </civ-callout>
 *
 * <civ-callout intent="warning">
 *   <p>Your session will expire in 15 minutes.</p>
 * </civ-callout>
 *
 * <civ-callout intent="info" emphasis="secondary">
 *   <p>You can return to this section later from your dashboard.</p>
 * </civ-callout>
 *
 * <!-- As a labelled landmark — role goes on the callout itself. -->
 * <civ-callout intent="warning" role="region" aria-labelledby="h">
 *   <p id="h" class="civ-font-bold">Important notice</p>
 *   <p>Body text.</p>
 * </civ-callout>
 * ```
 */
@customElement('civ-callout')
export class CivCallout extends CivBaseElement {
  /**
   * Accent border color. With `useDefault: true`, the initial
   * `'default'` value is NOT reflected to the attribute — so a plain
   * `<civ-callout>` host has no `variant` attribute and the base
   * `civ-callout { … }` CSS rule applies. Removing the attribute
   * restores the property to `'default'` rather than leaving it null.
   */
  @property({ type: String, reflect: true, useDefault: true })
  intent: CalloutIntent = 'default';

  /**
   * Visual weight. `primary` keeps the 5px accent rail (the
   * established callout treatment); `secondary` drops it to 3px for
   * a subtler affordance. With `useDefault: true` the initial
   * `'primary'` value is NOT reflected to the attribute, so plain
   * `<civ-callout>` markup matches today's rendered output exactly
   * — the secondary rule only kicks in when the attribute is
   * explicitly set to `'secondary'`.
   */
  @property({ type: String, reflect: true, useDefault: true, attribute: 'emphasis' })
  emphasis: CalloutEmphasis = 'primary';

  /**
   * Inner padding density. `default` keeps the established 12px / 16px
   * padding; `sm` shrinks to 8px / 12px (one step on the spacing
   * ladder) for placements inside dense surfaces — data-grid empty
   * states, compact reference tables, sidebar notes. Pure shrink only;
   * the accent rail, intent colors, and content layout are unchanged.
   * `useDefault: true` keeps the initial `'default'` value off the
   * attribute so plain `<civ-callout>` markup matches today's output.
   */
  @property({ type: String, reflect: true, useDefault: true })
  spacing: CalloutSpacing = 'default';

  /**
   * Render into a detached throwaway root. See the class-level JSDoc
   * for the design rationale and the two constraints this imposes
   * (no `render()`, no `static styles`).
   *
   * The cast widens the parent's `this`-typed return — Lit only needs
   * an `HTMLElement | DocumentFragment` at runtime, and never reads
   * the static type. CivBaseElement's contract is preserved at every
   * call site that DOES depend on the renderRoot being the host
   * (Light DOM components); this single subclass deliberately opts
   * out.
   */
  protected override createRenderRoot(): this {
    return document.createElement('div') as unknown as this;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('intent') && !VALID_INTENTS.has(this.intent)) {
      warnInvalidProp(
        'civ-callout',
        'intent',
        "one of 'default' | 'info' | 'warning' | 'error' | 'success'",
        this.intent,
      );
    }
    if (changed.has('emphasis') && !VALID_EMPHASIS.has(this.emphasis)) {
      warnInvalidProp(
        'civ-callout',
        'emphasis',
        "one of 'primary' | 'secondary'",
        this.emphasis,
      );
    }
    if (changed.has('spacing') && !VALID_SPACING.has(this.spacing)) {
      warnInvalidProp(
        'civ-callout',
        'spacing',
        "one of 'default' | 'sm'",
        this.spacing,
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-callout': CivCallout;
  }
}
