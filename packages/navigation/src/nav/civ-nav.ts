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

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-nav-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <nav class="civ-nav" aria-label="${ifDefined(this.label || undefined)}">
        <ul class="civ-nav__list" data-civ-nav-content></ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-nav': CivNav;
  }
}
