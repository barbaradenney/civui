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
 * vertical `<ul>` of `<civ-side-nav-item>` links. The active item
 * should set `current` — that item renders with `aria-current="page"`
 * plus a leading-edge primary-color accent rail.
 *
 * Sub-sections are expressed by nesting `<civ-side-nav-item>`
 * elements inside another item's default slot. The nested items
 * render as an indented sub-list under the parent. Two levels of
 * nesting is the typical pattern; deeper hierarchies are
 * structurally supported but read as cluttered.
 *
 * @element civ-side-nav
 *
 * @prop {string} label - Accessible name for the navigation
 *   landmark (e.g. "Documentation navigation"). Strongly
 *   recommended when the page contains more than one `<nav>`.
 *
 * @slot - `<civ-side-nav-item>` children.
 *
 * @example
 * ```html
 * <civ-side-nav label="Documentation">
 *   <civ-side-nav-item href="/intro" label="Introduction"></civ-side-nav-item>
 *   <civ-side-nav-item href="/components" label="Components" current>
 *     <civ-side-nav-item href="/components/button" label="Button"></civ-side-nav-item>
 *     <civ-side-nav-item href="/components/input" label="Input"></civ-side-nav-item>
 *   </civ-side-nav-item>
 * </civ-side-nav>
 * ```
 */
@customElement('civ-side-nav')
export class CivSideNav extends LightDomSlotMixin(CivBaseElement) {
  /** Accessible name for the `<nav>` landmark. */
  @property({ type: String }) label = '';

  override _getSlotConfig(): SlotConfig {
    return { default: '[data-civ-side-nav-content]' };
  }

  override firstUpdated(): void {
    this._relocateSlots();
  }

  override render() {
    return html`
      <nav class="civ-side-nav" aria-label="${ifDefined(this.label || undefined)}">
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
