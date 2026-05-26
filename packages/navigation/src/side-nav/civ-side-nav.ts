// Schema: packages/schema/src/components/civ-side-nav.schema.ts

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Side Nav
 *
 * Vertical, hierarchical navigation panel — typically a left-rail
 * in documentation pages, admin layouts, or any view with a
 * stable secondary navigation. Renders a `<nav>` landmark with a
 * vertical `<ul>` of `<civ-side-nav-item>` rows.
 *
 * The active page sets `current` on its **leaf** row — that row
 * renders with `aria-current="page"` plus a leading-edge
 * primary-color accent rail. Sub-sections are expressed by
 * nesting `<civ-side-nav-item>` elements; a parent with nested
 * children automatically renders as a disclosure (chevron caret
 * + collapsible sublist) instead of a link. On first paint, any
 * parent containing a descendant with `current` is automatically
 * expanded so the active page is visible in the rail.
 *
 * Two levels of nesting is the typical pattern; deeper
 * hierarchies are structurally supported but read as cluttered.
 *
 * @element civ-side-nav
 *
 * @prop {string} label - Accessible name for the navigation
 *   landmark (e.g. "Documentation navigation"). Strongly
 *   recommended when the page contains more than one `<nav>`.
 *
 * @prop {string} spacing - Tap-target density. `default` (~36px row
 *   height) sits within WCAG 2.5.8 AA but is sub-AAA. `lg` bumps
 *   every link / trigger to the WCAG 2.5.5 AAA 44px floor —
 *   preferred for mobile-primary surfaces, fingertip-heavy
 *   contexts, and accessibility-conscious government deployments.
 *   Controls padding only; combine with `emphasis="primary"` to
 *   also match civ-nav's bolder typography.
 *
 * @prop {string} emphasis - Typographic weight. `secondary`
 *   (default) renders rows in the normal body weight — quiet
 *   secondary-navigation treatment. `primary` swaps in bold body
 *   text, exactly matching `civ-nav`'s top-level treatment, so the
 *   rail reads as primary site navigation rather than a sub-nav
 *   inside a section. Controls font weight + size only; combine
 *   with `spacing="lg"` for the full mobile-primary look.
 *
 * @slot - `<civ-side-nav-item>` children.
 *
 * @example
 * ```html
 * <civ-side-nav label="Documentation">
 *   <civ-side-nav-item href="/intro" label="Introduction"></civ-side-nav-item>
 *   <civ-side-nav-item label="Components">
 *     <civ-side-nav-item href="/components/button" label="Button" current></civ-side-nav-item>
 *     <civ-side-nav-item href="/components/input" label="Input"></civ-side-nav-item>
 *   </civ-side-nav-item>
 * </civ-side-nav>
 * ```
 */
@customElement('civ-side-nav')
export class CivSideNav extends LightDomSlotMixin(CivBaseElement) {
  /** Accessible name for the `<nav>` landmark. */
  @property({ type: String }) label = '';

  /**
   * Tap-target density. `default` keeps the compact rail; `lg`
   * raises every row's padding + min-height to the WCAG 2.5.5
   * AAA 44px floor. Reflected so the cascade selectors in
   * components.css can find it.
   */
  @property({ type: String, reflect: true }) spacing: 'default' | 'lg' = 'default';

  /**
   * Typographic weight. `secondary` renders the normal-weight,
   * quiet treatment used for sub-navigation. `primary` swaps in
   * the bold body-sized treatment that matches `civ-nav`,
   * elevating the rail to read as primary site navigation.
   */
  @property({ type: String, reflect: true }) emphasis: 'primary' | 'secondary' = 'secondary';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-side-nav-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const classes = [
      'civ-side-nav',
      this.spacing === 'lg' ? 'civ-side-nav--lg' : '',
      this.emphasis === 'primary' ? 'civ-side-nav--primary' : '',
    ].filter(Boolean).join(' ');
    return html`
      <nav class="${classes}" aria-label="${ifDefined(this.label || undefined)}">
        <ul class="civ-side-nav__list" data-civ-side-nav-content></ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-side-nav': CivSideNav;
  }
}
