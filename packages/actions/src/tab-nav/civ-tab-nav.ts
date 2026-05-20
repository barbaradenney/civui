import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CivBaseElement, LightDomSlotMixin } from '@civui/core';
import type { SlotConfig } from '@civui/core';

/**
 * CivUI Tab Nav
 *
 * Section navigation styled as tabs — each item is a real `<a href>` that
 * navigates the browser. Use this when the URL is the source of truth for
 * which tab is active (one route per tab, deep-linkable, back-button
 * friendly).
 *
 * Renders a `<nav>` landmark containing a horizontal `<ul>` of
 * `<civ-tab-nav-item>` links. The active item should set `current` —
 * it gets `aria-current="page"` plus the active-tab visual.
 *
 * Not a `role="tablist"` — these are real links, not tabs in the ARIA
 * sense. There are no panels, no roving tabindex, and the browser
 * handles focus naturally. If you want in-page tab switching with
 * panels, use `<civ-tabs>` instead.
 *
 * @element civ-tab-nav
 *
 * @prop {string} label - Accessible name for the navigation landmark
 *   (e.g. "Section navigation", "Settings sections"). Set this when a
 *   page renders more than one `<nav>` so screen-reader landmark
 *   navigation can distinguish them.
 *
 * @slot - `<civ-tab-nav-item>` children.
 *
 * @example
 * ```html
 * <civ-tab-nav label="Repository sections">
 *   <civ-tab-nav-item href="/repo" label="Code" current></civ-tab-nav-item>
 *   <civ-tab-nav-item href="/repo/issues" label="Issues"></civ-tab-nav-item>
 *   <civ-tab-nav-item href="/repo/pulls" label="Pull requests"></civ-tab-nav-item>
 * </civ-tab-nav>
 * ```
 */
@customElement('civ-tab-nav')
export class CivTabNav extends LightDomSlotMixin(CivBaseElement) {
  @property({ type: String }) label = '';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-tab-nav-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <nav class="civ-tab-nav" aria-label="${ifDefined(this.label || undefined)}">
        <ul class="civ-tab-nav__list" data-civ-tab-nav-content></ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'civ-tab-nav': CivTabNav;
  }
}
