import { customElement, property } from 'lit/decorators.js';
import { CivBaseElement, warnInvalidProp } from '@civui/core';

export type CalloutVariant = 'default' | 'info' | 'warning' | 'error' | 'success';

const VALID_VARIANTS: ReadonlySet<CalloutVariant> = new Set([
  'default',
  'info',
  'warning',
  'error',
  'success',
]);

/**
 * CivUI Callout
 *
 * A presentational primitive that frames slotted content with a left
 * accent border and consistent padding. Five color variants map to the
 * semantic palette: `default` (primary), `info`, `warning`, `error`,
 * `success`.
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
 * @element civ-callout
 *
 * @prop {CalloutVariant} variant - Accent border color
 *
 * @example
 * ```html
 * <civ-callout>
 *   <p class="civ-font-bold civ-mb-1">Note</p>
 *   <p>You must complete this section before continuing.</p>
 * </civ-callout>
 *
 * <civ-callout variant="warning">
 *   <p>Your session will expire in 15 minutes.</p>
 * </civ-callout>
 *
 * <!-- As a labelled landmark — role goes on the callout itself. -->
 * <civ-callout variant="warning" role="region" aria-labelledby="h">
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
  variant: CalloutVariant = 'default';

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
    if (changed.has('variant') && !VALID_VARIANTS.has(this.variant)) {
      warnInvalidProp(
        'civ-callout',
        'variant',
        "one of 'default' | 'info' | 'warning' | 'error' | 'success'",
        this.variant,
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-callout': CivCallout;
  }
}
