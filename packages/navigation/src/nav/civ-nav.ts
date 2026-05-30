import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Nav
 *
 * Top-level horizontal site navigation. Renders a `<nav>` landmark with
 * a horizontal `<ul>` of `<civ-nav-item>` links. The active item should
 * set `current` — that item renders with `aria-current="page"` and a
 * visual indicator (underline / bold).
 *
 * Single-level only — submenus and dropdowns are deliberately out of
 * scope for v1. Use a separate menu component for those.
 *
 * @element civ-nav
 *
 * @prop {string} label - Accessible name for the navigation landmark
 *   (e.g. "Primary navigation", "Footer navigation"). Set this when a
 *   page renders more than one `<nav>` so screen-reader landmark
 *   navigation can distinguish them.
 *
 * @prop {string} emphasis - Typographic weight of the nav links.
 *   `primary` (default) is the bold, primary-site-navigation treatment
 *   with the heavier active/hover accent bar. `secondary` switches to
 *   normal-weight links and a thinner accent bar — the quiet treatment
 *   used for footer / utility navigation, mirroring `civ-side-nav`'s
 *   `secondary` emphasis. The default is the inverse of `civ-side-nav`
 *   (which defaults to `secondary`) because a top nav is usually the
 *   primary surface while a side nav is usually a sub-nav.
 *
 * @slot - `<civ-nav-item>` children.
 *
 * @example
 * ```html
 * <civ-nav label="Primary navigation">
 *   <civ-nav-item href="/" label="Home" current></civ-nav-item>
 *   <civ-nav-item href="/benefits" label="Benefits"></civ-nav-item>
 *   <civ-nav-item href="/contact" label="Contact"></civ-nav-item>
 * </civ-nav>
 * ```
 */
@customElement('civ-nav')
export class CivNav extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = '';

  /**
   * Typographic weight. `primary` renders the bold, primary-site-nav
   * treatment; `secondary` renders the quiet, normal-weight treatment
   * used for footer / utility nav (mirrors `civ-side-nav`).
   */
  @property({ type: String, reflect: true }) emphasis: 'primary' | 'secondary' = 'primary';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-nav-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    const classes = [
      'civ-nav',
      this.emphasis === 'secondary' ? 'civ-nav--secondary' : '',
    ].filter(Boolean).join(' ');
    return html`
      <nav class="${classes}" aria-label="${ifDefined(this.label || undefined)}">
        <ul role="list" class="civ-nav__list" data-civ-nav-content></ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-nav': CivNav;
  }
}
