import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type CalloutVariant = 'default' | 'info' | 'warning' | 'error' | 'success';

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
 * carries no ARIA role of its own; if you need a landmark (`region`,
 * `complementary`), wrap or attribute the host directly.
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
 * ```
 */
@customElement('civ-callout')
export class CivCallout extends LitElement {
  /** Accent border color. */
  @property({ type: String, reflect: true }) variant: CalloutVariant = 'default';

  /**
   * Render into a detached throwaway root. The component is a styled
   * host element — all visible content is authored children that live
   * directly in Light DOM. Using a detached render root prevents Lit
   * from clearing those children on update, and keeps composition
   * inside other LightDomSlotMixin components (e.g. `civ-section-intro`)
   * race-free.
   */
  protected override createRenderRoot(): HTMLElement {
    return document.createElement('div');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-callout': CivCallout;
  }
}
